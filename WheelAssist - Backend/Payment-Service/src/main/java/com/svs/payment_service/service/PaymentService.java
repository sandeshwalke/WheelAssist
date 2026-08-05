package com.svs.payment_service.service;

import com.svs.payment_service.dto.CreateOrderRequestDTO;
import com.svs.payment_service.dto.PaymentOrderResponseDTO;
import com.svs.payment_service.dto.PaymentResponseDTO;
import com.svs.payment_service.dto.PaymentVerifyDTO;

public interface PaymentService {
    PaymentOrderResponseDTO createOrder(CreateOrderRequestDTO request);
    PaymentResponseDTO verifyAndRecordPayment(PaymentVerifyDTO dto);
}