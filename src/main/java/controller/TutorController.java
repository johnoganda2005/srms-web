package com.chuka.srms.controller;

import com.chuka.srms.model.Tutor;
import com.chuka.srms.repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tutors")
@CrossOrigin(origins = "*")
public class TutorController {

    @Autowired
    private TutorRepository repository;

    @GetMapping
    public List<Tutor> getAllTutors() {
        return repository.findAll();
    }

    @PostMapping
    public Tutor addTutor(@RequestBody Tutor tutor) {
        return repository.save(tutor);
    }

    @PutMapping("/{id}")
    public Tutor updateTutor(@PathVariable String id, @RequestBody Tutor tutor) {
        tutor.setTutorId(id);
        return repository.save(tutor);
    }

    @DeleteMapping("/{id}")
    public void deleteTutor(@PathVariable String id) {
        repository.deleteById(id);
    }
}