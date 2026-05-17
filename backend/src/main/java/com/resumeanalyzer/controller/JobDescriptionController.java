package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.ApiResponse;
import com.resumeanalyzer.dto.JobDescriptionRequest;
import com.resumeanalyzer.dto.JobDescriptionResponse;
import com.resumeanalyzer.service.JobDescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-descriptions")
@RequiredArgsConstructor
public class JobDescriptionController {

    private final JobDescriptionService jobDescriptionService;

    @PostMapping
    public ResponseEntity<ApiResponse<JobDescriptionResponse>> saveJobDescription(
            @Valid @RequestBody JobDescriptionRequest request) {
        JobDescriptionResponse response = jobDescriptionService.saveJobDescription(request);
        return ResponseEntity.ok(ApiResponse.success("Job description saved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobDescriptionResponse>>> getUserJobDescriptions() {
        List<JobDescriptionResponse> list = jobDescriptionService.getUserJobDescriptions();
        return ResponseEntity.ok(ApiResponse.success("Job descriptions retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDescriptionResponse>> getJobDescriptionById(@PathVariable Long id) {
        JobDescriptionResponse jd = jobDescriptionService.getJobDescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success("Job description retrieved", jd));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJobDescription(@PathVariable Long id) {
        jobDescriptionService.deleteJobDescription(id);
        return ResponseEntity.ok(ApiResponse.success("Job description deleted successfully", null));
    }
}
