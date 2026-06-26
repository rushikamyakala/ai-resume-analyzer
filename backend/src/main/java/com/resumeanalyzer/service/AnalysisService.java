package com.resumeanalyzer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.AnalysisResultResponse;
import com.resumeanalyzer.dto.AnalyzeRequest;
import com.resumeanalyzer.dto.DashboardStatsResponse;
import com.resumeanalyzer.exception.BadRequestException;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.model.AnalysisResult;
import com.resumeanalyzer.model.JobDescription;
import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.model.User;
import com.resumeanalyzer.repository.AnalysisResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final AnalysisResultRepository analysisResultRepository;
    private final ResumeService resumeService;
    private final JobDescriptionService jobDescriptionService;
    private final AtsScoreCalculatorService atsCalculator;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnalysisResultResponse analyzeResume(AnalyzeRequest request) {
        User currentUser = resumeService.getCurrentUser();

        Resume resume = resumeService.getResumeEntityById(request.getResumeId(), currentUser);
        JobDescription jobDescription = jobDescriptionService.getJobDescriptionEntityById(
                request.getJobDescriptionId(), currentUser);

        if (resume.getExtractedText() == null || resume.getExtractedText().isBlank()) {
            throw new BadRequestException("Resume has no extractable text. Please upload a text-based PDF.");
        }

        // Calculate ATS score
        AtsScoreCalculatorService.AtsAnalysisResult atsResult =
                atsCalculator.calculateScore(resume.getExtractedText(), jobDescription.getDescription());

        // Get AI suggestions
        String aiSuggestions = geminiAiService.generateResumeSuggestions(
                resume.getExtractedText(),
                jobDescription.getDescription(),
                atsResult.missingKeywords(),
                atsResult.score()
        );

        // Serialize keyword lists to JSON strings for DB storage
        String matchedJson = toJson(atsResult.matchedKeywords());
        String missingJson = toJson(atsResult.missingKeywords());

        // Save analysis result
        AnalysisResult analysisResult = AnalysisResult.builder()
                .atsScore(atsResult.score())
                .matchedKeywords(matchedJson)
                .missingKeywords(missingJson)
                .aiSuggestions(aiSuggestions)
                .skillsAnalysis(atsResult.skillsAnalysis())
                .resume(resume)
                .jobDescription(jobDescription)
                .build();

        AnalysisResult saved = analysisResultRepository.save(analysisResult);
        return mapToResponse(saved);
    }
    public String generateCoverLetter(Long resumeId, Long jobDescriptionId) {

    User currentUser = resumeService.getCurrentUser();

    Resume resume = resumeService.getResumeEntityById(resumeId, currentUser);

    JobDescription jobDescription =
            jobDescriptionService.getJobDescriptionEntityById(jobDescriptionId, currentUser);

    return geminiAiService.generateCoverLetter(
            resume.getExtractedText(),
            jobDescription.getDescription()
    );
}

    public List<AnalysisResultResponse> getUserAnalysisHistory() {
        User currentUser = resumeService.getCurrentUser();
        return analysisResultRepository.findByUserOrderByAnalyzedAtDesc(currentUser)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AnalysisResultResponse getAnalysisById(Long id) {
        User currentUser = resumeService.getCurrentUser();
        AnalysisResult result = analysisResultRepository.findByIdAndResumeUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis result not found with id: " + id));
        return mapToResponse(result);
    }

    public DashboardStatsResponse getDashboardStats() {
        User currentUser = resumeService.getCurrentUser();
        long totalResumes = resumeService.getUserResumes().size();
        long totalAnalyses = analysisResultRepository.countByUser(currentUser);
        long totalJobDescriptions = jobDescriptionService.getUserJobDescriptions().size();
        Double avgScore = analysisResultRepository.findAverageScoreByUser(currentUser);
        Double highestScore = analysisResultRepository.findHighestScoreByUser(currentUser);

        return DashboardStatsResponse.builder()
                .totalResumes(totalResumes)
                .totalAnalyses(totalAnalyses)
                .totalJobDescriptions(totalJobDescriptions)
                .averageAtsScore(avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0)
                .highestAtsScore(highestScore != null ? highestScore : 0.0)
                .build();
    }

    private AnalysisResultResponse mapToResponse(AnalysisResult result) {
        return AnalysisResultResponse.builder()
                .id(result.getId())
                .atsScore(result.getAtsScore())
                .matchedKeywords(fromJson(result.getMatchedKeywords()))
                .missingKeywords(fromJson(result.getMissingKeywords()))
                .aiSuggestions(result.getAiSuggestions())
                .skillsAnalysis(result.getSkillsAnalysis())
                .analyzedAt(result.getAnalyzedAt())
                .resumeFileName(result.getResume().getFileName())
                .jobTitle(result.getJobDescription().getJobTitle())
                .companyName(result.getJobDescription().getCompanyName())
                .resumeId(result.getResume().getId())
                .jobDescriptionId(result.getJobDescription().getId())
                .build();
    }

    private String toJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
