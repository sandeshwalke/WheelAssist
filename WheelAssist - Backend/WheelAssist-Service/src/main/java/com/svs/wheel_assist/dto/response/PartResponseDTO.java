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

    private BigDecimal lineTotal;  // Convenience field, computed as quantity * unitPrice -- saves  and the frontend from redoing this math for every row

    
    private Long partId;
    private Long jobId;
    private String partName;
    private Integer quantity;
    private BigDecimal unitPrice;
}
