package com.svs.wheel_assist.controller;

import com.svs.wheel_assist.dto.request.PartDTO;
import com.svs.wheel_assist.dto.response.PartResponseDTO;
import com.svs.wheel_assist.service.PartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartService partService;

    // Adds one part at a time -- matches "parts table starts empty,
    // mechanic adds parts one by one" from the original requirement
    @PostMapping("/jobcard/{jobId}/add")
    public ResponseEntity<PartResponseDTO> addPart(
            @PathVariable Long jobId, @Valid @RequestBody PartDTO dto) {
        PartResponseDTO response = partService.addPart(jobId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/jobcard/{jobId}")
    public ResponseEntity<List<PartResponseDTO>> getPartsByJobCard(@PathVariable Long jobId) {
        return ResponseEntity.ok(partService.getPartsByJobCard(jobId));
    }

    @DeleteMapping("/{partId}")
    public ResponseEntity<Void> deletePart(@PathVariable Long partId) {
        partService.deletePart(partId);
        return ResponseEntity.noContent().build();
    }
}
