package com.svs.wheel_assist.dto.request;

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
public class JobCardDTO {

    // No mechanicId here -- resolved from the JWT in the service,
    // same pattern as WorkOrder assignment
    @NotNull(message = "Workorder id is required")
    private Long workorderId;
}
