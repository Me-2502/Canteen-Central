package com.project.mycanteen.dto;

import java.util.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
    private UUID id;
    private UUID orderId;
    private UUID itemId;
    private String itemName;
    private UUID chefId;
    private int quantity;
    private float unitPrice;
    private float discount;
    private float finalPrice;
    private Date createdAt;
    private Date updatedAt;
}
