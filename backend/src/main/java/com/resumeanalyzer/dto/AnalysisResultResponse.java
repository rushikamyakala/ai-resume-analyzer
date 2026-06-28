package com.resumeanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResultResponse {
    private Long id;
    private Double atsScore;
    private Double skillsScore;

private Double keywordScore;

private Double sectionScore;

private Double formattingScore;
    private List<String> matchedKeywords;
private List<String> missingKeywords;
private List<String> priorityImprovements;

private String aiSuggestions;
    private String skillsAnalysis;
    private LocalDateTime analyzedAt;
    private String resumeFileName;
    private String jobTitle;
    private String companyName;
    private Long resumeId;
    private Long jobDescriptionId;
}
