package com.project.mycanteen.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.mycanteen.dto.ApiResponse;
import com.project.mycanteen.dto.OrderDto;
import com.project.mycanteen.dto.OrderItemDto;
import com.project.mycanteen.dto.PageResponseDto;
import com.project.mycanteen.dto.PlaceOrderRequestDto;
import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.Item;
import com.project.mycanteen.entity.Order;
import com.project.mycanteen.entity.OrderItem;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.entity.type.OrderStatus;
import com.project.mycanteen.entity.type.OrderType;
import com.project.mycanteen.error.BadRequestException;
import com.project.mycanteen.error.ForbiddenException;
import com.project.mycanteen.error.ResourceNotFoundException;
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

    @Transactional(readOnly = true)
    public PageResponseDto<OrderDto> getCustomerOrders(UUID customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);
        return PageResponseDto.<OrderDto>builder()
                .content(orders.getContent().stream().map(this::toDto).toList())
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .last(orders.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponseDto<OrderDto> getCanteenOrders(UUID canteenId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByCanteenIdOrderByCreatedAtDesc(canteenId, pageable);
        return PageResponseDto.<OrderDto>builder()
                .content(orders.getContent().stream().map(this::toDto).toList())
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .last(orders.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponseDto<OrderDto> getHotOrders(UUID canteenId, int page, int size) {
        Date now = new Date();
        Date twoHoursAgo = new Date(now.getTime() - (2L * 60 * 60 * 1000));
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByCanteenIdAndCreatedAtAfterOrderByCreatedAtAsc(canteenId, twoHoursAgo, pageable);
        return toPageResponse(orders);
    }

    @Transactional(readOnly = true)
    public PageResponseDto<OrderDto> getUpcomingOrders(UUID canteenId, int page, int size) {
        Date now = new Date();
        Date twoHoursAgo = new Date(now.getTime() - (2L * 60 * 60 * 1000));
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByCanteenIdAndCreatedAtBeforeOrderByCreatedAtAsc(canteenId, twoHoursAgo, pageable);
        return toPageResponse(orders);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return toDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (status == null) {
            throw new BadRequestException("Order status is required.");
        }

        if (status == OrderStatus.CANCELLED && order.getStatus() == OrderStatus.COMPLETED) {
            throw new BadRequestException("Completed order cannot be cancelled.");
        }

        order.setStatus(status);
        order.setUpdatedAt(new Date());
        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto rateOrder(UUID orderId, int rating) {
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
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
