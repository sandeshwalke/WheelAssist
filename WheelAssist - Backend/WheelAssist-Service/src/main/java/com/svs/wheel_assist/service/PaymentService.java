package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.PaymentVerifyDTO;
import com.svs.wheel_assist.dto.response.PaymentOrderResponseDTO;
import com.svs.wheel_assist.dto.response.PaymentResponseDTO;

public interface PaymentService {

    // Step 1: create a Razorpay order for this invoice's total amount
    PaymentOrderResponseDTO createOrder(Long invoiceId);

    // Step 2: verify the signature Razorpay's checkout returned,
    // then record the payment and mark the invoice paid
    PaymentResponseDTO verifyAndRecordPayment(PaymentVerifyDTO dto);
}
