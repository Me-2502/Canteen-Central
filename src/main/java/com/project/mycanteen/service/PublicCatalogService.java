package com.project.mycanteen.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.mycanteen.dto.ItemSortType;
import com.project.mycanteen.dto.PageResponseDto;
import com.project.mycanteen.dto.PublicCanteenDto;
import com.project.mycanteen.dto.PublicItemDto;
import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.Item;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.entity.type.EntityStatus;
import com.project.mycanteen.entity.type.ItemType;
import com.project.mycanteen.entity.type.OrderStatus;
import com.project.mycanteen.error.ResourceNotFoundException;
import com.project.mycanteen.repository.CanteenRepository;
import com.project.mycanteen.repository.ItemRepository;
import com.project.mycanteen.repository.OrderItemRepository;

import lombok.RequiredArgsConstructor;

/**
 * Read-only catalog for anonymous users and customers. Only ACTIVE canteens (and their items) are visible.
 */
@Service
@RequiredArgsConstructor
public class PublicCatalogService {

    private static final int MAX_PAGE_SIZE = 50;

    private final CanteenRepository canteenRepository;
    private final ItemRepository itemRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public PageResponseDto<PublicCanteenDto> searchCanteens(String keyword, int page, int size) {
        String search = Objects.requireNonNullElse(keyword, "").trim();
        Pageable pageable = pageable(page, size, Sort.unsorted());

        Page<Canteen> canteens = search.isBlank()
                ? canteenRepository.findByStatusOrderByRatingDesc(EntityStatus.ACTIVE, pageable)
                : canteenRepository.searchByKeyword(EntityStatus.ACTIVE, search, pageable);

        return toPageResponse(canteens, canteens.getContent().stream().map(this::toDto).toList());
    }

    @Transactional(readOnly = true)
    public PublicCanteenDto getCanteen(UUID canteenId) {
        return toDto(findActiveCanteen(canteenId));
    }

    @Transactional(readOnly = true)
    public PageResponseDto<PublicItemDto> searchItems(UUID canteenId, String keyword, ItemType type,
                                                      ItemSortType sort, int page, int size) {
        if (canteenId != null) {
            findActiveCanteen(canteenId);
        }
        String search = Objects.requireNonNullElse(keyword, "").trim();
        ItemSortType sortType = Objects.requireNonNullElse(sort, ItemSortType.POPULAR);

        Page<Item> items;
        if (sortType == ItemSortType.POPULAR) {
            items = itemRepository.findPopularPublicItems(EntityStatus.ACTIVE, canteenId, type, search,
                    OrderStatus.CANCELLED, pageable(page, size, Sort.unsorted()));
        } else {
            items = itemRepository.searchPublicItems(EntityStatus.ACTIVE, canteenId, type, search,
                    pageable(page, size, toSort(sortType)));
        }

        Map<UUID, Long> orderCounts = getOrderCounts(items.getContent());
        return toPageResponse(items, items.getContent().stream()
                .map(item -> toDto(item, orderCounts.getOrDefault(item.getId(), 0L)))
                .toList());
    }

    @Transactional(readOnly = true)
    public PublicItemDto getItem(UUID itemId) {
        Item item = itemRepository.findById(itemId)
                .filter(found -> found.getCanteen().getStatus() == EntityStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));
        return toDto(item, getOrderCounts(List.of(item)).getOrDefault(itemId, 0L));
    }

    private Canteen findActiveCanteen(UUID canteenId) {
        return canteenRepository.findById(canteenId)
                .filter(canteen -> canteen.getStatus() == EntityStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen", canteenId));
    }

    private Map<UUID, Long> getOrderCounts(List<Item> items) {
        if (items.isEmpty()) {
            return Map.of();
        }
        List<UUID> itemIds = items.stream().map(Item::getId).toList();
        return orderItemRepository.sumQuantityByItemIds(itemIds, OrderStatus.CANCELLED).stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> ((Number) row[1]).longValue()));
    }

    private Sort toSort(ItemSortType sortType) {
        return switch (sortType) {
            case RATING -> Sort.by(Sort.Order.desc("rating"), Sort.Order.desc("ratingCount"));
            case PRICE_LOW_TO_HIGH -> Sort.by(Sort.Order.asc("unitPrice"));
            case PRICE_HIGH_TO_LOW -> Sort.by(Sort.Order.desc("unitPrice"));
            case NEWEST, POPULAR -> Sort.by(Sort.Order.desc("createdAt"));
        };
    }

    private Pageable pageable(int page, int size, Sort sort) {
        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE), sort);
    }

    private <E, D> PageResponseDto<D> toPageResponse(Page<E> page, List<D> content) {
        return PageResponseDto.<D>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private PublicCanteenDto toDto(Canteen canteen) {
        return PublicCanteenDto.builder()
                .id(canteen.getId())
                .name(canteen.getName())
                .ownerName(fullName(canteen.getOwner()))
                .mailid(canteen.getMailid())
                .phoneNumber(canteen.getPhoneNumber())
                .address(canteen.getAddress())
                .url(canteen.getUrl())
                .imageUrl(canteen.getImageUrl())
                .startTime(canteen.getStartTime())
                .endTime(canteen.getEndTime())
                .rating(canteen.getRating())
                .ratingCount(canteen.getRatingCount())
                .build();
    }

    private PublicItemDto toDto(Item item, long orderCount) {
        return PublicItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .type(item.getType())
                .measure(item.getMeasure())
                .imageUrl(item.getImageUrl())
                .unitPrice(item.getUnitPrice())
                .discount(item.getDiscount())
                .finalPrice(Math.max(item.getUnitPrice() - item.getDiscount(), 0))
                .rating(item.getRating())
                .ratingCount(item.getRatingCount())
                .orderCount(orderCount)
                .canteenId(item.getCanteen().getId())
                .canteenName(item.getCanteen().getName())
                .build();
    }

    private String fullName(User user) {
        if (user == null) {
            return null;
        }
        return user.getLastName() == null || user.getLastName().isBlank()
                ? user.getFirstName()
                : user.getFirstName() + " " + user.getLastName();
    }
}
