package com.resumeanalyzer.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AtsScoreCalculatorService {

    // Common tech keywords to extract from text
    private static final Set<String> COMMON_TECH_KEYWORDS = new HashSet<>(Arrays.asList(
        "java", "python", "javascript", "typescript", "react", "angular", "vue", "nodejs", "node.js",
        "spring", "spring boot", "django", "flask", "fastapi", "express", "nestjs",
        "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "oracle", "sqlite",
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
        "git", "github", "gitlab", "jenkins", "ci/cd", "devops",
        "rest", "api", "graphql", "microservices", "agile", "scrum",
        "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
        "html", "css", "sass", "tailwind", "bootstrap", "webpack", "vite",
        "linux", "bash", "shell", "powershell",
        "oauth", "jwt", "ssl", "https", "security",
        "kafka", "rabbitmq", "redis", "celery",
        "jira", "confluence", "slack",
        "testing", "junit", "jest", "selenium", "cypress",
        "sql", "nosql", "hibernate", "jpa", "orm",
        "design patterns", "solid", "clean code", "tdd", "ddd",
        "data structures", "algorithms", "system design",
        "communication", "teamwork", "leadership", "problem solving",
        "project management", "time management", "analytical", "critical thinking",
        "c++", "c#", "golang", "go", "rust", "kotlin", "swift", "scala", "ruby", "php",
        "hadoop", "spark", "hive", "tableau", "power bi",
        "figma", "adobe xd", "photoshop",
        "blockchain", "web3", "solidity",
        "nlp", "computer vision", "opencv"
    ));

    public record AtsAnalysisResult(
        double score,
        List<String> matchedKeywords,
        List<String> missingKeywords,
        String skillsAnalysis
    ) {}

    public AtsAnalysisResult calculateScore(String resumeText, String jobDescription) {
        String resumeLower = resumeText.toLowerCase();
        String jdLower = jobDescription.toLowerCase();

        // Extract keywords from job description
        Set<String> jdKeywords = extractKeywords(jdLower);

        // Find what matches and what's missing
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String keyword : jdKeywords) {
            if (containsKeyword(resumeLower, keyword)) {
                matched.add(keyword);
            } else {
                missing.add(keyword);
            }
        }

        // Calculate base score from keyword match
        double keywordScore = jdKeywords.isEmpty() ? 0 :
                (double) matched.size() / jdKeywords.size() * 100;

        // Apply bonuses
        double lengthBonus = calculateLengthBonus(resumeText);
        double sectionBonus = calculateSectionBonus(resumeLower);

        // Final weighted score
        double finalScore = (keywordScore * 0.70) + (lengthBonus * 0.15) + (sectionBonus * 0.15);
        finalScore = Math.min(100, Math.round(finalScore * 10.0) / 10.0);

        String skillsAnalysis = buildSkillsAnalysis(matched, missing, finalScore);

        return new AtsAnalysisResult(finalScore, matched, missing, skillsAnalysis);
    }

    private Set<String> extractKeywords(String text) {
        Set<String> found = new LinkedHashSet<>();

        // Check for known tech keywords
        for (String keyword : COMMON_TECH_KEYWORDS) {
            if (containsKeyword(text, keyword)) {
                found.add(keyword);
            }
        }

        // Extract additional multi-word phrases (2-3 words) from job description
        String[] words = text.split("[\\s,;:.()\\[\\]]+");
        for (int i = 0; i < words.length - 1; i++) {
            String w1 = words[i].trim();
            String w2 = words[i + 1].trim();
            if (w1.length() > 2 && w2.length() > 2) {
                String phrase = w1 + " " + w2;
                if (isRelevantKeyword(phrase)) {
                    found.add(phrase);
                }
            }
        }

        // Extract single meaningful word

        return found;
    }

    private boolean containsKeyword(String text, String keyword) {
        // Check as whole word or phrase
        String escapedKeyword = keyword.replace(".", "\\.");
        String pattern = "(?i)(^|[\\s,;:.()\\[\\]/])(" + escapedKeyword + ")($|[\\s,;:.()\\[\\]/])";
        try {
            return text.matches(".*" + pattern + ".*") || text.contains(keyword);
        } catch (Exception e) {
            return text.contains(keyword);
        }
    }

    private boolean isRelevantKeyword(String word) {
    return COMMON_TECH_KEYWORDS.contains(word.toLowerCase());
}

    private boolean isStopWord(String word) {
        Set<String> stopWords = Set.of(
            "the", "and", "for", "with", "that", "this", "from", "have", "will",
            "are", "was", "were", "been", "has", "had", "not", "you", "your",
            "our", "their", "they", "what", "which", "who", "when", "where",
            "how", "can", "may", "should", "must", "able", "work", "team",
            "year", "years", "experience", "using", "strong", "good", "knowledge",
            "understanding", "ability", "skills", "skill", "including", "such",
            "also", "more", "than", "other", "into", "some", "each", "both",
            "location", "hyderabad", "telangana","india","employment",
"available",
"position",
"company",
"candidate",
"responsibilities",
"requirements",
"qualification",
"preferred",
"apply",
"opportunity",
"office",
"remote",
"hybrid",
"onsite"
        );
        return stopWords.contains(word.toLowerCase());
    }

    private double calculateLengthBonus(String resumeText) {
        int length = resumeText.trim().split("\\s+").length;
        if (length >= 300 && length <= 800) return 100;
        if (length >= 200 && length < 300) return 75;
        if (length > 800 && length <= 1200) return 80;
        if (length < 200) return 40;
        return 60;
    }

    private double calculateSectionBonus(String resumeLower) {
        double bonus = 0;
        String[] importantSections = {
            "experience", "education", "skills", "projects",
            "summary", "objective", "certifications", "achievements"
        };
        for (String section : importantSections) {
            if (resumeLower.contains(section)) {
                bonus += 100.0 / importantSections.length;
            }
        }
        return bonus;
    }

    private String buildSkillsAnalysis(List<String> matched, List<String> missing, double score) {
        StringBuilder sb = new StringBuilder();
        String level = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";
        sb.append("ATS Match Level: ").append(level).append("\n\n");
        sb.append("Matched Skills (").append(matched.size()).append("): ");
        sb.append(matched.isEmpty() ? "None detected" : String.join(", ", matched)).append("\n\n");
        sb.append("Missing Skills (").append(missing.size()).append("): ");
        sb.append(missing.isEmpty() ? "All key skills found!" : String.join(", ", missing));
        return sb.toString();
    }
}
