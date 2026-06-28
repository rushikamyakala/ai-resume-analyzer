
package com.resumeanalyzer.service;

import com.resumeanalyzer.model.AnalysisResult;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class PdfReportService {
    public byte[] generateReport(AnalysisResult result) {

    try (PDDocument document = new PDDocument()) {

        PDPage page = new PDPage();
        document.addPage(page);

        PDPageContentStream content = new PDPageContentStream(document, page);

        float y = 760;

        // ========= TITLE =========
        content.beginText();
        content.setFont(PDType1Font.HELVETICA_BOLD, 22);
        content.newLineAtOffset(50, y);
        content.showText("CareerLens AI");
        content.endText();

        y -= 25;

        content.beginText();
        content.setFont(PDType1Font.HELVETICA_BOLD, 14);
        content.newLineAtOffset(50, y);
        content.showText("Resume Analysis Report");
        content.endText();

        y -= 35;

        // ========= BASIC DETAILS =========

        y = writeLine(content, y,
                "Resume: " + result.getResume().getFileName());

        y = writeLine(content, y,
                "Job Title: " + result.getJobDescription().getJobTitle());

        y = writeLine(content, y,
                "Company: " + result.getJobDescription().getCompanyName());

        y -= 15;

        // ========= ATS =========

        y = writeBold(content, y, "Overall ATS Score");

        y = writeLine(content, y,
                result.getAtsScore() + "%");

        y -= 15;

        // ========= BREAKDOWN =========

        y = writeBold(content, y, "ATS Score Breakdown");

        y = writeLine(content, y,
                "Skills Match : " + result.getSkillsScore() + "%");

        y = writeLine(content, y,
                "Keyword Match : " + result.getKeywordScore() + "%");

        y = writeLine(content, y,
                "Resume Sections : " + result.getSectionScore() + "%");

        y = writeLine(content, y,
                "Formatting : " + result.getFormattingScore() + "%");

        y -= 15;

        // ========= MATCHED =========

        y = writeBold(content, y, "Matched Skills");

        y = writeParagraph(content, y,
                result.getMatchedKeywords());

        y -= 10;

        // ========= MISSING =========

        y = writeBold(content, y, "Missing Skills");

        y = writeParagraph(content, y,
                result.getMissingKeywords());

        y -= 10;

        // ========= PRIORITY =========

        y = writeBold(content, y,
                "Priority Improvements");

        y = writeParagraph(content, y,
                result.getPriorityImprovements());

        y -= 10;

        // ========= AI =========

        y = writeBold(content, y,
                "AI Suggestions");

        y = writeParagraph(content, y,
                result.getAiSuggestions());

        content.close();

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        document.save(out);

        return out.toByteArray();

    } catch (IOException e) {

        throw new RuntimeException(e);

    }

}
private float writeBold(PDPageContentStream content, float y, String text) throws IOException {

    content.beginText();
    content.setFont(PDType1Font.HELVETICA_BOLD, 13);
    content.newLineAtOffset(50, y);
    content.showText(text);
    content.endText();

    return y - 18;
}

private float writeLine(PDPageContentStream content, float y, String text) throws IOException {

    content.beginText();
    content.setFont(PDType1Font.HELVETICA, 11);
    content.newLineAtOffset(50, y);
    content.showText(text);
    content.endText();

    return y - 16;
}

private float writeParagraph(PDPageContentStream content, float y, Object value) throws IOException {

    String text = value == null ? "-" : value.toString();

// Remove unsupported Unicode/emojis
text = text.replaceAll("[^\\x00-\\x7F]", "");

    String[] lines = text.split(",");

    for (String line : lines) {

        content.beginText();

        content.setFont(PDType1Font.HELVETICA, 11);

        content.newLineAtOffset(60, y);

        content.showText("- " + line.trim());

        content.endText();

        y -= 15;

    }

    return y;
}
}
