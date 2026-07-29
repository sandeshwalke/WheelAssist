package com.svs.wheel_assist.controller;

import com.svs.wheel_assist.dto.request.InvoiceDTO;
import com.svs.wheel_assist.dto.response.InvoiceResponseDTO;
import com.svs.wheel_assist.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping("/getall")
    public ResponseEntity<List<InvoiceResponseDTO>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }
    @PostMapping("/generate")
    public ResponseEntity<InvoiceResponseDTO> generateInvoice(@Valid @RequestBody InvoiceDTO dto) {
        InvoiceResponseDTO response = invoiceService.generateInvoice(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceResponseDTO> getInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(invoiceId));
    }

    @GetMapping("/jobcard/{jobId}")
    public ResponseEntity<InvoiceResponseDTO> getInvoiceByJobCard(@PathVariable Long jobId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByJobCard(jobId));
    }
}
