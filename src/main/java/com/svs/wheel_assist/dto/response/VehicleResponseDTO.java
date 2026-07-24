package com.svs.wheel_assist.dto.response;

import com.svs.wheel_assist.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponseDTO
{
    private Long vehicleId;
    private Long userId;
    private String ownerName;
    private String model;
    private Integer year;
    private String vehiclePlate;
    private VehicleType vehicleType;
    private String brand;
}
