package com.project.mycanteen.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.mycanteen.dto.ApiResponse;
import com.project.mycanteen.dto.CanteenDto;
import com.project.mycanteen.dto.OwnerAnalyticsDto;
import com.project.mycanteen.service.OwnerService;

import lombok.RequiredArgsConstructor;

/** Requires the OWNER role (see WebSecurityConfig); OwnerService checks ownership per canteen. */
@RestController
@RequestMapping("/owner")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;

    @GetMapping("/canteens")
    public ResponseEntity<ApiResponse<List<CanteenDto>>> getMyCanteens() {
        return ResponseEntity.ok(ApiResponse.<List<CanteenDto>>builder()
                .success(true)
                .message("Owned canteens fetched successfully")
                .data(ownerService.getMyCanteens())
                .build());
    }

    @GetMapping("/canteens/{canteenId}/analytics")
    public ResponseEntity<ApiResponse<OwnerAnalyticsDto>> getAnalytics(
            @PathVariable UUID canteenId,
            @RequestParam(required = false, defaultValue = "30") Integer days,
            @RequestParam(required = false) String tz) {
        return ResponseEntity.ok(ApiResponse.<OwnerAnalyticsDto>builder()
                .success(true)
                .message("Analytics fetched successfully")
                .data(ownerService.getAnalytics(canteenId, days, tz))
                .build());
    }
}
