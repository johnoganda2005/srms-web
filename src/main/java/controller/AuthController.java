package com.chuka.srms.controller;

import com.chuka.srms.model.AdminUser;
import com.chuka.srms.model.Student; // Added for registration
import com.chuka.srms.repository.AdminUserRepository;
import com.chuka.srms.repository.StudentRepository; // Added for registration
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@Controller
public class AuthController {

    @Autowired
    private AdminUserRepository adminRepo;

    @Autowired
    private StudentRepository studentRepo; // Injecting StudentRepo

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    // ==========================================
    // LOGIN & REGISTRATION ROUTES
    // ==========================================

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    // 1. Show the Student Registration Page
    @GetMapping("/register")
    public String showRegisterForm() {
        return "register";
    }

    // 2. Process Student Registration
    @PostMapping("/register")
    public String processRegistration(
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String course,
            Model model) {
        
        try {
            // Check if email already exists in Student DB
            if (studentRepo.findAll().stream().anyMatch(s -> s.getEmail().equalsIgnoreCase(email))) {
                model.addAttribute("error", "Email is already registered!");
                return "register";
            }

            // Create new Student
            Student newStudent = new Student();
            newStudent.setFullName(fullName);
            newStudent.setEmail(email);
            // We should hash the password so it matches security requirements
            newStudent.setPassword(passwordEncoder.encode(password)); 
            newStudent.setCourse(course);
            
            // Assuming you added the ApprovalStatus enum to your Student model:
            // newStudent.setStatus(ApprovalStatus.PENDING); 

            studentRepo.save(newStudent);
            
            model.addAttribute("success", "Registration successful! Please wait for admin approval before logging in.");
            return "login"; // Redirect to login page with success message
            
        } catch (Exception e) {
            model.addAttribute("error", "Registration failed: " + e.getMessage());
            return "register";
        }
    }

    // ==========================================
    // FORGOT PASSWORD ROUTES (Your existing code)
    // ==========================================

    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "forgot-password";
    }

    @PostMapping("/forgot-password")
    public String processForgotPassword(@RequestParam String email, Model model) {
        Optional<AdminUser> adminOpt = adminRepo.findAll().stream()
                .filter(a -> a.getEmail() != null && a.getEmail().equalsIgnoreCase(email))
                .findFirst();

        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            String token = UUID.randomUUID().toString();
            admin.setResetToken(token);
            adminRepo.save(admin);

            String resetLink = "http://localhost:8080/reset-password?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(admin.getEmail());
            message.setSubject("Chuka SRMS - Password Reset Link");
            message.setText("Hello " + admin.getUsername() + ",\n\n" +
                    "You requested a password reset. Click the link below to set a new password:\n\n" +
                    resetLink + "\n\n" +
                    "If you did not request this, please ignore this email. The link will expire once used.");
            mailSender.send(message);
        }

        model.addAttribute("success", "If an account exists with that email, a reset link has been sent.");
        return "forgot-password";
    }

    @GetMapping("/reset-password")
    public String showResetForm(@RequestParam String token, Model model) {
        Optional<AdminUser> adminOpt = adminRepo.findByResetToken(token);
        if (adminOpt.isPresent()) {
            model.addAttribute("token", token);
            return "reset-password";
        } else {
            model.addAttribute("error", "Invalid or expired reset link.");
            return "forgot-password";
        }
    }

    @PostMapping("/reset-password")
    public String processResetPassword(@RequestParam String token, @RequestParam String newPassword, Model model) {
        Optional<AdminUser> adminOpt = adminRepo.findByResetToken(token);
        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode(newPassword));
            admin.setResetToken(null); // Clear token after use
            adminRepo.save(admin);
            model.addAttribute("success", "Password updated successfully! You can now log in.");
            return "login";
        } else {
            model.addAttribute("error", "Invalid or expired reset link.");
            return "forgot-password";
        }
    }
}
