package com.project.mycanteen.dto;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequestDto {

    private UUID id;

    @NotBlank(message = "Email cannot be blank.")
    @Email(message = "Please request with a valid email.")
    private String mailid;

    // @Min(value = 8, message = "Password must be atleast 8 characters long.")
    private String password;
}
