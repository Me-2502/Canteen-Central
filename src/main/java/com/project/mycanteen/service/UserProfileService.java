package com.project.mycanteen.service;

import java.util.Date;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.mycanteen.dto.ProfileUpdateDto;
import com.project.mycanteen.dto.UserProfileResponseDto;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.error.ResourceNotFoundException;
import com.project.mycanteen.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileResponseDto getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return mapToResponse(user);
    }

    @Transactional
    public UserProfileResponseDto updateUserProfile(UUID userId, ProfileUpdateDto profileUpdateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (profileUpdateDto == null) {
            return mapToResponse(user);
        }

        if (profileUpdateDto.getFirstName() != null && !profileUpdateDto.getFirstName().isBlank()) {
            user.setFirstName(profileUpdateDto.getFirstName());
        }
        if (profileUpdateDto.getLastName() != null && !profileUpdateDto.getLastName().isBlank()) {
            user.setLastName(profileUpdateDto.getLastName());
        }
        if (profileUpdateDto.getPhoneNumber() != null && !profileUpdateDto.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(profileUpdateDto.getPhoneNumber());
        }
        user.setUpdatedAt(new Date());

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    private UserProfileResponseDto mapToResponse(User user) {
        return UserProfileResponseDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .mailid(user.getMailid())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus().name())
                .walletBalance(user.getWalletBalance())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
