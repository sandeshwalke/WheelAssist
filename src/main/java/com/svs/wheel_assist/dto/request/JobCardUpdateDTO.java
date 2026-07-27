package com.svs.wheel_assist.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCardUpdateDTO {

    @NotNull(message = "Work done description is required")
    private String workDone;

    private BigDecimal estimatedCost;
}
