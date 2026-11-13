package com.chuka.srms.controller;

import com.chuka.srms.model.Student;
import com.chuka.srms.repository.StudentRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository repository;

    @GetMapping
    public Page<Student> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody Student student) {
        try {
            // Check if student already exists
            if (repository.existsById(student.getStudentId())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Student ID '" + student.getStudentId() + "' already exists!");
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(repository.save(student));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to save student: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable String id, @RequestBody Student student) {
        try {
            if (!repository.existsById(id)) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Student not found!");
                return ResponseEntity.badRequest().body(response);
            }
            student.setStudentId(id);
            return ResponseEntity.ok(repository.save(student));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to update student: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable String id) {
        try {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete student: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/search")
    public List<Student> searchStudents(@RequestParam String query) {
        List<Student> allStudents = repository.findAll();
        String lowerQuery = query.toLowerCase();
        return allStudents.stream()
                .filter(s -> s.getFirstName().toLowerCase().contains(lowerQuery) ||
                        s.getLastName().toLowerCase().contains(lowerQuery) ||
                        s.getStudentId().toLowerCase().contains(lowerQuery))
                .collect(Collectors.toList());
    }

    @GetMapping("/stats/majors")
    public Map<String, Long> getStudentsByMajor() {
        List<Student> students = repository.findAll();
        return students.stream()
                .collect(Collectors.groupingBy(Student::getMajor, Collectors.counting()));
    }

    @GetMapping("/export")
    public void exportToCSV(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=students.csv");

        List<Student> students = repository.findAll();
        PrintWriter writer = response.getWriter();
        writer.println("Student ID,First Name,Last Name,Major,Status");
        for (Student s : students) {
            writer.println(s.getStudentId() + "," + s.getFirstName() + "," + s.getLastName() + "," + s.getMajor() + "," + s.getAcademicStatus());
        }
        writer.flush();
        writer.close();
    }
}