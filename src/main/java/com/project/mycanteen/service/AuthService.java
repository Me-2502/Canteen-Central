package com.project.mycanteen.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.mycanteen.dto.LoginRequestDto;
import com.project.mycanteen.dto.LoginResponseDto;
import com.project.mycanteen.dto.SignupRequestDto;
import com.project.mycanteen.dto.SignupResponseDto;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.entity.type.EntityStatus;
import com.project.mycanteen.repository.UserRepository;
import com.project.mycanteen.security.AuthUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public LoginResponseDto login(LoginRequestDto request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getMailid(), request.getPassword())
        );
        User user = (User) authentication.getPrincipal();
        String token = authUtil.generateAccessToken(user);
        return new LoginResponseDto(token, user.getId());
    }

    public SignupResponseDto signup(SignupRequestDto request) {
        User user = userRepository.findByMailid(request.getMailid()).orElse(null);
        if(user != null)
            throw new IllegalArgumentException("User already exists");
        user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .mailid(request.getMailid())
                .phoneNumber(request.getPhoneNumber())
                .roles(request.getRoles())
                .status(EntityStatus.ACTIVE)
                .walletBalance(0)
                .build();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);
        return new SignupResponseDto(user.getId(), user.getMailid());
    }
}
