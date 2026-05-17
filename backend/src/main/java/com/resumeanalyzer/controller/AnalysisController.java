package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.AnalysisResultResponse;
import com.resumeanalyzer.dto.AnalyzeRequest;
import com.resumeanalyzer.dto.ApiResponse;
import com.resumeanalyzer.dto.DashboardStatsResponse;
import com.resumeanalyzer.service.AnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<AnalysisResultResponse>> analyzeResume(
            @Valid @RequestBody AnalyzeRequest request) {
        AnalysisResultResponse result = analysisService.analyzeResume(request);
        return ResponseEntity.ok(ApiResponse.success("Analysis completed successfully", result));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AnalysisResultResponse>>> getAnalysisHistory() {
        List<AnalysisResultResponse> history = analysisService.getUserAnalysisHistory();
        return ResponseEntity.ok(ApiResponse.success("Analysis history retrieved", history));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnalysisResultResponse>> getAnalysisById(@PathVariable Long id) {
        AnalysisResultResponse result = analysisService.getAnalysisById(id);
        return ResponseEntity.ok(ApiResponse.success("Analysis result retrieved", result));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = analysisService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", stats));
    }
}
