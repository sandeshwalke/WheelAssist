package com.svs.wheel_assist.service.impl;

import com.svs.wheel_assist.dto.request.JobCardDTO;
import com.svs.wheel_assist.dto.request.JobCardUpdateDTO;
import com.svs.wheel_assist.dto.response.JobCardResponseDTO;
import com.svs.wheel_assist.dto.response.PartResponseDTO;
import com.svs.wheel_assist.entity.JobCard;
import com.svs.wheel_assist.entity.Part;
import com.svs.wheel_assist.entity.User;
import com.svs.wheel_assist.entity.WorkOrder;
import com.svs.wheel_assist.repo.JobCardRepository;
import com.svs.wheel_assist.repo.PartRepository;
import com.svs.wheel_assist.repo.UserRepository;
import com.svs.wheel_assist.repo.WorkorderRepository;
import com.svs.wheel_assist.service.JobCardService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobCardServiceImpl implements JobCardService {

    private final JobCardRepository jobCardRepository;
    private final WorkorderRepository workorderRepository;
    private final PartRepository partRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public JobCardResponseDTO createJobCard(JobCardDTO dto) {
        User caller = getAuthenticatedUser();

        WorkOrder workOrder = workorderRepository.findById(dto.getWorkorderId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Workorder not found with id: " + dto.getWorkorderId()));

        // Only the mechanic actually assigned to this workorder can
        // start a job card for it -- mirrors the check already used
        // for WorkOrder.updateStatus
        if (workOrder.getMechanic() == null
                || !workOrder.getMechanic().getUser().getUserId().equals(caller.getUserId())) {
            throw new AccessDeniedException("Only the assigned mechanic can create a job card for this workorder");
        }

        if (jobCardRepository.existsByWorkorderWorkorderId(dto.getWorkorderId())) {
            throw new IllegalStateException("A job card already exists for this workorder");
        }

        JobCard jobCard = JobCard.builder()
                .workorder(workOrder)
                .workDone("")
                .build();

        jobCard = jobCardRepository.save(jobCard);
        return toResponseDTO(jobCard);
    }

    @Override
    public JobCardResponseDTO getJobCardById(Long jobId) {
        JobCard jobCard = jobCardRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job card not found with id: " + jobId));
        return toResponseDTO(jobCard);
    }

    @Override
    public JobCardResponseDTO getJobCardByWorkorder(Long workorderId) {
        JobCard jobCard = jobCardRepository.findByWorkorderWorkorderId(workorderId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No job card found for workorder id: " + workorderId));
        return toResponseDTO(jobCard);
    }

    @Override
    public List<JobCardResponseDTO> getAllJobCards() {
        return jobCardRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JobCardResponseDTO updateJobCard(Long jobId, JobCardUpdateDTO dto) {
        User caller = getAuthenticatedUser();

        JobCard jobCard = jobCardRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job card not found with id: " + jobId));

        WorkOrder workOrder = jobCard.getWorkorder();
        if (workOrder.getMechanic() == null
                || !workOrder.getMechanic().getUser().getUserId().equals(caller.getUserId())) {
            throw new AccessDeniedException("Only the assigned mechanic can update this job card");
        }

        jobCard.setWorkDone(dto.getWorkDone());
        jobCard.setEstimatedCost(dto.getEstimatedCost());

        jobCard = jobCardRepository.save(jobCard);
        return toResponseDTO(jobCard);
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
    }

    private JobCardResponseDTO toResponseDTO(JobCard jobCard) {
        WorkOrder workOrder = jobCard.getWorkorder();

        List<PartResponseDTO> parts = partRepository.findByJobCardJobId(jobCard.getJobId())
                .stream()
                .map(this::toPartResponseDTO)
                .collect(Collectors.toList());

        return JobCardResponseDTO.builder()
                .jobId(jobCard.getJobId())
                .workorderId(workOrder.getWorkorderId())
                .vehiclePlate(workOrder.getVehicle().getVehiclePlate())
                .mechanicName(workOrder.getMechanic() != null
                        ? workOrder.getMechanic().getUser().getName() : null)
                .workDone(jobCard.getWorkDone())
                .estimatedCost(jobCard.getEstimatedCost())
                .parts(parts)
                .build();
    }

    private PartResponseDTO toPartResponseDTO(Part part) {
        return PartResponseDTO.builder()
                .partId(part.getPartId())
                .jobId(part.getJobCard().getJobId())
                .partName(part.getPartName())
                .quantity(part.getQuantity())
                .unitPrice(part.getUnitPrice())
                .lineTotal(part.getUnitPrice().multiply(java.math.BigDecimal.valueOf(part.getQuantity())))
                .build();
    }
}
