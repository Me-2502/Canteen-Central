package com.project.mycanteen.dto;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.project.mycanteen.entity.type.EntityStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanteenDto {
    private UUID id;
    private String name;
    private UUID ownerId;
    private String mailid;
    private String phoneNumber;
    private String address;
    private String url;
    private String imageUrl;
    private EntityStatus status;
    private Date startTime;
    private Date endTime;
    private float rating;
    private int ratingCount;
    private List<String> allowedDomains;
    private Date createdAt;
    private Date updatedAt;
}
