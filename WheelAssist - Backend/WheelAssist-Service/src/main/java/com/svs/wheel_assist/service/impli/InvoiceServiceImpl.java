package com.svs.wheel_assist.service.impl;

import com.svs.wheel_assist.dto.request.InvoiceDTO;
import com.svs.wheel_assist.dto.response.InvoiceResponseDTO;
import com.svs.wheel_assist.dto.response.PartResponseDTO;
import com.svs.wheel_assist.entity.Invoice;
import com.svs.wheel_assist.entity.JobCard;
import com.svs.wheel_assist.entity.Part;
import com.svs.wheel_assist.entity.User;
import com.svs.wheel_assist.entity.WorkOrder;
import com.svs.wheel_assist.enums.WorkorderStatus;
import com.svs.wheel_assist.repo.InvoiceRepository;
import com.svs.wheel_assist.repo.JobCardRepository;
import com.svs.wheel_assist.repo.PartRepository;
import com.svs.wheel_assist.repo.UserRepository;
import com.svs.wheel_assist.service.InvoiceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    // 18% GST -- standard rate for auto repair services in India.
    // Hardcoded here rather than client-supplied so a customer
    // can't manipulate the tax figure.
    private static final BigDecimal GST_RATE = new BigDecimal("0.18");

    private final InvoiceRepository invoiceRepository;
    private final JobCardRepository jobCardRepository;
    private final PartRepository partRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public InvoiceResponseDTO generateInvoice(InvoiceDTO dto) {
        User caller = getAuthenticatedUser();

        JobCard jobCard = jobCardRepository.findById(dto.getJobId())
                .orElseThrow(() -> new EntityNotFoundException("Job card not found with id: " + dto.getJobId()));

        WorkOrder workOrder = jobCard.getWorkorder();

        if (workOrder.getMechanic() == null
                || !workOrder.getMechanic().getUser().getUserId().equals(caller.getUserId())) {
            throw new AccessDeniedException("Only the assigned mechanic can generate this invoice");
        }

        if (workOrder.getStatus() != WorkorderStatus.COMPLETED
                && workOrder.getStatus() != WorkorderStatus.DELIVERED) {
            throw new IllegalStateException(
                    "Invoice can only be generated once the workorder is COMPLETED, current status: "
                            + workOrder.getStatus());
        }

        if (invoiceRepository.existsByJobCardJobId(dto.getJobId())) {
            throw new IllegalStateException("An invoice already exists for this job card");
        }

        // Parts cost computed server-side from the actual Part rows --
        // never trusted from the client, so it can't be tampered with
        List<Part> parts = partRepository.findByJobCardJobId(jobCard.getJobId());
        BigDecimal partsCost = parts.stream()
                .map(p -> p.getUnitPrice().multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal labourCost = dto.getLabourCost();
        BigDecimal subtotal = partsCost.add(labourCost);
        BigDecimal gst = subtotal.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalCost = subtotal.add(gst).setScale(2, RoundingMode.HALF_UP);

        Invoice invoice = Invoice.builder()
                .jobCard(jobCard)
                .partsCost(partsCost.setScale(2, RoundingMode.HALF_UP))
                .labourCost(labourCost.setScale(2, RoundingMode.HALF_UP))
                .gst(gst)
                .totalCost(totalCost)
                .paid(false)
                .build();

        invoice = invoiceRepository.save(invoice);
        return toResponseDTO(invoice, parts);
    }

    @Override
    public InvoiceResponseDTO getInvoiceById(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + invoiceId));

        checkViewPermission(invoice);

        List<Part> parts = partRepository.findByJobCardJobId(invoice.getJobCard().getJobId());
        return toResponseDTO(invoice, parts);
    }

    @Override
    public List<InvoiceResponseDTO> getAllInvoices() {
        return invoiceRepository.findAll()
                .stream()
                .map(invoice -> {
                    List<Part> parts = partRepository.findByJobCardJobId(invoice.getJobCard().getJobId());
                    return toResponseDTO(invoice, parts);
                })
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceResponseDTO getInvoiceByJobCard(Long jobId) {
        Invoice invoice = invoiceRepository.findByJobCardJobId(jobId)
                .orElseThrow(() -> new EntityNotFoundException("No invoice found for job card id: " + jobId));

        checkViewPermission(invoice);

        List<Part> parts = partRepository.findByJobCardJobId(jobId);
        return toResponseDTO(invoice, parts);
    }

    // Only the owning customer or the assigned mechanic may view an
    // invoice -- same ownership boundary as everything else
    private void checkViewPermission(Invoice invoice) {
        User caller = getAuthenticatedUser();
        WorkOrder workOrder = invoice.getJobCard().getWorkorder();

        boolean isOwner = workOrder.getVehicle().getUser().getUserId().equals(caller.getUserId());
        boolean isAssignedMechanic = workOrder.getMechanic() != null
                && workOrder.getMechanic().getUser().getUserId().equals(caller.getUserId());

        if (!isOwner && !isAssignedMechanic) {
            throw new AccessDeniedException("You do not have access to this invoice");
        }
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
    }

    private InvoiceResponseDTO toResponseDTO(Invoice invoice, List<Part> parts) {
        JobCard jobCard = invoice.getJobCard();
        WorkOrder workOrder = jobCard.getWorkorder();

        List<PartResponseDTO> partDTOs = parts.stream()
                .map(p -> PartResponseDTO.builder()
                        .partId(p.getPartId())
                        .jobId(jobCard.getJobId())
                        .partName(p.getPartName())
                        .quantity(p.getQuantity())
                        .unitPrice(p.getUnitPrice())
                        .lineTotal(p.getUnitPrice().multiply(BigDecimal.valueOf(p.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return InvoiceResponseDTO.builder()
                .invoiceId(invoice.getInvoiceId())
                .jobId(jobCard.getJobId())
                .workorderId(workOrder.getWorkorderId())
                .ownerName(workOrder.getVehicle().getUser().getName())
                .vehiclePlate(workOrder.getVehicle().getVehiclePlate())
                .mechanicName(workOrder.getMechanic() != null
                        ? workOrder.getMechanic().getUser().getName() : null)
                .workDone(jobCard.getWorkDone())
                .parts(partDTOs)
                .partsCost(invoice.getPartsCost())
                .labourCost(invoice.getLabourCost())
                .gst(invoice.getGst())
                .totalCost(invoice.getTotalCost())
                .paid(invoice.getPaid())
                .invoiceDate(invoice.getInvoiceDate())
                .build();
    }
}
