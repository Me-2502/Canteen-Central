package com.project.mycanteen.dto;

import java.util.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Canteen details that are safe to expose to anyone, including unauthenticated users.
 * Internal fields such as allowed order domains, status and audit info are intentionally left out.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicCanteenDto {
    private UUID id;
    private String name;
    private String ownerName;
    private String mailid;
    private String phoneNumber;
    private String address;
    private String url;
    private String imageUrl;
    private Date startTime;
    private Date endTime;
    private float rating;
    private int ratingCount;
}
