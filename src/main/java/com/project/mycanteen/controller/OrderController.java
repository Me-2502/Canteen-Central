package com.project.mycanteen.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.mycanteen.dto.ApiResponse;
import com.project.mycanteen.dto.CanteenDto;
import com.project.mycanteen.dto.OrderDto;
import com.project.mycanteen.dto.PageResponseDto;
import com.project.mycanteen.dto.PlaceOrderRequestDto;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.entity.type.OrderStatus;
import com.project.mycanteen.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Validated
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAuthority('order:write')")
    public ResponseEntity<ApiResponse<List<OrderDto>>> placeOrder(
            @AuthenticationPrincipal User customer,
            @Valid @RequestBody PlaceOrderRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<List<OrderDto>>builder()
                .success(true)
                .message("Order placed successfully")
                .data(orderService.placeOrder(customer.getId(), request))
                .build());
    }

    /** Orders placed by the signed-in user. active=true for current orders, false for previous ones. */
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('order:read')")
    public ResponseEntity<ApiResponse<PageResponseDto<OrderDto>>> getMyOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.<PageResponseDto<OrderDto>>builder()
                .success(true)
                .message("Your orders fetched successfully")
                .data(orderService.getCustomerOrders(user.getId(), active, page, size))
                .build());
    }

    /** Canteens whose orders the signed-in user works on (empty for pure customers). */
    @GetMapping("/my/canteens")
    @PreAuthorize("hasAuthority('order:read')")
    public ResponseEntity<ApiResponse<List<CanteenDto>>> getManagedCanteens(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.<List<CanteenDto>>builder()
                .success(true)
                .message("Canteens fetched successfully")
                .data(orderService.getManagedCanteens(user))
                .build());
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or #customerId == authentication.principal.id")
    public ResponseEntity<ApiResponse<PageResponseDto<OrderDto>>> getCustomerOrders(
            @PathVariable UUID customerId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.<PageResponseDto<OrderDto>>builder()
                .success(true)
                .message("Customer orders fetched successfully")
                .data(orderService.getCustomerOrders(customerId, active, page, size))
                .build());
    }

    @GetMapping("/canteen/{canteenId}")
    @PreAuthorize("hasAuthority('order:read')")
    public ResponseEntity<ApiResponse<PageResponseDto<OrderDto>>> getCanteenOrders(
            @AuthenticationPrincipal User user,
            @PathVariable UUID canteenId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.<PageResponseDto<OrderDto>>builder()
                .success(true)
                .message("Canteen orders fetched successfully")
                .data(orderService.getCanteenOrders(user, canteenId, active, page, size))
                .build());
    }

    @GetMapping("/canteen/{canteenId}/hot")
    @PreAuthorize("hasAuthority('order:read')")
    public ResponseEntity<ApiResponse<PageResponseDto<OrderDto>>> getHotOrders(
            @AuthenticationPrincipal User user,
            @PathVariable UUID canteenId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.<PageResponseDto<OrderDto>>builder()
                .success(true)
                .message("Hot orders fetched successfully")
                .data(orderService.getHotOrders(user, canteenId, page, size))
                .build());
    }

    @GetMapping("/canteen/{canteenId}/upcoming")
    @PreAuthorize("hasAuthority('order:read')")
    public ResponseEntity<ApiResponse<PageResponseDto<OrderDto>>> getUpcomingOrders(
            @AuthenticationPrincipal User user,
            @PathVariable UUID canteenId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.<PageResponseDto<OrderDto>>builder()
                .success(true)
                .message("Upcoming orders fetched successfully")
                .data(orderService.getUpcomingOrders(user, canteenId, page, size))
                .build());
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAuthority('order:read')")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(@AuthenticationPrincipal User user, @PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.<OrderDto>builder()
                .success(true)
                .message("Order fetched successfully")
                .data(orderService.getOrder(user, orderId))
                .build());
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAuthority('order:write')")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @AuthenticationPrincipal User user,
            @PathVariable UUID orderId,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.<OrderDto>builder()
                .success(true)
                .message("Order status updated successfully")
                .data(orderService.updateOrderStatus(user, orderId, status))
                .build());
    }

    @PutMapping("/{orderId}/rate")
    @PreAuthorize("hasAuthority('rating:write')")
    public ResponseEntity<ApiResponse<OrderDto>> rateOrder(
            @AuthenticationPrincipal User user, @PathVariable UUID orderId, @RequestParam int rating) {
        return ResponseEntity.ok(ApiResponse.<OrderDto>builder()
                .success(true)
                .message("Order rated successfully")
                .data(orderService.rateOrder(user, orderId, rating))
                .build());
    }
}
