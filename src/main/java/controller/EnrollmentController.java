package com.chuka.srms.controller;

import com.chuka.srms.model.Enrollment;
import com.chuka.srms.repository.EnrollmentRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    @Autowired
    private EnrollmentRepository repository;

    @GetMapping
    public List<Enrollment> getAllEnrollments() {
        return repository.findAll();
    }

    @PostMapping
    public Enrollment addEnrollment(@RequestBody Enrollment enrollment) {
        return repository.save(enrollment);
    }

    @PostMapping("/bulk")
    public List<Enrollment> bulkEnroll(@RequestBody List<Enrollment> enrollments) {
        return repository.saveAll(enrollments);
    }

    @PutMapping("/{id}")
    public Enrollment updateEnrollment(@PathVariable String id, @RequestBody Enrollment enrollment) {
        enrollment.setEnrollmentId(id);
        return repository.save(enrollment);
    }

    @DeleteMapping("/{id}")
    public void deleteEnrollment(@PathVariable String id) {
        repository.deleteById(id);
    }

    // --- CHART STATS ---
    @GetMapping("/stats/semesters")
    public Map<String, Long> getEnrollmentsBySemester() {
        List<Enrollment> enrollments = repository.findAll();
        return enrollments.stream()
                .collect(Collectors.groupingBy(
                        e -> "Semester " + e.getSemester(),
                        Collectors.counting()));
    }

    // --- CSV EXPORT ---
    @GetMapping("/export")
    public void exportToCSV(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=enrollments.csv");

        List<Enrollment> enrollments = repository.findAll();
        PrintWriter writer = response.getWriter();
        writer.println("Enrollment ID,Student ID,Course ID,Semester,Year,Date");
        for (Enrollment e : enrollments) {
            writer.println(e.getEnrollmentId() + "," +
                    e.getStudentId() + "," +
                    e.getCourseId() + "," +
                    e.getSemester() + "," +
                    e.getYear() + "," +
                    e.getEnrollmentDate());
        }
        writer.flush();
        writer.close();
    }
}