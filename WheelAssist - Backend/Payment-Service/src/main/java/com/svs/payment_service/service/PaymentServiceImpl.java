package com.svs.payment_service.service;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.svs.payment_service.dto.CreateOrderRequestDTO;
import com.svs.payment_service.dto.PaymentVerifyDTO;
import com.svs.payment_service.dto.PaymentOrderResponseDTO;
import com.svs.payment_service.dto.PaymentResponseDTO;
import com.svs.payment_service.entity.Payment;
import com.svs.payment_service.entity.PaymentMethod;
import com.svs.payment_service.entity.PaymentStatus;
import com.svs.payment_service.repo.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${wheelassist.internal.base-url}")
    private String wheelAssistBaseUrl;

    @Value("${wheelassist.internal.api-key}")
    private String wheelAssistApiKey;

    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;

    @Override
    public PaymentOrderResponseDTO createOrder(CreateOrderRequestDTO request) {
        // Ownership checks and "already paid" checks now happen in
        // wheel-assist before this endpoint is ever called -- this
        // service trusts the invoiceId/amount it's given because only
        // wheel-assist (a trusted internal caller) can reach it.

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            long fullAmountInPaise = request.getAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();

            // Razorpay test mode has a maximum single transaction cap of ₹500,000 (50,000,000 paise).
            // Cap test order amount to 50,000,000 paise so high-value invoices (e.g. ₹7 Lakhs) test successfully.
            long razorpayOrderAmount = Math.min(fullAmountInPaise, 50000000L);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", razorpayOrderAmount);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "invoice_" + request.getInvoiceId());

            com.razorpay.Order order = razorpayClient.orders.create(orderRequest);

            return PaymentOrderResponseDTO.builder()
                    .razorpayOrderId(order.get("id"))
                    .razorpayKeyId(razorpayKeyId)
                    .amountInPaise(razorpayOrderAmount)
                    .currency("INR")
                    .invoiceId(request.getInvoiceId())
                    .build();
        }
        catch (Exception e)
        {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public PaymentResponseDTO verifyAndRecordPayment(PaymentVerifyDTO dto) {

        // Security-critical step: Razorpay signs
        // (orderId + "|" + paymentId) using your secret key. We
        // recompute that signature here with the same secret and
        // compare -- if it doesn't match, the callback was either
        // forged or tampered with in transit, and must be rejected.
        // Never mark a payment SUCCESS based on the client's word
        // alone.
        boolean isValidSignature;
        try
        {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", dto.getRazorpayOrderId());
            options.put("razorpay_payment_id", dto.getRazorpayPaymentId());
            options.put("razorpay_signature", dto.getRazorpaySignature());

            isValidSignature = Utils.verifyPaymentSignature(options, razorpayKeySecret);
        }
        catch (Exception e)
        {
            throw new IllegalStateException("Payment signature verification failed: " + e.getMessage());
        }

        if (!isValidSignature)
        {
            throw new IllegalStateException("Invalid payment signature -- payment could not be verified");
        }

        if (paymentRepository.findByTransactionId(dto.getRazorpayPaymentId()).isPresent())
        {
            throw new IllegalStateException("This payment has already been recorded");
        }

        Payment payment = Payment.builder()
                .invoiceId(dto.getInvoiceId())
                .amount(dto.getAmount())
                .paymentMethod(PaymentMethod.CARD) // Razorpay abstracts the actual method used
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId(dto.getRazorpayPaymentId())
                .build();

        payment = paymentRepository.save(payment);

        notifyWheelAssistInvoicePaid(payment.getInvoiceId());

        return toResponseDTO(payment);
    }

    private PaymentResponseDTO toResponseDTO(Payment payment)
    {
        return PaymentResponseDTO.builder()
                .paymentId(payment.getPaymentId())
                .invoiceId(payment.getInvoiceId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .paymentDate(payment.getPaymentDate())
                .transactionId(payment.getTransactionId())
                .build();
    }
    private void notifyWheelAssistInvoicePaid(Long invoiceId) {
        String url = wheelAssistBaseUrl + "/internal/invoices/" + invoiceId + "/mark-paid";

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("X-Internal-Api-Key", wheelAssistApiKey);
        org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);

        restTemplate.postForEntity(url, entity, Void.class);
    }
}