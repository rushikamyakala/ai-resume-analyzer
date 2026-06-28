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
    double skillsScore,
    double keywordScore,
    double sectionScore,
    double formattingScore,
    List<String> matchedKeywords,
    List<String> missingKeywords,
    List<String> priorityImprovements,
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
        double keywordScore = jdKeywords.isEmpty()
        ? 0
        : (double) matched.size() / jdKeywords.size() * 100;

double skillsScore = keywordScore;

double sectionScore = calculateSectionBonus(resumeLower);

double formattingScore = calculateLengthBonus(resumeText);

double finalScore =
        (skillsScore * 0.50) +
        (keywordScore * 0.20) +
        (sectionScore * 0.20) +
        (formattingScore * 0.10);

finalScore = Math.min(100, Math.round(finalScore * 10.0) / 10.0);

        String skillsAnalysis = buildSkillsAnalysis(matched, missing, finalScore);

        List<String> priorityImprovements = buildPriorityImprovements(missing);

return new AtsAnalysisResult(
        finalScore,
        skillsScore,
        keywordScore,
        sectionScore,
        formattingScore,
        matched,
        missing,
        priorityImprovements,
        skillsAnalysis
);
    }

    private Set<String> extractKeywords(String text) {

    Set<String> found = new LinkedHashSet<>();

    String lower = text.toLowerCase();

    // Only extract known technical keywords
    for (String keyword : COMMON_TECH_KEYWORDS) {

        if (containsKeyword(lower, keyword)) {
            found.add(keyword);
        }

    }

    return found;
}

    private boolean containsKeyword(String text, String keyword) {

    String escaped = java.util.regex.Pattern.quote(keyword);

    return text.matches("(?s).*\\b" + escaped + "\\b.*");

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
    private List<String> buildPriorityImprovements(List<String> missing) {

    List<String> improvements = new ArrayList<>();

    for (String skill : missing) {

        switch (skill.toLowerCase()) {

            case "docker" ->
                    improvements.add("Add a Docker project or mention Docker experience.");

            case "redis" ->
                    improvements.add("Learn Redis caching and include it in a project.");

            case "ci/cd" ->
                    improvements.add("Add GitHub Actions or CI/CD pipeline experience.");

            case "junit" ->
                    improvements.add("Write unit tests using JUnit and mention testing.");

            case "spring security" ->
                    improvements.add("Implement authentication using Spring Security.");

            case "rest" ->
                    improvements.add("Highlight REST API development in your projects.");

            default ->
                    improvements.add("Include practical experience with " + skill + ".");
        }
    }

    return improvements.stream().limit(5).toList();
}
}
