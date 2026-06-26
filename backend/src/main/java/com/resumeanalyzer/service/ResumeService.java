package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.ResumeResponse;
import com.resumeanalyzer.exception.BadRequestException;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.model.User;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final PdfParserService pdfParserService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ResumeResponse uploadResume(MultipartFile file) {
        User currentUser = getCurrentUser();

        // Extract text from PDF
        String extractedText = pdfParserService.extractText(file);

        // Save file to disk
        String savedFileName = saveFileToDisk(file);

        // Save resume entity to DB
        Resume resume = Resume.builder()
                .fileName(file.getOriginalFilename())
                .filePath(savedFileName)
                .extractedText(extractedText)
                .user(currentUser)
                .build();

        Resume savedResume = resumeRepository.save(resume);

        return mapToResponse(savedResume);
    }

    public List<ResumeResponse> getUserResumes() {
        User currentUser = getCurrentUser();
        return resumeRepository.findByUserOrderByUploadedAtDesc(currentUser)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ResumeResponse getResumeById(Long id) {
        User currentUser = getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));
        return mapToResponse(resume);
    }

    public void deleteResume(Long id) {
        User currentUser = getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

        // Delete file from disk
        try {
            Path filePath = Paths.get(uploadDir).resolve(resume.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't fail if file deletion fails
        }

        resumeRepository.delete(resume);
    }

    public Resume getResumeEntityById(Long id, User user) {
        return resumeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));
    }

    private String saveFileToDisk(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path targetPath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return uniqueFileName;
        } catch (IOException e) {
            throw new BadRequestException("Failed to save the file: " + e.getMessage());
        }
    }

    private ResumeResponse mapToResponse(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .uploadedAt(resume.getUploadedAt())
                .hasText(resume.getExtractedText() != null && !resume.getExtractedText().isEmpty())
                .build();
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public ResumeResponse renameResume(Long id, String newFileName) {
        if (newFileName == null || newFileName.trim().isEmpty()) {
            throw new BadRequestException("File name cannot be empty");
        }
        User currentUser = getCurrentUser();
        Resume resume = resumeRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        resume.setFileName(newFileName.trim());
        Resume saved = resumeRepository.save(resume);
        return mapToResponse(saved);
    }
}