package com.svs.wheel_assist.controller;

import com.svs.wheel_assist.repo.InvoiceRepository;
import com.svs.wheel_assist.entity.Invoice;
import com.svs.wheel_assist.service.EmailService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Internal-only controller. Not called by the frontend, not called
// by any logged-in user -- only payment-service calls this, after
// it has verified a Razorpay signature and recorded a successful
// payment. Protected by InternalApiKeyFilter, not JWT (there's no
// user token in this call at all).
@RestController
@RequestMapping("/internal/invoices")
@RequiredArgsConstructor
public class InternalInvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final EmailService emailService;

    @PostMapping("/{invoiceId}/mark-paid")
    public ResponseEntity<Void> markPaid(@PathVariable Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + invoiceId));

        invoice.setPaid(true);
        invoiceRepository.save(invoice);

        emailService.sendInvoicePaidEmail(invoiceId);

        return ResponseEntity.ok().build();
    }
}
