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
public class UserProfileResponseDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String mailid;
    private String phoneNumber;
    private String status;
    private float walletBalance;
    private Date createdAt;
    private Date updatedAt;
}
