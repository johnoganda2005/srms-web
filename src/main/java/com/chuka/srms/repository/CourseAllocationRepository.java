package com.chuka.srms.repository;

import com.chuka.srms.model.CourseAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseAllocationRepository extends JpaRepository<CourseAllocation, String> {
}