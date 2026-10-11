package com.project.mycanteen.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.mycanteen.dto.ApiResponse;
import com.project.mycanteen.dto.ItemSortType;
import com.project.mycanteen.dto.PageResponseDto;
import com.project.mycanteen.dto.PublicCanteenDto;
import com.project.mycanteen.dto.PublicItemDto;
import com.project.mycanteen.entity.type.ItemType;
import com.project.mycanteen.service.PublicCatalogService;

import lombok.RequiredArgsConstructor;

/**
 * Read-only endpoints open to everyone (unauthenticated users and customers alike).
 */
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicCatalogService publicCatalogService;

    @GetMapping("/canteens")
    public ResponseEntity<ApiResponse<PageResponseDto<PublicCanteenDto>>> searchCanteens(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {
        return ResponseEntity.ok(ApiResponse.<PageResponseDto<PublicCanteenDto>>builder()
                .success(true)
                .message("Canteens fetched successfully")
                .data(publicCatalogService.searchCanteens(keyword, page, size))
                .build());
    }

    @GetMapping("/canteens/{canteenId}")
    public ResponseEntity<ApiResponse<PublicCanteenDto>> getCanteen(@PathVariable UUID canteenId) {
        return ResponseEntity.ok(ApiResponse.<PublicCanteenDto>builder()
                .success(true)
                .message("Canteen fetched successfully")
                .data(publicCatalogService.getCanteen(canteenId))
                .build());
    }

    @GetMapping("/canteens/{canteenId}/items")
    public ResponseEntity<ApiResponse<PageResponseDto<PublicItemDto>>> getCanteenItems(
            @PathVariable UUID canteenId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false, defaultValue = "POPULAR") ItemSortType sort,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size) {
        return ResponseEntity.ok(ApiResponse.<PageResponseDto<PublicItemDto>>builder()
                .success(true)
                .message("Canteen items fetched successfully")
                .data(publicCatalogService.searchItems(canteenId, keyword, type, sort, page, size))
                .build());
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<PageResponseDto<PublicItemDto>>> searchItems(
            @RequestParam(required = false) UUID canteenId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false, defaultValue = "POPULAR") ItemSortType sort,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size) {
        return ResponseEntity.ok(ApiResponse.<PageResponseDto<PublicItemDto>>builder()
                .success(true)
                .message("Items fetched successfully")
                .data(publicCatalogService.searchItems(canteenId, keyword, type, sort, page, size))
                .build());
    }

    @GetMapping("/items/popular")
    public ResponseEntity<ApiResponse<PageResponseDto<PublicItemDto>>> getPopularItems(
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {
        return ResponseEntity.ok(ApiResponse.<PageResponseDto<PublicItemDto>>builder()
                .success(true)
                .message("Popular items fetched successfully")
                .data(publicCatalogService.searchItems(null, null, type, ItemSortType.POPULAR, page, size))
                .build());
    }

    @GetMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<PublicItemDto>> getItem(@PathVariable UUID itemId) {
        return ResponseEntity.ok(ApiResponse.<PublicItemDto>builder()
                .success(true)
                .message("Item fetched successfully")
                .data(publicCatalogService.getItem(itemId))
                .build());
    }
}
