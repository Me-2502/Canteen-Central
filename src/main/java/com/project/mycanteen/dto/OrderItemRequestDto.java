package com.project.mycanteen.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequestDto {
    private UUID canteenId;

    @NotNull(message = "Item id is required.")
    private UUID itemId;

    @NotNull(message = "Quantity is required.")
    private Integer quantity;
}