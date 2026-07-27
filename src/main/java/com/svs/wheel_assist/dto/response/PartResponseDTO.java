package com.svs.wheel_assist.dto.response;

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
public class PartResponseDTO {

    private Long partId;
    private Long jobId;
    private String partName;
    private Integer quantity;
    private BigDecimal unitPrice;

    // Convenience field, computed as quantity * unitPrice -- saves
    // the frontend from redoing this math for every row
    private BigDecimal lineTotal;
}
