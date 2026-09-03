package com.project.mycanteen.dto;

import java.util.Date;
import java.util.UUID;

import com.project.mycanteen.entity.type.ItemType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private UUID id;
    private String name;
    private String description;
    private UUID canteenId;
    private ItemType type;
    private float measure;
    private String imageUrl;
    private float unitPrice;
    private float discount;
    private float rating;
    private int ratingCount;
    private Date createdAt;
    private Date updatedAt;
}
