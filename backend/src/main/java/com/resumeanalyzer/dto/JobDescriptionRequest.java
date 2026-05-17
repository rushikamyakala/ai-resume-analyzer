package com.resumeanalyzer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobDescriptionRequest {

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Job description is required")
    private String description;
}
