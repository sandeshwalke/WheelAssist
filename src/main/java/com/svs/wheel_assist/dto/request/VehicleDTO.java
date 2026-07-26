package com.svs.wheel_assist.dto.request;

import com.svs.wheel_assist.enums.VehicleType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class VehicleDTO {


    @NotNull(message = "User id is required")
    private Long userId;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    @Min(value = 1980, message = "Year must be 1980 or later")
    @Max(value = 2026, message = "Year cannot be in the future")
    private Integer year;

    @NotBlank(message = "Vehicle plate is required")
    private String vehiclePlate;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    @NotBlank(message = "Brand is required")
    private String brand;
}
