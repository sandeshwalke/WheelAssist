package com.svs.wheel_assist.service.impl;

import com.svs.wheel_assist.dto.request.PartDTO;
import com.svs.wheel_assist.dto.response.PartResponseDTO;
import com.svs.wheel_assist.entity.JobCard;
import com.svs.wheel_assist.entity.Part;
import com.svs.wheel_assist.entity.User;
import com.svs.wheel_assist.entity.WorkOrder;
import com.svs.wheel_assist.repo.JobCardRepository;
import com.svs.wheel_assist.repo.PartRepository;
import com.svs.wheel_assist.repo.UserRepository;
import com.svs.wheel_assist.service.PartService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartServiceImpl implements PartService {

    private final PartRepository partRepository;
    private final JobCardRepository jobCardRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PartResponseDTO addPart(Long jobId, PartDTO dto) {
        User caller = getAuthenticatedUser();

        JobCard jobCard = jobCardRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job card not found with id: " + jobId));

        checkMechanicOwnsJobCard(jobCard, caller);

        Part part = Part.builder()
                .jobCard(jobCard)
                .partName(dto.getPartName())
                .quantity(dto.getQuantity())
                .unitPrice(dto.getUnitPrice())
                .build();

        part = partRepository.save(part);
        return toResponseDTO(part);
    }

    @Override
    public List<PartResponseDTO> getPartsByJobCard(Long jobId) {
        if (!jobCardRepository.existsById(jobId)) {
            throw new EntityNotFoundException("Job card not found with id: " + jobId);
        }

        return partRepository.findByJobCardJobId(jobId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePart(Long partId) {
        User caller = getAuthenticatedUser();

        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new EntityNotFoundException("Part not found with id: " + partId));

        checkMechanicOwnsJobCard(part.getJobCard(), caller);

        partRepository.deleteById(partId);
    }

    // Shared ownership check: the caller must be the mechanic
    // assigned to the workorder this job card belongs to
    private void checkMechanicOwnsJobCard(JobCard jobCard, User caller) {
        WorkOrder workOrder = jobCard.getWorkorder();
        if (workOrder.getMechanic() == null
                || !workOrder.getMechanic().getUser().getUserId().equals(caller.getUserId())) {
            throw new AccessDeniedException("Only the assigned mechanic can modify parts on this job card");
        }
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
    }

    private PartResponseDTO toResponseDTO(Part part) {
        return PartResponseDTO.builder()
                .partId(part.getPartId())
                .jobId(part.getJobCard().getJobId())
                .partName(part.getPartName())
                .quantity(part.getQuantity())
                .unitPrice(part.getUnitPrice())
                .lineTotal(part.getUnitPrice().multiply(BigDecimal.valueOf(part.getQuantity())))
                .build();
    }
}
