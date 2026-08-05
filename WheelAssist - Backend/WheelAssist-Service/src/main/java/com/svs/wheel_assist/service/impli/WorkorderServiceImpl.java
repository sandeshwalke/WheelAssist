package com.svs.wheel_assist.service.impli;

import com.svs.wheel_assist.dto.request.WorkorderDTO;
import com.svs.wheel_assist.dto.request.WorkorderStatusDTO;
import com.svs.wheel_assist.dto.response.WorkorderResponseDTO;
import com.svs.wheel_assist.entity.Mechanic;
import com.svs.wheel_assist.entity.User;
import com.svs.wheel_assist.entity.Vehicle;
import com.svs.wheel_assist.entity.WorkOrder;
import com.svs.wheel_assist.enums.Role;
import com.svs.wheel_assist.enums.WorkorderStatus;
import com.svs.wheel_assist.repo.JobCardRepository;
import com.svs.wheel_assist.repo.MechanicRepository;
import com.svs.wheel_assist.repo.PartRepository;
import com.svs.wheel_assist.repo.UserRepository;
import com.svs.wheel_assist.repo.VehicleRepository;
import com.svs.wheel_assist.repo.WorkorderRepository;
import com.svs.wheel_assist.service.WorkorderService;
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
public class WorkorderServiceImpl implements WorkorderService {

    private final WorkorderRepository workorderRepository;
    private final VehicleRepository vehicleRepository;
    private final MechanicRepository mechanicRepository;
    private final UserRepository userRepository;
    private final JobCardRepository jobCardRepository;
    private final PartRepository partRepository;

    @Override
    @Transactional
    public WorkorderResponseDTO createWorkorder(WorkorderDTO dto) {
        User caller = getAuthenticatedUser();

        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Vehicle not found with id: " + dto.getVehicleId()));

        if (!vehicle.getUser().getUserId().equals(caller.getUserId())) {
            throw new AccessDeniedException("You can only create workorders for your own vehicles");
        }

        WorkOrder workOrder = WorkOrder.builder()
                .vehicle(vehicle)
                .mechanic(null)
                .problemDescription(dto.getProblemDescription())
                .status(WorkorderStatus.PENDING)
                .build();

        workOrder = workorderRepository.save(workOrder);
        return toResponseDTO(workOrder);
    }

