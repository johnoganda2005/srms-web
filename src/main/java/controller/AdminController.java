package com.chuka.srms.controller;

import com.chuka.srms.model.Student;
import com.chuka.srms.model.ApprovalStatus;
import com.chuka.srms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private StudentRepository studentRepo;

    // 1. Show the Admin Dashboard with pending students
    @GetMapping("/dashboard")
    public String adminDashboard(Model model) {
        // Fetch only students with PENDING status
        List<Student> pendingStudents = studentRepo.findByStatus(ApprovalStatus.PENDING);
        
        // Fetch approved students just to show them below the pending ones (optional)
        List<Student> approvedStudents = studentRepo.findByStatus(ApprovalStatus.APPROVED);

        model.addAttribute("pendingStudents", pendingStudents);
        model.addAttribute("approvedStudents", approvedStudents);
        
        return "admin-dashboard"; // This will look for admin-dashboard.html
    }

    // 2. Approve a student
    @PostMapping("/approve/{id}")
    public String approveStudent(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        Student student = studentRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Invalid student Id:" + id));
        
        // Generate the Reg Number: e.g. CHK/2026/0001
        long totalStudents = studentRepo.count() + 1;
        String year = String.valueOf(LocalDate.now().getYear());
        String generatedRegNo = String.format("CHK/%s/%04d", year, totalStudents);

        student.setStudentId(generatedRegNo); // Set the official Reg No
        student.setStatus(ApprovalStatus.APPROVED); // Change status
        student.setAcademicStatus("Active"); // Set default academic status
        
        studentRepo.save(student);
        
        redirectAttributes.addFlashAttribute("success", "Student approved successfully! Reg No: " + generatedRegNo);
        return "redirect:/admin/dashboard";
    }

    // 3. Reject a student
    @PostMapping("/reject/{id}")
    public String rejectStudent(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        Student student = studentRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Invalid student Id:" + id));
        
        student.setStatus(ApprovalStatus.REJECTED);
        studentRepo.save(student);
        
        redirectAttributes.addFlashAttribute("error", "Student registration rejected.");
        return "redirect:/admin/dashboard";
    }
}
