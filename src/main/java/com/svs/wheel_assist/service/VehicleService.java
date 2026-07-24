package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.VehicleDTO;
import com.svs.wheel_assist.dto.response.VehicleResponseDTO;

import java.util.List;

public interface VehicleService {

    VehicleResponseDTO addVehicle(VehicleDTO dto);

    VehicleResponseDTO getVehicleById(Long vehicleId);

    List<VehicleResponseDTO> getAllVehicles();

    List<VehicleResponseDTO> getVehiclesByUser(Long userId);

    VehicleResponseDTO updateVehicle(Long vehicleId, VehicleDTO dto);

    void deleteVehicle(Long vehicleId);
}
