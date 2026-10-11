package com.project.mycanteen.dto;

import java.util.UUID;

import com.project.mycanteen.entity.type.ItemType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Item details that are safe to expose to anyone, including unauthenticated users.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicItemDto {
    private UUID id;
    private String name;
    private String description;
    private ItemType type;
    private float measure;
    private String imageUrl;
    private float unitPrice;
    private float discount;
    private float finalPrice;
    private float rating;
    private int ratingCount;
    // Units sold across non-cancelled orders, used as the popularity score
    private long orderCount;
    private UUID canteenId;
    private String canteenName;
}
