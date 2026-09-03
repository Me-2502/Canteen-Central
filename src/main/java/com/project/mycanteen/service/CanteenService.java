package com.project.mycanteen.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.mycanteen.dto.ApiResponse;
import com.project.mycanteen.dto.CanteenDto;
import com.project.mycanteen.dto.CanteenSearchRequestDto;
import com.project.mycanteen.dto.ItemDto;
import com.project.mycanteen.dto.PageResponseDto;
import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.CanteenMember;
import com.project.mycanteen.entity.Item;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.entity.type.CanteenMembershipStatus;
import com.project.mycanteen.entity.type.EntityStatus;
import com.project.mycanteen.entity.type.RoleType;
import com.project.mycanteen.error.BadRequestException;
import com.project.mycanteen.error.ForbiddenException;
import com.project.mycanteen.error.ResourceNotFoundException;
import com.project.mycanteen.repository.CanteenMemberRepository;
import com.project.mycanteen.repository.CanteenRepository;
import com.project.mycanteen.repository.ItemRepository;
import com.project.mycanteen.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CanteenService {

    private final CanteenRepository canteenRepository;
    private final CanteenMemberRepository canteenMemberRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponseDto<CanteenDto> searchCanteens(CanteenSearchRequestDto searchRequest) {
        int page = Objects.requireNonNullElse(searchRequest.getPage(), 0);
        int size = Objects.requireNonNullElse(searchRequest.getSize(), 10);
        String keyword = Objects.requireNonNullElse(searchRequest.getKeyword(), "").trim();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "rating"));

        Page<Canteen> canteens;
        if (keyword.isBlank()) {
            canteens = canteenRepository.findByStatusOrderByRatingDesc(EntityStatus.ACTIVE, pageable);
        } else {
            canteens = canteenRepository.searchByKeyword(EntityStatus.ACTIVE, keyword, pageable);
        }

        return PageResponseDto.<CanteenDto>builder()
                .content(canteens.getContent().stream().map(this::toDto).toList())
                .page(canteens.getNumber())
                .size(canteens.getSize())
                .totalElements(canteens.getTotalElements())
                .totalPages(canteens.getTotalPages())
                .last(canteens.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public CanteenDto getCanteen(UUID canteenId) {
        Canteen canteen = canteenRepository.findById(canteenId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen", canteenId));
        return toDto(canteen);
    }

    @Transactional
    public CanteenDto createCanteen(CanteenDto request) {
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getOwnerId()));
        User createdBy = getCurrentUser();

        Canteen canteen = Canteen.builder()
                .name(request.getName())
                .owner(owner)
                .mailid(request.getMailid())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .url(request.getUrl())
                .imageUrl(request.getImageUrl())
                .createdBy(createdBy)
                .createdAt(new Date())
                .updatedAt(new Date())
                .status(EntityStatus.ACTIVE)
                .allowedDomains(request.getAllowedDomains() == null ? new ArrayList<>() : request.getAllowedDomains())
                .build();

        canteen = canteenRepository.save(canteen);

        CanteenMember member = CanteenMember.builder()
                .member(owner)
                .canteen(canteen)
                .inviter(createdBy)
                .createdAt(new Date())
                .updatedAt(new Date())
                .status(CanteenMembershipStatus.ACTIVE)
                .build();
        canteenMemberRepository.save(member);
        return toDto(canteen);
    }

    @Transactional
    public CanteenDto updateCanteen(UUID canteenId, CanteenDto request) {
        Canteen canteen = findCanteen(canteenId);
        ensureCanteenAccess(canteen, RoleType.OWNER, RoleType.ADMIN);

        if (request.getName() != null) canteen.setName(request.getName());
        if (request.getMailid() != null) canteen.setMailid(request.getMailid());
        if (request.getPhoneNumber() != null) canteen.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) canteen.setAddress(request.getAddress());
        if (request.getUrl() != null) canteen.setUrl(request.getUrl());
        if (request.getImageUrl() != null) canteen.setImageUrl(request.getImageUrl());
        if (request.getAllowedDomains() != null) canteen.setAllowedDomains(request.getAllowedDomains());
        if (request.getStatus() != null) canteen.setStatus(request.getStatus());
        canteen.setUpdatedAt(new Date());

        return toDto(canteenRepository.save(canteen));
    }

    @Transactional(readOnly = true)
    public List<ItemDto> getItemsForCanteen(UUID canteenId) {
        return itemRepository.findByCanteenIdOrderByCreatedAtDesc(canteenId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public ItemDto addItem(UUID canteenId, ItemDto request) {
        Canteen canteen = findCanteen(canteenId);
        ensureCanteenAccess(canteen, RoleType.OWNER, RoleType.ADMIN);

        Item item = Item.builder()
                .name(request.getName())
                .description(request.getDescription())
                .canteen(canteen)
                .type(request.getType())
                .measure(request.getMeasure())
                .imageUrl(request.getImageUrl())
                .unitPrice(request.getUnitPrice())
                .discount(request.getDiscount())
                .createdAt(new Date())
                .updatedAt(new Date())
                .rating(0)
                .ratingCount(0)
                .build();

        return toDto(itemRepository.save(item));
    }

    @Transactional
    public ItemDto updateItem(UUID canteenId, UUID itemId, ItemDto request) {
        Item item = itemRepository.findByIdAndCanteenId(itemId, canteenId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));
        ensureCanteenAccess(item.getCanteen(), RoleType.OWNER, RoleType.ADMIN);

        if (request.getName() != null) item.setName(request.getName());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getType() != null) item.setType(request.getType());
        if (request.getMeasure() > 0) item.setMeasure(request.getMeasure());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());
        if (request.getUnitPrice() > 0) item.setUnitPrice(request.getUnitPrice());
        if (request.getDiscount() >= 0) item.setDiscount(request.getDiscount());
        item.setUpdatedAt(new Date());
        return toDto(itemRepository.save(item));
    }

    @Transactional
    public void deleteItem(UUID canteenId, UUID itemId) {
        Item item = itemRepository.findByIdAndCanteenId(itemId, canteenId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));
        ensureCanteenAccess(item.getCanteen(), RoleType.OWNER, RoleType.ADMIN);
        itemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<CanteenMember> getMembers(UUID canteenId) {
        Canteen canteen = findCanteen(canteenId);
        ensureCanteenAccess(canteen, RoleType.OWNER, RoleType.ADMIN);
        return canteenMemberRepository.findByCanteenId(canteenId);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new BadRequestException("No authenticated user found.");
        }
        return user;
    }

    private Canteen findCanteen(UUID canteenId) {
        return canteenRepository.findById(canteenId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen", canteenId));
    }

    private void ensureCanteenAccess(Canteen canteen, RoleType... allowedRoles) {
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRoles().contains(RoleType.ADMIN);
        boolean isOwner = Objects.equals(canteen.getOwner().getId(), currentUser.getId());
        boolean hasAllowedRole = currentUser.getRoles().stream().anyMatch(role -> List.of(allowedRoles).contains(role));

        if (!isAdmin && !isOwner && !hasAllowedRole) {
            throw new ForbiddenException("You do not have permission to manage this canteen.");
        }
    }

    private CanteenDto toDto(Canteen canteen) {
        return CanteenDto.builder()
                .id(canteen.getId())
                .name(canteen.getName())
                .ownerId(canteen.getOwner() != null ? canteen.getOwner().getId() : null)
                .mailid(canteen.getMailid())
                .phoneNumber(canteen.getPhoneNumber())
                .address(canteen.getAddress())
                .url(canteen.getUrl())
                .imageUrl(canteen.getImageUrl())
                .status(canteen.getStatus())
                .startTime(canteen.getStartTime())
                .endTime(canteen.getEndTime())
                .rating(canteen.getRating())
                .ratingCount(canteen.getRatingCount())
                .allowedDomains(canteen.getAllowedDomains())
                .createdAt(canteen.getCreatedAt())
                .updatedAt(canteen.getUpdatedAt())
                .build();
    }

    private ItemDto toDto(Item item) {
        return ItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .canteenId(item.getCanteen() != null ? item.getCanteen().getId() : null)
                .type(item.getType())
                .measure(item.getMeasure())
                .imageUrl(item.getImageUrl())
                .unitPrice(item.getUnitPrice())
                .discount(item.getDiscount())
                .rating(item.getRating())
                .ratingCount(item.getRatingCount())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
