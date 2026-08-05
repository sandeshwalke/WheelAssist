package com.svs.payment_service.dto;

import lombok.*;

// Returned after creating a Razorpay order -- the frontend uses
// these fields to open the Razorpay checkout popup
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOrderResponseDTO {

    private String razorpayOrderId;
    private String razorpayKeyId; // public key, safe to send to frontend
    private Long amountInPaise;
    private String currency;
    private Long invoiceId;
}
