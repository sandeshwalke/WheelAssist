package com.svs.wheel_assist.dto.request;

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
public class WorkorderDTO {

    @NotNull(message = "Vehicle id is required")
    private Long vehicleId;

    @NotBlank(message = "Problem description is required")
    private String problemDescription;
}
