package com.project.mycanteen.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.project.mycanteen.entity.type.OrderType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOrderRequestDto {
    private UUID canteenId;

    @NotNull(message = "Order type is required.")
    private OrderType type;

    private String receiverName;

    @NotBlank(message = "Selected time range is required.")
    private String selectedTimeRange;

    @Builder.Default
    private List<OrderItemRequestDto> items = new ArrayList<>();
}
