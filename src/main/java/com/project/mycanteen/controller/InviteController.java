package com.project.mycanteen.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.mycanteen.dto.ApiResponse;
import com.project.mycanteen.dto.InviteDto;
import com.project.mycanteen.dto.InviteRequestDto;
import com.project.mycanteen.service.InviteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/invites")
@RequiredArgsConstructor
@Validated
public class InviteController {

    private final InviteService inviteService;

    @PostMapping("/canteen/{canteenId}")
    @PreAuthorize("hasAuthority('canteen:write')")
    public ResponseEntity<ApiResponse<InviteDto>> createInvite(
            @PathVariable UUID canteenId,
            @RequestParam UUID inviterId,
            @Valid @RequestBody InviteRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<InviteDto>builder()
                .success(true)
                .message("Invite sent successfully")
                .data(inviteService.createInvite(canteenId, inviterId, request.getMailid(), request.getRole()))
                .build());
    }

    @GetMapping("/canteen/{canteenId}")
    @PreAuthorize("hasAuthority('canteen:read')")
    public ResponseEntity<ApiResponse<List<InviteDto>>> getInvitesForCanteen(@PathVariable UUID canteenId) {
        return ResponseEntity.ok(ApiResponse.<List<InviteDto>>builder()
                .success(true)
                .message("Canteen invites fetched successfully")
                .data(inviteService.getInvitesForCanteen(canteenId))
                .build());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('profile:read') or #userId == authentication.principal.id")
    public ResponseEntity<ApiResponse<List<InviteDto>>> getInvitesForUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.<List<InviteDto>>builder()
                .success(true)
                .message("User invites fetched successfully")
                .data(inviteService.getInvitesForUser(userId))
                .build());
    }

    @PutMapping("/{inviteId}/accept")
    @PreAuthorize("hasAuthority('profile:write')")
    public ResponseEntity<ApiResponse<InviteDto>> acceptInvite(@PathVariable UUID inviteId, @RequestParam UUID userId) {
        return ResponseEntity.ok(ApiResponse.<InviteDto>builder()
                .success(true)
                .message("Invite accepted successfully")
                .data(inviteService.acceptInvite(inviteId, userId))
                .build());
    }

    @PutMapping("/{inviteId}/reject")
    @PreAuthorize("hasAuthority('profile:write')")
    public ResponseEntity<ApiResponse<InviteDto>> rejectInvite(@PathVariable UUID inviteId, @RequestParam UUID userId) {
        return ResponseEntity.ok(ApiResponse.<InviteDto>builder()
                .success(true)
                .message("Invite rejected successfully")
                .data(inviteService.rejectInvite(inviteId, userId))
                .build());
    }
}
