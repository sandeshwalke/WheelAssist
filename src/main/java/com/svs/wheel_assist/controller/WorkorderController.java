package com.svs.wheel_assist.controller;

import com.svs.wheel_assist.dto.request.WorkorderDTO;
import com.svs.wheel_assist.dto.request.WorkorderStatusDTO;
import com.svs.wheel_assist.dto.response.WorkorderResponseDTO;
import com.svs.wheel_assist.service.WorkorderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workorders")
@RequiredArgsConstructor
public class WorkorderController {

    private final WorkorderService workorderService;

    @PostMapping("/add")
    public ResponseEntity<WorkorderResponseDTO> createWorkorder(@Valid @RequestBody WorkorderDTO dto) {
        WorkorderResponseDTO response = workorderService.createWorkorder(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{workorderId}")
    public ResponseEntity<WorkorderResponseDTO> getWorkorder(@PathVariable Long workorderId) {
        return ResponseEntity.ok(workorderService.getWorkorderById(workorderId));
    }

    @GetMapping("/getall")
    public ResponseEntity<List<WorkorderResponseDTO>> getAllWorkorders() {
        return ResponseEntity.ok(workorderService.getAllWorkorders());
    }

    @GetMapping("/unassigned")
    public ResponseEntity<List<WorkorderResponseDTO>> getUnassignedWorkorders() {
        return ResponseEntity.ok(workorderService.getUnassignedWorkorders());
    }
    @PutMapping("/{workorderId}/status")
    public ResponseEntity<WorkorderResponseDTO> updateStatus(
            @PathVariable Long workorderId, @Valid @RequestBody WorkorderStatusDTO dto) {
        return ResponseEntity.ok(workorderService.updateStatus(workorderId, dto));

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkorderResponseDTO>> getWorkordersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(workorderService.getWorkordersByUser(userId));
    }
    
    

    @GetMapping("/mechanic/{mechanicId}")
    public ResponseEntity<List<WorkorderResponseDTO>> getWorkordersByMechanic(@PathVariable Long mechanicId) {
        return ResponseEntity.ok(workorderService.getWorkordersByMechanic(mechanicId));
    }

    @PutMapping("/{workorderId}/assign")
    public ResponseEntity<WorkorderResponseDTO> assignToSelf(@PathVariable Long workorderId) {
        return ResponseEntity.ok(workorderService.assignToSelf(workorderId));
    }

    }
}
