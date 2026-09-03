package com.project.mycanteen.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.mycanteen.dto.ApiResponse;
import com.project.mycanteen.dto.ProfileUpdateDto;
import com.project.mycanteen.dto.UserProfileResponseDto;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.error.BadRequestException;
import com.project.mycanteen.service.UserProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Validated
public class ProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('profile:read') or #userId == authentication.principal.id")
    public ResponseEntity<ApiResponse<UserProfileResponseDto>> getProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.<UserProfileResponseDto>builder()
                .success(true)
                .message("User profile fetched successfully")
                .data(userProfileService.getUserProfile(userId))
                .build());
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('profile:write') or #userId == authentication.principal.id")
    public ResponseEntity<ApiResponse<UserProfileResponseDto>> updateProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody ProfileUpdateDto request) {
        return ResponseEntity.ok(ApiResponse.<UserProfileResponseDto>builder()
                .success(true)
                .message("User profile updated successfully")
                .data(userProfileService.updateUserProfile(userId, request))
                .build());
    }
}
