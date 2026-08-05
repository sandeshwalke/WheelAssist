package com.svs.wheel_assist.controller;

import com.svs.wheel_assist.dto.request.PaymentVerifyDTO;
import com.svs.wheel_assist.dto.response.PaymentOrderResponseDTO;
import com.svs.wheel_assist.dto.response.PaymentResponseDTO;
import com.svs.wheel_assist.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Step 1: frontend calls this to get a Razorpay order before
    // opening the checkout popup
    @PostMapping("/create-order/{invoiceId}")
    public ResponseEntity<PaymentOrderResponseDTO> createOrder(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.createOrder(invoiceId));
    }

    // Step 2: frontend calls this after Razorpay's popup returns a
    // successful payment, with the three fields it received
    @PostMapping("/verify")
    public ResponseEntity<PaymentResponseDTO> verifyPayment(@Valid @RequestBody PaymentVerifyDTO dto) {
        return ResponseEntity.ok(paymentService.verifyAndRecordPayment(dto));
    }
}
