package com.svs.wheel_assist.controller;

import com.svs.wheel_assist.dto.request.VehicleDTO;
import com.svs.wheel_assist.dto.response.VehicleResponseDTO;
import com.svs.wheel_assist.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping("/add")
    public ResponseEntity<VehicleResponseDTO> addVehicle(@Valid @RequestBody VehicleDTO dto) {
        VehicleResponseDTO response = vehicleService.addVehicle(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponseDTO> getVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(vehicleService.getVehicleById(vehicleId));
    }

    @GetMapping("/getall")
    public ResponseEntity<List<VehicleResponseDTO>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<VehicleResponseDTO>> getVehiclesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByUser(userId));
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(
            @PathVariable Long vehicleId, @Valid @RequestBody VehicleDTO dto) {
        return ResponseEntity.ok(vehicleService.updateVehicle(vehicleId, dto));
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long vehicleId) {
        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.noContent().build();
    }
}
