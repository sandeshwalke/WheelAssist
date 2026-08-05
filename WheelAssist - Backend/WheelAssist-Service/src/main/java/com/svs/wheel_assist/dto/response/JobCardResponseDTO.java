package com.svs.wheel_assist.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCardResponseDTO {

    private Long jobId;
    private Long workorderId;

    // Flattened context so the frontend doesn't need a second call
    // just to show which vehicle/mechanic this job card belongs to
    private String vehiclePlate;
    private String mechanicName;

    private String workDone;
    private BigDecimal estimatedCost;

    // Parts included inline -- this is the "single sheet" view
    // from the original requirement (job card + parts together)
    private List<PartResponseDTO> parts;
}
