package com.svs.wheel_assist.repo;

import com.svs.wheel_assist.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByUserUserId(Long userId);

    boolean existsByVehiclePlate(String vehiclePlate);

    Optional<Vehicle> findByVehiclePlate(String vehiclePlate);
}
