package com.project.mycanteen.service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.mycanteen.dto.OrderDto;
import com.project.mycanteen.dto.PageResponseDto;
import com.project.mycanteen.entity.Order;
import com.project.mycanteen.error.ResourceNotFoundException;
import com.project.mycanteen.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public PageResponseDto<OrderDto> getOrderHistory(UUID customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);
        return toPageResponse(orders);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrderHistory(UUID customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::toDto)
                .toList();
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
