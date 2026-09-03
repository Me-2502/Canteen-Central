package com.project.mycanteen.dto;

import com.project.mycanteen.entity.type.RoleType;

import jakarta.validation.constraints.Email;
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
public class InviteRequestDto {
    @NotBlank(message = "Email is required.")
    @Email(message = "Please provide a valid email.")
    private String mailid;

    @NotNull(message = "Role is required.")
    private RoleType role;
}
