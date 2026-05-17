package com.resumeanalyzer.repository;

import com.resumeanalyzer.model.AnalysisResult;
import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {

    @Query("SELECT a FROM AnalysisResult a WHERE a.resume.user = :user ORDER BY a.analyzedAt DESC")
    List<AnalysisResult> findByUserOrderByAnalyzedAtDesc(@Param("user") User user);

    List<AnalysisResult> findByResumeOrderByAnalyzedAtDesc(Resume resume);

    @Query("SELECT COUNT(a) FROM AnalysisResult a WHERE a.resume.user = :user")
    long countByUser(@Param("user") User user);

    @Query("SELECT AVG(a.atsScore) FROM AnalysisResult a WHERE a.resume.user = :user")
    Double findAverageScoreByUser(@Param("user") User user);

    @Query("SELECT MAX(a.atsScore) FROM AnalysisResult a WHERE a.resume.user = :user")
    Double findHighestScoreByUser(@Param("user") User user);

    Optional<AnalysisResult> findByIdAndResumeUser(Long id, User user);
}
