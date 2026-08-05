package com.svs.wheel_assist.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
