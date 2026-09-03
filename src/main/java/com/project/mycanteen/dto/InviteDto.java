package com.project.mycanteen.dto;

import java.util.Date;
import java.util.UUID;

import com.project.mycanteen.entity.type.InviteStatus;
import com.project.mycanteen.entity.type.RoleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteDto {
    private UUID id;
    private UUID canteenId;
    private UUID invitedUserId;
    private String mailid;
    private UUID inviterId;
    private RoleType role;
    private InviteStatus status;
    private Date createdAt;
    private Date updatedAt;
}
