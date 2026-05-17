package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.ApiResponse;
import com.resumeanalyzer.dto.ResumeResponse;
import com.resumeanalyzer.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(
            @RequestParam("file") MultipartFile file) {
        ResumeResponse response = resumeService.uploadResume(file);
        return ResponseEntity.ok(ApiResponse.success("Resume uploaded and parsed successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> getUserResumes() {
        List<ResumeResponse> resumes = resumeService.getUserResumes();
        return ResponseEntity.ok(ApiResponse.success("Resumes retrieved successfully", resumes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> getResumeById(@PathVariable Long id) {
        ResumeResponse resume = resumeService.getResumeById(id);
        return ResponseEntity.ok(ApiResponse.success("Resume retrieved successfully", resume));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(@PathVariable Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.ok(ApiResponse.success("Resume deleted successfully", null));
    }

@PutMapping("/{id}/rename")
    public ResponseEntity<ApiResponse<ResumeResponse>> renameResume(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        ResumeResponse response = resumeService.renameResume(id, body.get("fileName"));
        return ResponseEntity.ok(ApiResponse.success("Resume renamed successfully", response));
    }
}
