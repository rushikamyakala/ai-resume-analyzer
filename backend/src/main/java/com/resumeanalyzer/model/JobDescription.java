package com.resumeanalyzer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "job_descriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String jobTitle;

    @Column(nullable = false)
    private String companyName;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "jobDescription", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AnalysisResult> analysisResults;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
