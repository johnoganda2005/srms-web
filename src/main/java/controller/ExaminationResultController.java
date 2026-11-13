package com.chuka.srms.controller;

import com.chuka.srms.model.ExaminationResult;
import com.chuka.srms.repository.ExaminationResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class ExaminationResultController {

    @Autowired
    private ExaminationResultRepository repository;

    @GetMapping
    public List<ExaminationResult> getAllResults() {
        return repository.findAll();
    }

    @PostMapping
    public ExaminationResult addResult(@RequestBody ExaminationResult result) {
        return repository.save(result);
    }

    @PutMapping("/{id}")
    public ExaminationResult updateResult(@PathVariable String id, @RequestBody ExaminationResult result) {
        result.setResultId(id);
        return repository.save(result);
    }

    @DeleteMapping("/{id}")
    public void deleteResult(@PathVariable String id) {
        repository.deleteById(id);
    }
}