package com.project.mycanteen.dto;

import java.util.HashSet;
import java.util.Set;

import com.project.mycanteen.entity.type.RoleType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequestDto {

    @NotBlank(message = "Email cannot be blank.")
    @Email(message = "Please request with a valid email.")
    private String mailid;

    private String password;

    @NotBlank(message = "First name cannot be kept blank.")
    @Size(min = 2, max = 50, message = "Name must be 2 to 50 characters long.")
    private String firstName;
    @Size(min = 2, max = 50, message = "Name must be 2 to 50 characters long.")
    private String lastName;

    @Size(min = 10, max = 15, message = "Phone number must be atleast 10 characters long.")
    private String phoneNumber;

    private Set<RoleType> roles = new HashSet<>();
}