package com.chuka.srms.service;

import com.chuka.srms.model.Enrollment;
import com.chuka.srms.model.ExaminationResult;
import com.chuka.srms.model.Student;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.List;

@Service
public class PdfService {

    public void exportTranscriptToPdf(Student student, List<Enrollment> enrollments, List<ExaminationResult> results, HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=Transcript_" + student.getStudentId() + ".pdf");

        Document document = new Document(PageSize.A4);
        try {
            PdfWriter.getInstance(document, response.getOutputStream());
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            Paragraph title = new Paragraph("CHUKA UNIVERSITY", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph("Student Academic Transcript", FontFactory.getFont(FontFactory.HELVETICA, 14));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            document.add(new Paragraph("Student Name: " + student.getFirstName() + " " + student.getLastName(), boldFont));
            document.add(new Paragraph("Student ID: " + student.getStudentId(), normalFont));
            document.add(new Paragraph("Major: " + student.getMajor(), normalFont));
            document.add(new Paragraph("\n"));

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(5);
            table.setWidthPercentage(100);
            table.addCell(new Phrase("Course ID", boldFont));
            table.addCell(new Phrase("Semester", boldFont));
            table.addCell(new Phrase("Score", boldFont));
            table.addCell(new Phrase("Grade", boldFont));
            table.addCell(new Phrase("Date", boldFont));

            double totalPoints = 0;
            int count = 0;

            for (Enrollment e : enrollments) {
                ExaminationResult result = results.stream().filter(r -> r.getEnrollmentId().equals(e.getEnrollmentId())).findFirst().orElse(null);

                table.addCell(new Phrase(e.getCourseId(), normalFont));
                table.addCell(new Phrase(String.valueOf(e.getSemester()), normalFont));
                table.addCell(new Phrase(result != null ? String.valueOf(result.getScore()) : "-", normalFont));
                table.addCell(new Phrase(result != null ? result.getGrade() : "-", normalFont));
                table.addCell(new Phrase(e.getEnrollmentDate().toString(), normalFont));

                if (result != null) {
                    String grade = result.getGrade();
                    if (grade.equals("A")) totalPoints += 4.0;
                    else if (grade.equals("B")) totalPoints += 3.0;
                    else if (grade.equals("C")) totalPoints += 2.0;
                    else if (grade.equals("D")) totalPoints += 1.0;
                    count++;
                }
            }
            document.add(table);

            if (count > 0) {
                double gpa = totalPoints / count;
                Paragraph gpaPara = new Paragraph("\nCumulative GPA: " + String.format("%.2f", gpa), boldFont);
                document.add(gpaPara);
            }

        } catch (DocumentException e) {
            e.printStackTrace();
        } finally {
            document.close();
        }
    }
}