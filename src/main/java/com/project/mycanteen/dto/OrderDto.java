package com.project.mycanteen.dto;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.project.mycanteen.entity.type.OrderStatus;
import com.project.mycanteen.entity.type.OrderType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private UUID id;
    private UUID customerId;
    private UUID canteenId;
    private String canteenName;
    private OrderStatus status;
    private String receiverName;
    private OrderType type;
    private String selectedTimeRange;
    private Date createdAt;
    private Date updatedAt;
    @Builder.Default
    private List<OrderItemDto> orderItems = new ArrayList<>();
}
