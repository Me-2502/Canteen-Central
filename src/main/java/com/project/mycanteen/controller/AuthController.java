package com.project.mycanteen.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.mycanteen.dto.LoginRequestDto;
import com.project.mycanteen.dto.LoginResponseDto;
import com.project.mycanteen.dto.SignupRequestDto;
import com.project.mycanteen.dto.SignupResponseDto;
import com.project.mycanteen.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto requestDto) {
        System.out.println("Login request received: " + requestDto);
        return ResponseEntity.ok(authService.login(requestDto));
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponseDto> signup(@RequestBody SignupRequestDto requestDto) {
        System.out.println("Signup request received: " + requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(requestDto));
    }
}
