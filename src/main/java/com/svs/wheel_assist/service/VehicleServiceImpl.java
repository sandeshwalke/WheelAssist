package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.VehicleDTO;
import com.svs.wheel_assist.dto.response.VehicleResponseDTO;
import com.svs.wheel_assist.entity.User;
import com.svs.wheel_assist.entity.Vehicle;
import com.svs.wheel_assist.repo.UserRepository;
import com.svs.wheel_assist.repository.VehicleRepository;
import com.svs.wheel_assist.service.VehicleService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public VehicleResponseDTO addVehicle(VehicleDTO dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));

        if (vehicleRepository.existsByVehiclePlate(dto.getVehiclePlate())) {
            throw new IllegalArgumentException("Vehicle plate already registered: " + dto.getVehiclePlate());
        }

        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .model(dto.getModel())
                .year(dto.getYear())
                .vehiclePlate(dto.getVehiclePlate())
                .vehicleType(dto.getVehicleType())
                .brand(dto.getBrand())
                .build();

        vehicle = vehicleRepository.save(vehicle);
        return toResponseDTO(vehicle);
    }

    @Override
    public VehicleResponseDTO getVehicleById(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + vehicleId));
        return toResponseDTO(vehicle);
    }

    @Override
    public List<VehicleResponseDTO> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleResponseDTO> getVehiclesByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with id: " + userId);
        }
        return vehicleRepository.findByUserUserId(userId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VehicleResponseDTO updateVehicle(Long vehicleId, VehicleDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + vehicleId));

        // If the plate is being changed, make sure the new one isn't
        // already taken by a different vehicle
        if (!vehicle.getVehiclePlate().equals(dto.getVehiclePlate())
                && vehicleRepository.existsByVehiclePlate(dto.getVehiclePlate())) {
            throw new IllegalArgumentException("Vehicle plate already registered: " + dto.getVehiclePlate());
        }

        vehicle.setModel(dto.getModel());
        vehicle.setYear(dto.getYear());
        vehicle.setVehiclePlate(dto.getVehiclePlate());
        vehicle.setVehicleType(dto.getVehicleType());
        vehicle.setBrand(dto.getBrand());

        vehicle = vehicleRepository.save(vehicle);
        return toResponseDTO(vehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new EntityNotFoundException("Vehicle not found with id: " + vehicleId);
        }
        vehicleRepository.deleteById(vehicleId);
    }

    private VehicleResponseDTO toResponseDTO(Vehicle vehicle) {
        return VehicleResponseDTO.builder()
                .vehicleId(vehicle.getVehicleId())
                .userId(vehicle.getUser().getUserId())
                .ownerName(vehicle.getUser().getName())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .vehiclePlate(vehicle.getVehiclePlate())
                .vehicleType(vehicle.getVehicleType())
                .brand(vehicle.getBrand())
                .build();
    }
}
