package com.svs.wheel_assist.controller;

import com.svs.wheel_assist.dto.request.JobCardDTO;
import com.svs.wheel_assist.dto.request.JobCardUpdateDTO;
import com.svs.wheel_assist.dto.response.JobCardResponseDTO;
import com.svs.wheel_assist.service.JobCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobcards")
@RequiredArgsConstructor
public class JobCardController {

    private final JobCardService jobCardService;

    @PostMapping("/add")
    public ResponseEntity<JobCardResponseDTO> createJobCard(@Valid @RequestBody JobCardDTO dto) {
        JobCardResponseDTO response = jobCardService.createJobCard(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobCardResponseDTO> getJobCard(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobCardService.getJobCardById(jobId));
    }

    @GetMapping("/workorder/{workorderId}")
    public ResponseEntity<JobCardResponseDTO> getJobCardByWorkorder(@PathVariable Long workorderId) {
        return ResponseEntity.ok(jobCardService.getJobCardByWorkorder(workorderId));
    }

    @GetMapping("/getall")
    public ResponseEntity<List<JobCardResponseDTO>> getAllJobCards() {
        return ResponseEntity.ok(jobCardService.getAllJobCards());
    }

    @PutMapping("/{jobId}")
    public ResponseEntity<JobCardResponseDTO> updateJobCard(
            @PathVariable Long jobId, @Valid @RequestBody JobCardUpdateDTO dto) {
        return ResponseEntity.ok(jobCardService.updateJobCard(jobId, dto));
    }
}
