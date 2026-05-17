package com.resumeanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDescriptionResponse {
    private Long id;
    private String jobTitle;
    private String companyName;
    private String description;
    private LocalDateTime createdAt;
}
