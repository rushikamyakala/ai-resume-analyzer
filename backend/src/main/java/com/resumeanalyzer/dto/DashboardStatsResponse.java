package com.resumeanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalResumes;
    private long totalAnalyses;
    private long totalJobDescriptions;
    private Double averageAtsScore;
    private Double highestAtsScore;
}
