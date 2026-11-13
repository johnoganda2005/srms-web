package com.chuka.srms.controller;

import com.chuka.srms.model.CourseAllocation;
import com.chuka.srms.repository.CourseAllocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocations")
@CrossOrigin(origins = "*")
public class CourseAllocationController {

    @Autowired
    private CourseAllocationRepository repository;

    @GetMapping
    public List<CourseAllocation> getAllAllocations() {
        return repository.findAll();
    }

    @PostMapping
    public CourseAllocation addAllocation(@RequestBody CourseAllocation allocation) {
        return repository.save(allocation);
    }

    @PutMapping("/{id}")
    public CourseAllocation updateAllocation(@PathVariable String id, @RequestBody CourseAllocation allocation) {
        allocation.setAllocationId(id);
        return repository.save(allocation);
    }

    @DeleteMapping("/{id}")
    public void deleteAllocation(@PathVariable String id) {
        repository.deleteById(id);
    }
}