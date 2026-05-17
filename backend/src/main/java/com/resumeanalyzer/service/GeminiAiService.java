package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class GeminiAiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateResumeSuggestions(
            String resumeText,
            String jobDescription,
            List<String> missingKeywords,
            double atsScore
    ) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your-gemini-api-key-here")) {
            return generateFallbackSuggestions(missingKeywords, atsScore);
        }

        try {
            String prompt = buildPrompt(resumeText, jobDescription, missingKeywords, atsScore);
            String response = callGeminiApi(prompt);
            return response != null && !response.isBlank() ? response : generateFallbackSuggestions(missingKeywords, atsScore);
        } catch (Exception e) {
            logger.error("Gemini API call failed, using fallback suggestions: {}", e.getMessage());
            return generateFallbackSuggestions(missingKeywords, atsScore);
        }
    }

    private String callGeminiApi(String prompt) throws IOException {
        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contents = requestBody.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        ObjectNode part = parts.addObject();
        part.put("text", prompt);

        // Generation config
        ObjectNode generationConfig = requestBody.putObject("generationConfig");
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 1500);

        String requestJson = objectMapper.writeValueAsString(requestBody);

        Request request = new Request.Builder()
                .url(apiUrl + "?key=" + apiKey)
                .post(RequestBody.create(requestJson, MediaType.get("application/json")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                logger.error("Gemini API error: {} - {}", response.code(), response.message());
                return null;
            }

            String responseBody = response.body() != null ? response.body().string() : null;
            if (responseBody == null) return null;

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.get("candidates");

            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                JsonNode candidate = candidates.get(0);
                JsonNode contentNode = candidate.get("content");
                if (contentNode != null) {
                    JsonNode partsNode = contentNode.get("parts");
                    if (partsNode != null && partsNode.isArray() && partsNode.size() > 0) {
                        return partsNode.get(0).get("text").asText();
                    }
                }
            }
        }
        return null;
    }

    private String buildPrompt(String resumeText, String jobDescription, List<String> missingKeywords, double atsScore) {
        return String.format("""
                You are an expert ATS (Applicant Tracking System) resume consultant and career coach.
                
                Analyze the following resume against the job description and provide detailed, actionable improvement suggestions.
                
                ATS Score: %.1f%%
                Missing Keywords: %s
                
                JOB DESCRIPTION:
                %s
                
                RESUME TEXT:
                %s
                
                Provide a comprehensive analysis with the following sections:
                
                ## 🎯 Executive Summary
                Brief overview of the candidate's fit for the role.
                
                ## ✅ Strengths
                What the candidate is doing well (3-5 specific points).
                
                ## 🔧 Immediate Improvements Needed
                The most critical changes to make right now (prioritized list).
                
                ## 📝 Missing Keywords to Add
                Specific keywords from the job description missing in the resume and how to naturally incorporate them.
                
                ## 💼 Experience Section Improvements
                How to rewrite/strengthen experience bullet points with STAR format and quantifiable achievements.
                
                ## 🚀 Skills Section Recommendations
                Skills to add, remove, or reorganize.
                
                ## 📊 ATS Optimization Tips
                Specific formatting and structural improvements for better ATS parsing.
                
                ## 💡 Overall Recommendation
                Clear next steps the candidate should take.
                
                Be specific, actionable, and encouraging. Use examples where possible.
                """,
                atsScore,
                missingKeywords.isEmpty() ? "None" : String.join(", ", missingKeywords),
                jobDescription.substring(0, Math.min(jobDescription.length(), 2000)),
                resumeText.substring(0, Math.min(resumeText.length(), 2000))
        );
    }

    private String generateFallbackSuggestions(List<String> missingKeywords, double atsScore) {
        StringBuilder sb = new StringBuilder();

        sb.append("## 🎯 Executive Summary\n");
        if (atsScore >= 75) {
            sb.append("Your resume shows a strong match with this job description. A few targeted improvements can push it even higher.\n\n");
        } else if (atsScore >= 50) {
            sb.append("Your resume has a moderate match. With the right keyword additions and restructuring, you can significantly improve your ATS score.\n\n");
        } else {
            sb.append("Your resume needs significant work to match this job description. Focus on adding relevant keywords and restructuring your content.\n\n");
        }

        sb.append("## ✅ Strengths\n");
        sb.append("- Your resume contains relevant experience that aligns with parts of the job description\n");
        sb.append("- The document structure is readable by ATS systems\n");
        sb.append("- You have included professional experience details\n\n");

        sb.append("## 🔧 Immediate Improvements Needed\n");
        sb.append("- Add quantifiable achievements to each work experience bullet point (e.g., 'Increased performance by 30%')\n");
        sb.append("- Include a professional summary at the top that mirrors language from the job description\n");
        sb.append("- Ensure your contact information (LinkedIn, GitHub, portfolio) is included\n");
        sb.append("- Use standard section headings: Summary, Experience, Education, Skills, Projects\n\n");

        if (!missingKeywords.isEmpty()) {
            sb.append("## 📝 Missing Keywords to Add\n");
            sb.append("These keywords appear in the job description but are missing from your resume. Add them naturally:\n");
            for (String keyword : missingKeywords.subList(0, Math.min(missingKeywords.size(), 15))) {
                sb.append("- **").append(keyword).append("**: Add to your skills section or work experience descriptions\n");
            }
            sb.append("\n");
        }

        sb.append("## 💼 Experience Section Improvements\n");
        sb.append("- Use the STAR format: Situation, Task, Action, Result\n");
        sb.append("- Start each bullet with a strong action verb (Developed, Implemented, Optimized, Led, Designed)\n");
        sb.append("- Include metrics wherever possible: percentages, dollar amounts, user counts, time saved\n");
        sb.append("- Tailor descriptions to match the language used in the job description\n\n");

        sb.append("## 🚀 Skills Section Recommendations\n");
        sb.append("- Organize skills by category: Programming Languages, Frameworks, Databases, Tools, Cloud\n");
        sb.append("- Remove generic skills like 'Microsoft Office' unless specifically required\n");
        sb.append("- Add proficiency levels if appropriate (e.g., Expert, Proficient, Familiar)\n\n");

        sb.append("## 📊 ATS Optimization Tips\n");
        sb.append("- Use a simple, single-column layout without tables or graphics\n");
        sb.append("- Use standard fonts (Arial, Calibri, Times New Roman) at 10-12pt\n");
        sb.append("- Save as PDF to preserve formatting\n");
        sb.append("- Avoid headers/footers with important information\n");
        sb.append("- Spell out acronyms at least once (e.g., 'Application Programming Interface (API)')\n\n");

        sb.append("## 💡 Overall Recommendation\n");
        sb.append("Focus on: (1) Adding the missing keywords naturally into your experience, (2) Quantifying your achievements, ");
        sb.append("and (3) Tailoring your professional summary to this specific role. ");
        sb.append("Aim to mirror the exact language used in the job description where your experience genuinely matches.");

        return sb.toString();
    }
}
