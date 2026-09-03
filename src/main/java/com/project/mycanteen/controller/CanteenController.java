package com.project.mycanteen.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.mycanteen.dto.ApiResponse;
import com.project.mycanteen.dto.CanteenDto;
import com.project.mycanteen.dto.CanteenSearchRequestDto;
import com.project.mycanteen.dto.ItemDto;
import com.project.mycanteen.dto.PageResponseDto;
import com.project.mycanteen.service.CanteenService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/canteens")
@RequiredArgsConstructor
@Validated
public class CanteenController {

    private final CanteenService canteenService;

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('canteen:read') or hasAuthority('menu:read')")
    public ResponseEntity<ApiResponse<PageResponseDto<CanteenDto>>> searchCanteens(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {
        CanteenSearchRequestDto request = CanteenSearchRequestDto.builder()
                .keyword(keyword)
                .page(page)
                .size(size)
                .build();

        return ResponseEntity.ok(ApiResponse.<PageResponseDto<CanteenDto>>builder()
                .success(true)
                .message("Canteens fetched successfully")
                .data(canteenService.searchCanteens(request))
                .build());
    }

    @GetMapping("/{canteenId}")
    @PreAuthorize("hasAuthority('canteen:read') or hasAuthority('menu:read')")
    public ResponseEntity<ApiResponse<CanteenDto>> getCanteen(@PathVariable UUID canteenId) {
        return ResponseEntity.ok(ApiResponse.<CanteenDto>builder()
                .success(true)
                .message("Canteen fetched successfully")
                .data(canteenService.getCanteen(canteenId))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('canteen:write')")
    public ResponseEntity<ApiResponse<CanteenDto>> createCanteen(@Valid @RequestBody CanteenDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<CanteenDto>builder()
                .success(true)
                .message("Canteen created successfully")
                .data(canteenService.createCanteen(request))
                .build());
    }

    @PutMapping("/{canteenId}")
    @PreAuthorize("hasAuthority('canteen:write')")
    public ResponseEntity<ApiResponse<CanteenDto>> updateCanteen(@PathVariable UUID canteenId, @Valid @RequestBody CanteenDto request) {
        return ResponseEntity.ok(ApiResponse.<CanteenDto>builder()
                .success(true)
                .message("Canteen updated successfully")
                .data(canteenService.updateCanteen(canteenId, request))
                .build());
    }

    @GetMapping("/{canteenId}/items")
    @PreAuthorize("hasAuthority('menu:read')")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getItemsForCanteen(@PathVariable UUID canteenId) {
        return ResponseEntity.ok(ApiResponse.<List<ItemDto>>builder()
                .success(true)
                .message("Canteen items fetched successfully")
                .data(canteenService.getItemsForCanteen(canteenId))
                .build());
    }

    @PostMapping("/{canteenId}/items")
    @PreAuthorize("hasAuthority('menu:write')")
    public ResponseEntity<ApiResponse<ItemDto>> addItem(@PathVariable UUID canteenId, @Valid @RequestBody ItemDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ItemDto>builder()
                .success(true)
                .message("Item created successfully")
                .data(canteenService.addItem(canteenId, request))
                .build());
    }

    @PutMapping("/{canteenId}/items/{itemId}")
    @PreAuthorize("hasAuthority('menu:write')")
    public ResponseEntity<ApiResponse<ItemDto>> updateItem(@PathVariable UUID canteenId, @PathVariable UUID itemId, @Valid @RequestBody ItemDto request) {
        return ResponseEntity.ok(ApiResponse.<ItemDto>builder()
                .success(true)
                .message("Item updated successfully")
                .data(canteenService.updateItem(canteenId, itemId, request))
                .build());
    }

    @DeleteMapping("/{canteenId}/items/{itemId}")
    @PreAuthorize("hasAuthority('menu:write')")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable UUID canteenId, @PathVariable UUID itemId) {
        canteenService.deleteItem(canteenId, itemId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Item deleted successfully")
                .build());
    }
}
