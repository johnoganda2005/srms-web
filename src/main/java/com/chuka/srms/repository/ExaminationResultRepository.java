package com.chuka.srms.repository;

import com.chuka.srms.model.ExaminationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExaminationResultRepository extends JpaRepository<ExaminationResult, String> {
}