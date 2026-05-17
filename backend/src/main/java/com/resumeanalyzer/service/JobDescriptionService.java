package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.JobDescriptionRequest;
import com.resumeanalyzer.dto.JobDescriptionResponse;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.model.JobDescription;
import com.resumeanalyzer.model.User;
import com.resumeanalyzer.repository.JobDescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobDescriptionService {

    private final JobDescriptionRepository jobDescriptionRepository;
    private final ResumeService resumeService;

    public JobDescriptionResponse saveJobDescription(JobDescriptionRequest request) {
        User currentUser = resumeService.getCurrentUser();

        JobDescription jobDescription = JobDescription.builder()
                .jobTitle(request.getJobTitle())
                .companyName(request.getCompanyName())
                .description(request.getDescription())
                .user(currentUser)
                .build();

        JobDescription saved = jobDescriptionRepository.save(jobDescription);
        return mapToResponse(saved);
    }

    public List<JobDescriptionResponse> getUserJobDescriptions() {
        User currentUser = resumeService.getCurrentUser();
        return jobDescriptionRepository.findByUserOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public JobDescriptionResponse getJobDescriptionById(Long id) {
        User currentUser = resumeService.getCurrentUser();
        JobDescription jd = jobDescriptionRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Job description not found with id: " + id));
        return mapToResponse(jd);
    }

    public void deleteJobDescription(Long id) {
        User currentUser = resumeService.getCurrentUser();
        JobDescription jd = jobDescriptionRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Job description not found with id: " + id));
        jobDescriptionRepository.delete(jd);
    }

    public JobDescription getJobDescriptionEntityById(Long id, User user) {
        return jobDescriptionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Job description not found with id: " + id));
    }

    private JobDescriptionResponse mapToResponse(JobDescription jd) {
        return JobDescriptionResponse.builder()
                .id(jd.getId())
                .jobTitle(jd.getJobTitle())
                .companyName(jd.getCompanyName())
                .description(jd.getDescription())
                .createdAt(jd.getCreatedAt())
                .build();
    }
}
