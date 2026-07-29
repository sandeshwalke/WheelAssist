package com.svs.wheel_assist.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// The three razorpay* fields are exactly what Razorpay's
// checkout.js hands back to the frontend after a successful
// payment. invoiceId is added by us so the backend knows which
// invoice this payment belongs to, without needing to parse it
// back out of Razorpay's opaque order id.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerifyDTO {

    @NotNull(message = "Invoice id is required")
    private Long invoiceId;

    @NotBlank(message = "Razorpay order id is required")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay payment id is required")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay signature is required")
    private String razorpaySignature;
}
