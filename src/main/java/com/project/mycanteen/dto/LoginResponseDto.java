package com.project.mycanteen.dto;

import java.util.Set;
import java.util.UUID;

import com.project.mycanteen.entity.type.RoleType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDto {
    String jwt;
    UUID userId;
    Set<RoleType> roles;
    // Permission strings such as "menu:write", used by the frontend to pick which views to show
    Set<String> permissions;
}
