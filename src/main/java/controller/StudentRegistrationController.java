package com.chuka.srms.controller;

import com.chuka.srms.model.StudentRegistration;
import com.chuka.srms.repository.StudentRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/register")
@CrossOrigin(origins = "*")
public class StudentRegistrationController {

    @Autowired
    private StudentRegistrationRepository repository;

    @PostMapping
    public ResponseEntity<?> registerStudent(@RequestBody StudentRegistration reg) {
        try {
            repository.save(reg);
            return ResponseEntity.ok(Map.of("message", "Registration submitted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists or invalid data."));
        }
    }

    @GetMapping
    public List<StudentRegistration> getAllRegistrations() {
        return repository.findAll();
    }
}
