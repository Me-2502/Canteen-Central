package com.project.mycanteen.service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.mycanteen.dto.CanteenDto;
import com.project.mycanteen.dto.ItemDto;
import com.project.mycanteen.dto.OrderDto;
import com.project.mycanteen.dto.PageResponseDto;
import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.Item;
import com.project.mycanteen.entity.Order;
import com.project.mycanteen.error.ResourceNotFoundException;
import com.project.mycanteen.repository.CanteenRepository;
import com.project.mycanteen.repository.ItemRepository;
import com.project.mycanteen.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CanteenRepository canteenRepository;
    private final ItemRepository itemRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public PageResponseDto<CanteenDto> getAllCanteens(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Canteen> canteens = canteenRepository.findAll(pageable);
        return toCanteenPageResponse(canteens);
    }

    @Transactional(readOnly = true)
    public List<ItemDto> getAllItemsForCanteen(UUID canteenId) {
        Canteen canteen = canteenRepository.findById(canteenId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen", canteenId));
        return itemRepository.findByCanteenId(canteenId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public PageResponseDto<OrderDto> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findAll(pageable);
        return toOrderPageResponse(orders);
    }

    private PageResponseDto<CanteenDto> toCanteenPageResponse(Page<Canteen> canteens) {
        return PageResponseDto.<CanteenDto>builder()
                .content(canteens.getContent().stream().map(this::toDto).toList())
                .page(canteens.getNumber())
                .size(canteens.getSize())
                .totalElements(canteens.getTotalElements())
                .totalPages(canteens.getTotalPages())
                .last(canteens.isLast())
                .build();
    }

    private PageResponseDto<OrderDto> toOrderPageResponse(Page<Order> orders) {
        return PageResponseDto.<OrderDto>builder()
                .content(orders.getContent().stream().map(this::toOrderDto).toList())
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .last(orders.isLast())
                .build();
    }

    private CanteenDto toDto(Canteen canteen) {
        return CanteenDto.builder()
                .id(canteen.getId())
                .name(canteen.getName())
                .ownerId(canteen.getOwner() != null ? canteen.getOwner().getId() : null)
                .mailid(canteen.getMailid())
                .phoneNumber(canteen.getPhoneNumber())
                .address(canteen.getAddress())
                .url(canteen.getUrl())
                .imageUrl(canteen.getImageUrl())
                .status(canteen.getStatus())
                .rating(canteen.getRating())
                .ratingCount(canteen.getRatingCount())
                .allowedDomains(canteen.getAllowedDomains())
                .createdAt(canteen.getCreatedAt())
                .updatedAt(canteen.getUpdatedAt())
                .build();
    }

    private ItemDto toDto(Item item) {
        return ItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .canteenId(item.getCanteen() != null ? item.getCanteen().getId() : null)
                .type(item.getType())
                .measure(item.getMeasure())
                .imageUrl(item.getImageUrl())
                .unitPrice(item.getUnitPrice())
                .discount(item.getDiscount())
                .rating(item.getRating())
                .ratingCount(item.getRatingCount())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    private OrderDto toOrderDto(Order order) {
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
                .build();
    }
}
