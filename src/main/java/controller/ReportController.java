package com.chuka.srms.controller;

import com.chuka.srms.model.Enrollment;
import com.chuka.srms.model.ExaminationResult;
import com.chuka.srms.model.Student;
import com.chuka.srms.repository.EnrollmentRepository;
import com.chuka.srms.repository.ExaminationResultRepository;
import com.chuka.srms.repository.StudentRepository;
import com.chuka.srms.service.PdfService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private EnrollmentRepository enrollmentRepo;

    @Autowired
    private ExaminationResultRepository resultRepo;

    @Autowired
    private PdfService pdfService;

    @GetMapping("/transcript/{studentId}")
    public Map<String, Object> getTranscript(@PathVariable String studentId) {
        Map<String, Object> response = new HashMap<>();

        Optional<Student> student = studentRepo.findById(studentId);
        if (student.isEmpty()) {
            response.put("error", "Student not found");
            return response;
        }

        response.put("student", student.get());

        List<Enrollment> allEnrollments = enrollmentRepo.findAll();
        List<Enrollment> studentEnrollments = new ArrayList<>();
        for (Enrollment e : allEnrollments) {
            if (e.getStudentId().equals(studentId)) {
                studentEnrollments.add(e);
            }
        }
        response.put("enrollments", studentEnrollments);

        List<ExaminationResult> allResults = resultRepo.findAll();
        List<ExaminationResult> studentResults = new ArrayList<>();
        for (ExaminationResult r : allResults) {
            for (Enrollment e : studentEnrollments) {
                if (e.getEnrollmentId().equals(r.getEnrollmentId())) {
                    studentResults.add(r);
                    break;
                }
            }
        }
        response.put("results", studentResults);

        return response;
    }

    @GetMapping("/transcript/{studentId}/pdf")
    public void downloadPdf(@PathVariable String studentId, HttpServletResponse response) throws IOException {
        Map<String, Object> data = getTranscript(studentId);
        if (data.containsKey("error")) {
            response.sendError(404, "Student not found");
            return;
        }

        Student student = (Student) data.get("student");
        List<Enrollment> enrollments = (List<Enrollment>) data.get("enrollments");
        List<ExaminationResult> results = (List<ExaminationResult>) data.get("results");

        pdfService.exportTranscriptToPdf(student, enrollments, results, response);
    }
}