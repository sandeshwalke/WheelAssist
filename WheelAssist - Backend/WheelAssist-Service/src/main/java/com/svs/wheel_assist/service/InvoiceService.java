package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.InvoiceDTO;
import com.svs.wheel_assist.dto.response.InvoiceResponseDTO;

import java.util.List;

public interface InvoiceService {

    // Only the job card's assigned mechanic can generate the invoice,
    // and only once the workorder is COMPLETED
    InvoiceResponseDTO generateInvoice(InvoiceDTO dto);

    // Owner (customer) or assigned mechanic can view
    InvoiceResponseDTO getInvoiceById(Long invoiceId);

    InvoiceResponseDTO getInvoiceByJobCard(Long jobId);

    List<InvoiceResponseDTO> getAllInvoices();
}
