package com.project.mycanteen.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.mycanteen.dto.ApiResponse;
import com.project.mycanteen.dto.CanteenDto;
import com.project.mycanteen.dto.OrderDto;
import com.project.mycanteen.dto.OrderItemDto;
import com.project.mycanteen.dto.PageResponseDto;
import com.project.mycanteen.dto.PlaceOrderRequestDto;
import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.Item;
import com.project.mycanteen.entity.Order;
import com.project.mycanteen.entity.OrderItem;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.entity.CanteenMember;
import com.project.mycanteen.entity.type.CanteenMembershipStatus;
import com.project.mycanteen.entity.type.EntityStatus;
import com.project.mycanteen.entity.type.OrderStatus;
import com.project.mycanteen.entity.type.OrderType;
import com.project.mycanteen.entity.type.RoleType;
import com.project.mycanteen.error.BadRequestException;
import com.project.mycanteen.error.ForbiddenException;
import com.project.mycanteen.error.ResourceNotFoundException;
import com.project.mycanteen.repository.CanteenMemberRepository;
import com.project.mycanteen.repository.CanteenRepository;
import com.project.mycanteen.repository.ItemRepository;
import com.project.mycanteen.repository.OrderItemRepository;
import com.project.mycanteen.repository.OrderRepository;
import com.project.mycanteen.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CanteenRepository canteenRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final CanteenMemberRepository canteenMemberRepository;

    /** Orders still being worked on; the rest (completed or cancelled) are previous orders. */
    private static final Set<OrderStatus> ACTIVE_STATUSES =
            Set.of(OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY);
    private static final Set<OrderStatus> PAST_STATUSES = Set.of(OrderStatus.COMPLETED, OrderStatus.CANCELLED);

    @Transactional
    public List<OrderDto> placeOrder(UUID customerId, PlaceOrderRequestDto request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item.");
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", customerId));

        var groupedItems = request.getItems().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        item -> item.getCanteenId() != null ? item.getCanteenId() : request.getCanteenId(),
                        java.util.stream.Collectors.toList()
                ));

        if (groupedItems.isEmpty()) {
            throw new BadRequestException("No valid canteen found for the requested order.");
        }

        List<OrderDto> createdOrders = new ArrayList<>();
        for (var entry : groupedItems.entrySet()) {
            UUID canteenId = entry.getKey();
            if (canteenId == null) {
                throw new BadRequestException("Each item must belong to a canteen.");
            }

            Canteen canteen = canteenRepository.findById(canteenId)
                    .orElseThrow(() -> new ResourceNotFoundException("Canteen", canteenId));

            Order order = Order.builder()
                    .customer(customer)
                    .canteen(canteen)
                    .status(OrderStatus.PLACED)
                    .receiverName(request.getReceiverName())
                    .type(request.getType() == null ? OrderType.PICKUP : request.getType())
                    .selectedTimeRange(request.getSelectedTimeRange())
                    .createdAt(new Date())
                    .updatedAt(new Date())
                    .build();
            order = orderRepository.save(order);

            List<OrderItem> savedItems = new ArrayList<>();
            for (var itemRequest : entry.getValue()) {
                Item item = itemRepository.findById(itemRequest.getItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Item", itemRequest.getItemId()));

                if (!item.getCanteen().getId().equals(canteenId)) {
                    throw new BadRequestException("Item does not belong to the selected canteen.");
                }

                int quantity = itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0 ? 1 : itemRequest.getQuantity();
                float unitPrice = item.getUnitPrice();
                float discount = item.getDiscount();
                float finalPrice = (unitPrice * quantity) - (discount * quantity);

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .item(item)
                        .quantity(quantity)
                        .unitPrice(unitPrice)
                        .discount(discount)
                        .finalPrice(Math.max(finalPrice, 0))
                        .createdAt(new Date())
                        .updatedAt(new Date())
                        .build();
                savedItems.add(orderItemRepository.save(orderItem));
            }

            order.setOrderItems(savedItems);
            createdOrders.add(toDto(order));
        }

        return createdOrders;
    }

    /** @param active true for current orders, false for previous ones, null for all */
    @Transactional(readOnly = true)
    public PageResponseDto<OrderDto> getCustomerOrders(UUID customerId, Boolean active, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = active == null
                ? orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable)
                : orderRepository.findByCustomerIdAndStatusInOrderByCreatedAtDesc(customerId, statusesFor(active), pageable);
        return toPageResponse(orders);
    }

    /** @param active true for current orders, false for previous ones, null for all */
    @Transactional(readOnly = true)
    public PageResponseDto<OrderDto> getCanteenOrders(User user, UUID canteenId, Boolean active, int page, int size) {
        requireCanteenStaff(user, canteenId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = active == null
                ? orderRepository.findByCanteenIdOrderByCreatedAtDesc(canteenId, pageable)
                : orderRepository.findByCanteenIdAndStatusInOrderByCreatedAtDesc(canteenId, statusesFor(active), pageable);
        return toPageResponse(orders);
    }

    /** Canteens whose orders the user may see and update: every active canteen for admins, owned ones for owners, active memberships for staff. */
    @Transactional(readOnly = true)
    public List<CanteenDto> getManagedCanteens(User user) {
        List<Canteen> canteens;
        if (user.getRoles().contains(RoleType.ADMIN)) {
            canteens = canteenRepository.findByStatus(EntityStatus.ACTIVE);
        } else {
            canteens = new ArrayList<>(canteenRepository.findByOwnerId(user.getId()));
            canteenMemberRepository.findByMemberIdAndStatus(user.getId(), CanteenMembershipStatus.ACTIVE).stream()
                    .map(CanteenMember::getCanteen)
                    .filter(c -> canteens.stream().noneMatch(o -> o.getId().equals(c.getId())))
                    .forEach(canteens::add);
        }
        return canteens.stream()
                .sorted(Comparator.comparing(Canteen::getName, String.CASE_INSENSITIVE_ORDER))
                .map(c -> CanteenDto.builder().id(c.getId()).name(c.getName()).build())
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponseDto<OrderDto> getHotOrders(User user, UUID canteenId, int page, int size) {
        requireCanteenStaff(user, canteenId);
        Date now = new Date();
        Date twoHoursAgo = new Date(now.getTime() - (2L * 60 * 60 * 1000));
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByCanteenIdAndCreatedAtAfterOrderByCreatedAtAsc(canteenId, twoHoursAgo, pageable);
        return toPageResponse(orders);
    }

    @Transactional(readOnly = true)
    public PageResponseDto<OrderDto> getUpcomingOrders(User user, UUID canteenId, int page, int size) {
        requireCanteenStaff(user, canteenId);
        Date now = new Date();
        Date twoHoursAgo = new Date(now.getTime() - (2L * 60 * 60 * 1000));
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByCanteenIdAndCreatedAtBeforeOrderByCreatedAtAsc(canteenId, twoHoursAgo, pageable);
        return toPageResponse(orders);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrder(User user, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (!isCustomerOf(user, order) && !isCanteenStaff(user, order.getCanteen().getId())) {
            throw new ForbiddenException("You do not have access to this order.");
        }
        return toDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(User user, UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (status == null) {
            throw new BadRequestException("Order status is required.");
        }

        // Canteen staff can move an order through any status; customers can only cancel their own order before the canteen confirms it
        if (!isCanteenStaff(user, order.getCanteen().getId())) {
            if (!isCustomerOf(user, order)) {
                throw new ForbiddenException("You do not have access to this order.");
            }
            if (status != OrderStatus.CANCELLED || order.getStatus() != OrderStatus.PLACED) {
                throw new ForbiddenException("You can only cancel an order before the canteen confirms it.");
            }
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cancelled order cannot be changed.");
        }

        if (status == OrderStatus.CANCELLED && order.getStatus() == OrderStatus.COMPLETED) {
            throw new BadRequestException("Completed order cannot be cancelled.");
        }

        order.setStatus(status);
        order.setUpdatedAt(new Date());
        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto rateOrder(User user, UUID orderId, int rating) {
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (!isCustomerOf(user, order)) {
            throw new ForbiddenException("Only the customer who placed the order can rate it.");
        }
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException("Only completed orders may be rated.");
        }

        Canteen canteen = order.getCanteen();
        canteen.setRating(((canteen.getRating() * canteen.getRatingCount()) + rating) / (canteen.getRatingCount() + 1));
        canteen.setRatingCount(canteen.getRatingCount() + 1);
        canteenRepository.save(canteen);

        for (OrderItem item : order.getOrderItems()) {
            Item itemEntity = item.getItem();
            itemEntity.setRating(((itemEntity.getRating() * itemEntity.getRatingCount()) + rating) / (itemEntity.getRatingCount() + 1));
            itemEntity.setRatingCount(itemEntity.getRatingCount() + 1);
            itemRepository.save(itemEntity);
        }

        order.setUpdatedAt(new Date());
        return toDto(orderRepository.save(order));
    }

    private static Set<OrderStatus> statusesFor(boolean active) {
        return active ? ACTIVE_STATUSES : PAST_STATUSES;
    }

    private static boolean isCustomerOf(User user, Order order) {
        return order.getCustomer() != null && order.getCustomer().getId().equals(user.getId());
    }

    /** Admins, the canteen's owner and its active members (chefs, waiters, ...) work on its orders. */
    private boolean isCanteenStaff(User user, UUID canteenId) {
        return user.getRoles().contains(RoleType.ADMIN)
                || canteenRepository.existsByIdAndOwnerId(canteenId, user.getId())
                || canteenMemberRepository.existsByCanteenIdAndMemberIdAndStatus(canteenId, user.getId(), CanteenMembershipStatus.ACTIVE);
    }

    private void requireCanteenStaff(User user, UUID canteenId) {
        if (!isCanteenStaff(user, canteenId)) {
            throw new ForbiddenException("You do not have access to this canteen's orders.");
        }
    }

    private PageResponseDto<OrderDto> toPageResponse(Page<Order> orders) {
        return PageResponseDto.<OrderDto>builder()
                .content(orders.getContent().stream().map(this::toDto).toList())
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .last(orders.isLast())
                .build();
    }

    private OrderDto toDto(Order order) {
        List<OrderItemDto> items = order.getOrderItems() == null ? new ArrayList<>() : order.getOrderItems().stream()
                .sorted(Comparator.comparing(OrderItem::getCreatedAt))
                .map(this::toDto)
                .toList();

        return OrderDto.builder()
                .id(order.getId())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .canteenId(order.getCanteen() != null ? order.getCanteen().getId() : null)
                .canteenName(order.getCanteen() != null ? order.getCanteen().getName() : null)
                .status(order.getStatus())
                .receiverName(order.getReceiverName())
                .type(order.getType())
                .selectedTimeRange(order.getSelectedTimeRange())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(items)
                .build();
    }

    private OrderItemDto toDto(OrderItem item) {
        return OrderItemDto.builder()
                .id(item.getId())
                .orderId(item.getOrder() != null ? item.getOrder().getId() : null)
                .itemId(item.getItem() != null ? item.getItem().getId() : null)
                .itemName(item.getItem() != null ? item.getItem().getName() : null)
                .chefId(item.getChef() != null ? item.getChef().getId() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .discount(item.getDiscount())
                .finalPrice(item.getFinalPrice())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
