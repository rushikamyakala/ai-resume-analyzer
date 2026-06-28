package com.resumeanalyzer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double atsScore;
    @Column(nullable = false)
private Double skillsScore;

@Column(nullable = false)
private Double keywordScore;

@Column(nullable = false)
private Double sectionScore;

@Column(nullable = false)
private Double formattingScore;

    @Column(columnDefinition = "LONGTEXT")
    private String matchedKeywords;

    @Column(columnDefinition = "LONGTEXT")
    private String missingKeywords;

    @Column(columnDefinition = "LONGTEXT")
    private String aiSuggestions;

    @Column(columnDefinition = "LONGTEXT")
private String skillsAnalysis;

@Column(columnDefinition = "LONGTEXT")
private String priorityImprovements;

@Column(nullable = false, updatable = false)
private LocalDateTime analyzedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_description_id", nullable = false)
    private JobDescription jobDescription;

    @PrePersist
    protected void onCreate() {
        analyzedAt = LocalDateTime.now();
    }
}
