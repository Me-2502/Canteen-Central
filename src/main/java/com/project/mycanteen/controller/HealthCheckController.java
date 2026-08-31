package com.project.mycanteen.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/health")
public class HealthCheckController {
    
    @GetMapping
    public ResponseEntity<String> getMethodName() {
        return ResponseEntity.ok("Health check successful.");
    }
    
}
