package com.resumeanalyzer.service;

import com.resumeanalyzer.exception.BadRequestException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class PdfParserService {

    public String extractText(MultipartFile file) {
        validatePdfFile(file);
        try {
            PDDocument document = PDDocument.load(file.getInputStream());
            if (document.isEncrypted()) {
                document.close();
                throw new BadRequestException("Encrypted PDF files are not supported.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            document.close();
            if (text == null || text.trim().isEmpty()) {
                throw new BadRequestException("Could not extract text from the PDF. Please upload a text-based PDF (not a scanned image).");
            }
            return text.trim();
        } catch (BadRequestException e) {
            throw e;
        } catch (IOException e) {
            throw new BadRequestException("Failed to read the PDF file: " + e.getMessage());
        }
    }

    private void validatePdfFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a PDF file to upload");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only PDF files are accepted");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size must be less than 10MB");
        }
    }
}