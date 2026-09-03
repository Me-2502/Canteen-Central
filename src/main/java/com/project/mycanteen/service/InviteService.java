package com.project.mycanteen.service;

import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.mycanteen.dto.InviteDto;
import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.Invite;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.entity.type.InviteStatus;
import com.project.mycanteen.entity.type.RoleType;
import com.project.mycanteen.error.BadRequestException;
import com.project.mycanteen.error.ForbiddenException;
import com.project.mycanteen.error.ResourceNotFoundException;
import com.project.mycanteen.repository.CanteenMemberRepository;
import com.project.mycanteen.repository.CanteenRepository;
import com.project.mycanteen.repository.InviteRepository;
import com.project.mycanteen.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InviteService {

    private final InviteRepository inviteRepository;
    private final CanteenRepository canteenRepository;
    private final CanteenMemberRepository canteenMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public InviteDto createInvite(UUID canteenId, UUID inviterId, String mailid, RoleType role) {
        if (role == null) {
            throw new BadRequestException("Invite role is required.");
        }
        if (mailid == null || mailid.isBlank()) {
            throw new BadRequestException("Invite email is required.");
        }

        Canteen canteen = canteenRepository.findById(canteenId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen", canteenId));
        User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", inviterId));

        if (!Objects.equals(canteen.getOwner().getId(), inviterId) && !inviter.getRoles().contains(RoleType.ADMIN)) {
            throw new ForbiddenException("Only the canteen owner or admin can send invites.");
        }

        Optional<User> invitedUser = userRepository.findByMailid(mailid.trim());
        Optional<Invite> existingInvite = invitedUser
                .map(user -> inviteRepository.findByInvitedIdAndCanteenAndStatus(user, canteen, InviteStatus.PENDING))
                .orElseGet(() -> inviteRepository.findByMailidAndCanteenAndStatus(mailid.trim(), canteen, InviteStatus.PENDING));

        if (existingInvite.isPresent()) {
            throw new BadRequestException("An active invite already exists for this user.");
        }

        Invite invite = Invite.builder()
                .canteen(canteen)
                .invitedId(invitedUser.orElse(null))
                .mailid(mailid.trim())
                .inviterId(inviter)
                .role(role)
                .status(InviteStatus.PENDING)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        return toDto(inviteRepository.save(invite));
    }

    @Transactional(readOnly = true)
    public List<InviteDto> getInvitesForCanteen(UUID canteenId) {
        Canteen canteen = canteenRepository.findById(canteenId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen", canteenId));
        return inviteRepository.findByCanteenOrderByCreatedAtDesc(canteen).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InviteDto> getInvitesForUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return inviteRepository.findByInvitedId(user).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public InviteDto acceptInvite(UUID inviteId, UUID userId) {
        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Invite", inviteId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (invite.getInvitedId() != null && !Objects.equals(invite.getInvitedId().getId(), userId)) {
            throw new ForbiddenException("This invite is not for the current user.");
        }
        if (invite.getInvitedId() == null && !invite.getMailid().equalsIgnoreCase(user.getMailid())) {
            throw new ForbiddenException("This invite is not for the current user.");
        }

        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new BadRequestException("Invite is not pending.");
        }

        invite.setStatus(InviteStatus.ACCEPTED);
        invite.setUpdatedAt(new Date());

        if (user.getRoles() == null || !user.getRoles().contains(invite.getRole())) {
            user.getRoles().add(invite.getRole());
            userRepository.save(user);
        }

        if (canteenMemberRepository.findByCanteenAndMember(invite.getCanteen(), user).isEmpty()) {
            var member = com.project.mycanteen.entity.CanteenMember.builder()
                    .member(user)
                    .canteen(invite.getCanteen())
                    .inviter(invite.getInviterId())
                    .createdAt(new Date())
                    .updatedAt(new Date())
                    .status(com.project.mycanteen.entity.type.CanteenMembershipStatus.ACTIVE)
                    .build();
            canteenMemberRepository.save(member);
        }

        return toDto(inviteRepository.save(invite));
    }

    @Transactional
    public InviteDto rejectInvite(UUID inviteId, UUID userId) {
        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Invite", inviteId));

        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new BadRequestException("Only pending invites can be rejected.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (invite.getInvitedId() != null && !Objects.equals(invite.getInvitedId().getId(), userId)) {
            throw new ForbiddenException("This invite is not for the current user.");
        }

        invite.setStatus(InviteStatus.REJECTED);
        invite.setUpdatedAt(new Date());
        return toDto(inviteRepository.save(invite));
    }

    private InviteDto toDto(Invite invite) {
        return InviteDto.builder()
                .id(invite.getId())
                .canteenId(invite.getCanteen() != null ? invite.getCanteen().getId() : null)
                .invitedUserId(invite.getInvitedId() != null ? invite.getInvitedId().getId() : null)
                .mailid(invite.getMailid())
                .inviterId(invite.getInviterId() != null ? invite.getInviterId().getId() : null)
                .role(invite.getRole())
                .status(invite.getStatus())
                .createdAt(invite.getCreatedAt())
                .updatedAt(invite.getUpdatedAt())
                .build();
    }
}
