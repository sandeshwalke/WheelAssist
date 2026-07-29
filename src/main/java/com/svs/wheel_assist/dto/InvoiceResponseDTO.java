package com.svs.wheel_assist.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponseDTO {

    private Long invoiceId;
    private Long jobId;
    private Long workorderId;

    // Flattened context for a self-contained PDF/receipt --
    // frontend shouldn't need extra calls just to render this
    private String ownerName;
    private String vehiclePlate;
    private String mechanicName;
    private String workDone;
    private List<PartResponseDTO> parts;

    private BigDecimal partsCost;
    private BigDecimal labourCost;
    private BigDecimal gst;
    private BigDecimal totalCost;

    private Boolean paid;
    private LocalDateTime invoiceDate;
}
