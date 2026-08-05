package com.svs.wheel_assist.service.impli;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.svs.wheel_assist.dto.request.PaymentVerifyDTO;
import com.svs.wheel_assist.dto.response.PaymentOrderResponseDTO;
import com.svs.wheel_assist.dto.response.PaymentResponseDTO;
import com.svs.wheel_assist.entity.Invoice;
import com.svs.wheel_assist.entity.Payment;
import com.svs.wheel_assist.entity.User;
import com.svs.wheel_assist.entity.WorkOrder;
import com.svs.wheel_assist.enums.PaymentMethod;
import com.svs.wheel_assist.enums.PaymentStatus;
import com.svs.wheel_assist.repo.InvoiceRepository;
import com.svs.wheel_assist.repo.PaymentRepository;
import com.svs.wheel_assist.repo.UserRepository;
import com.svs.wheel_assist.service.PaymentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @Override
    public PaymentOrderResponseDTO createOrder(Long invoiceId) {
        User caller = getAuthenticatedUser();

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + invoiceId));

        WorkOrder workOrder = invoice.getJobCard().getWorkorder();

        if (!workOrder.getVehicle().getUser().getUserId().equals(caller.getUserId())) {
            throw new AccessDeniedException("You can only pay your own invoices");
        }

        if (Boolean.TRUE.equals(invoice.getPaid())) {
            throw new IllegalStateException("This invoice has already been paid");
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            long amountInPaise = invoice.getTotalCost()
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "invoice_" + invoiceId);

            com.razorpay.Order order = razorpayClient.orders.create(orderRequest);

            return PaymentOrderResponseDTO.builder()
                    .razorpayOrderId(order.get("id"))
                    .razorpayKeyId(razorpayKeyId)
                    .amountInPaise(amountInPaise)
                    .currency("INR")
                    .invoiceId(invoiceId)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public PaymentResponseDTO verifyAndRecordPayment(PaymentVerifyDTO dto) {
        User caller = getAuthenticatedUser();

        Invoice invoice = invoiceRepository.findById(dto.getInvoiceId())
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + dto.getInvoiceId()));

        WorkOrder workOrder = invoice.getJobCard().getWorkorder();
        if (!workOrder.getVehicle().getUser().getUserId().equals(caller.getUserId())) {
            throw new AccessDeniedException("You can only pay your own invoices");
        }

        // Security-critical step: Razorpay signs
        // (orderId + "|" + paymentId) using your secret key. We
        // recompute that signature here with the same secret and
        // compare -- if it doesn't match, the callback was either
        // forged or tampered with in transit, and must be rejected.
        // Never mark a payment SUCCESS based on the client's word
        // alone.
        boolean isValidSignature;
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", dto.getRazorpayOrderId());
            options.put("razorpay_payment_id", dto.getRazorpayPaymentId());
            options.put("razorpay_signature", dto.getRazorpaySignature());

            isValidSignature = Utils.verifyPaymentSignature(options, razorpayKeySecret);
        } catch (Exception e) {
            throw new IllegalStateException("Payment signature verification failed: " + e.getMessage());
        }

        if (!isValidSignature) {
            throw new IllegalStateException("Invalid payment signature -- payment could not be verified");
        }

        if (paymentRepository.findByTransactionId(dto.getRazorpayPaymentId()).isPresent()) {
            throw new IllegalStateException("This payment has already been recorded");
        }

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(invoice.getTotalCost())
                .paymentMethod(PaymentMethod.CARD) // Razorpay abstracts the actual method used
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId(dto.getRazorpayPaymentId())
                .build();

        payment = paymentRepository.save(payment);

        invoice.setPaid(true);
        invoiceRepository.save(invoice);

        return toResponseDTO(payment);
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
    }

    private PaymentResponseDTO toResponseDTO(Payment payment) {
        return PaymentResponseDTO.builder()
                .paymentId(payment.getPaymentId())
                .invoiceId(payment.getInvoice().getInvoiceId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .paymentDate(payment.getPaymentDate())
                .transactionId(payment.getTransactionId())
                .build();
    }
}
