package com.svs.payment_service.controller;

import com.svs.payment_service.dto.CreateOrderRequestDTO;
import com.svs.payment_service.dto.PaymentVerifyDTO;
import com.svs.payment_service.dto.PaymentOrderResponseDTO;
import com.svs.payment_service.dto.PaymentResponseDTO;
import com.svs.payment_service.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Step 1: wheel-assist calls this (already having validated
    // ownership + unpaid status) to get a Razorpay order before
    // the frontend opens the checkout popup
    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponseDTO> createOrder(@Valid @RequestBody CreateOrderRequestDTO request) {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }

    // Step 2: frontend calls this after Razorpay's popup returns a
    // successful payment, with the three razorpay fields plus the
    // invoiceId/amount it already has from step 1
    @PostMapping("/verify")
    public ResponseEntity<PaymentResponseDTO> verifyPayment(@Valid @RequestBody PaymentVerifyDTO dto) {
        return ResponseEntity.ok(paymentService.verifyAndRecordPayment(dto));
    }
}