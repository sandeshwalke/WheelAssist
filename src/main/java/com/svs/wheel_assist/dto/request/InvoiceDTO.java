package com.svs.wheel_assist.dto.request;

import jakarta.validation.constraints.DecimalMin;
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
public class InvoiceDTO {

    @NotNull(message = "Job id is required")
    private Long jobId;

    // Labour cost is the one figure not derivable from Parts --
    // mechanic enters it manually when generating the invoice.
    // Parts cost and GST are computed server-side, not trusted
    // from the client.
    @NotNull(message = "Labour cost is required")
    @DecimalMin(value = "0.0", message = "Labour cost cannot be negative")
    private BigDecimal labourCost;
}
