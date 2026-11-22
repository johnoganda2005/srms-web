package com.chuka.srms.repository;

import com.chuka.srms.model.Student;
import com.chuka.srms.model.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Used for login and checking if an email is already registered
    Optional<Student> findByEmail(String email);

    // Used for the Admin Dashboard to show only pending students
    List<Student> findByStatus(ApprovalStatus status);
    
}