    @Override
    public WorkorderResponseDTO getWorkorderById(Long workorderId) {
        WorkOrder workOrder = workorderRepository.findById(workorderId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Workorder not found with id: " + workorderId));
        return toResponseDTO(workOrder);
    }

    @Override
    public List<WorkorderResponseDTO> getAllWorkorders() {
        return workorderRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkorderResponseDTO> getUnassignedWorkorders() {
        return workorderRepository.findByMechanicIsNull()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkorderResponseDTO> getWorkordersByUser(Long userId) {
        User caller = getAuthenticatedUser();

        boolean isSelf = caller.getUserId().equals(userId);
        boolean isMechanic = caller.getRole() == Role.MECHANIC;

        if (!isSelf && !isMechanic) {
            throw new AccessDeniedException("You can only view your own workorders");
        }

        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found with id: " + userId);
        }

        return workorderRepository.findByVehicleUserUserId(userId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkorderResponseDTO> getWorkordersByMechanic(Long mechanicId) {
        User caller = getAuthenticatedUser();

        if (caller.getRole() != Role.MECHANIC) {
            throw new AccessDeniedException("Only mechanics can view a mechanic's job list");
        }

        Mechanic callerMechanic = mechanicRepository.findByUserUserId(caller.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("Mechanic profile not found for current user"));

        if (!callerMechanic.getMechanicId().equals(mechanicId)) {
            throw new AccessDeniedException("You can only view your own job list");
        }

        return workorderRepository.findByMechanicMechanicId(mechanicId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WorkorderResponseDTO assignToSelf(Long workorderId) {
        User caller = getAuthenticatedUser();

        if (caller.getRole() != Role.MECHANIC) {
            throw new AccessDeniedException("Only mechanics can be assigned to a workorder");
        }

        Mechanic mechanic = mechanicRepository.findByUserUserId(caller.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("Mechanic profile not found for current user"));

        WorkOrder workOrder = workorderRepository.findById(workorderId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Workorder not found with id: " + workorderId));

        if (workOrder.getMechanic() != null) {
            throw new IllegalStateException("This workorder is already assigned to a mechanic");
        }

        if (workOrder.getStatus() != WorkorderStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING workorders can be assigned, current status: " + workOrder.getStatus());
        }

        workOrder.setMechanic(mechanic);
        workOrder.setStatus(WorkorderStatus.ASSIGNED);

        workOrder = workorderRepository.save(workOrder);
        return toResponseDTO(workOrder);
    }

    @Override
    @Transactional
    public WorkorderResponseDTO updateStatus(Long workorderId, WorkorderStatusDTO dto) {
        User caller = getAuthenticatedUser();

        WorkOrder workOrder = workorderRepository.findById(workorderId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Workorder not found with id: " + workorderId));

        if (workOrder.getMechanic() == null
                || !workOrder.getMechanic().getUser().getUserId().equals(caller.getUserId())) {
            throw new AccessDeniedException("Only the assigned mechanic can update this workorder's status");
        }

        validateStatusTransition(workOrder.getStatus(), dto.getStatus());

        workOrder.setStatus(dto.getStatus());
        workOrder = workorderRepository.save(workOrder);
        return toResponseDTO(workOrder);
    }

    @Override
    @Transactional
    public void deleteWorkorder(Long workorderId) {
        User caller = getAuthenticatedUser();

        WorkOrder workOrder = workorderRepository.findById(workorderId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Workorder not found with id: " + workorderId));

        boolean isOwner = workOrder.getVehicle().getUser().getUserId().equals(caller.getUserId());
        boolean isMechanic = caller.getRole() == Role.MECHANIC;
        boolean isAdmin = caller.getRole() == Role.ADMIN;

        if (!isOwner && !isMechanic && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to delete this workorder");
        }

        // Clean up linked JobCard and Parts if present
        jobCardRepository.findByWorkorderWorkorderId(workorderId).ifPresent(jobCard -> {
            partRepository.deleteAll(partRepository.findByJobCardJobId(jobCard.getJobId()));
            jobCardRepository.delete(jobCard);
        });

        workorderRepository.delete(workOrder);
    }

    private void validateStatusTransition(WorkorderStatus current, WorkorderStatus next) {
        // Only DELIVERED and CANCELLED are true dead ends -- nothing
        // legally follows them. COMPLETED still has one legal forward
        // move (-> DELIVERED), so it must NOT be in this terminal
        // list, or that transition gets blocked before it's ever
        // checked below.
        if (current == WorkorderStatus.DELIVERED || current == WorkorderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot change status once a workorder is " + current);
        }

        if (next == WorkorderStatus.CANCELLED) {
            return;
        }

        boolean validForwardMove =
                (current == WorkorderStatus.PENDING && next == WorkorderStatus.ASSIGNED) ||
                        (current == WorkorderStatus.ASSIGNED && next == WorkorderStatus.IN_PROGRESS) ||
                        (current == WorkorderStatus.IN_PROGRESS && next == WorkorderStatus.COMPLETED) ||
                        (current == WorkorderStatus.COMPLETED && next == WorkorderStatus.DELIVERED);

        if (!validForwardMove) {
            throw new IllegalStateException("Invalid status transition from " + current + " to " + next);
        }
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
    }

    private WorkorderResponseDTO toResponseDTO(WorkOrder workOrder) {
        Vehicle vehicle = workOrder.getVehicle();
        Mechanic mechanic = workOrder.getMechanic();

        return WorkorderResponseDTO.builder()
                .workorderId(workOrder.getWorkorderId())
                .vehicleId(vehicle.getVehicleId())
                .vehiclePlate(vehicle.getVehiclePlate())
                .vehicleModel(vehicle.getModel())
                .ownerId(vehicle.getUser().getUserId())
                .ownerName(vehicle.getUser().getName())
                .mechanicId(mechanic != null ? mechanic.getMechanicId() : null)
                .mechanicName(mechanic != null ? mechanic.getUser().getName() : null)
                .problemDescription(workOrder.getProblemDescription())
                .status(workOrder.getStatus())
                .createdAt(workOrder.getCreatedAt())
                .build();
    }
}
