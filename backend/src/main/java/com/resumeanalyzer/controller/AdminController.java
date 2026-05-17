package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.ApiResponse;
import com.resumeanalyzer.model.User;
import com.resumeanalyzer.repository.AnalysisResultRepository;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final AnalysisResultRepository analysisResultRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalResumes", resumeRepository.count());
        stats.put("totalAnalyses", analysisResultRepository.count());
        return ResponseEntity.ok(ApiResponse.success("System stats retrieved", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("fullName", user.getFullName());
            map.put("email", user.getEmail());
            map.put("role", user.getRole());
            map.put("createdAt", user.getCreatedAt());
            map.put("resumeCount", resumeRepository.countByUser(user));
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }
}
