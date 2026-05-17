package com.resumeanalyzer.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnalyzeRequest {

    @NotNull(message = "Resume ID is required")
    private Long resumeId;

    @NotNull(message = "Job Description ID is required")
    private Long jobDescriptionId;
}
