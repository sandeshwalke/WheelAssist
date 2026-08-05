package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.WorkorderDTO;
import com.svs.wheel_assist.dto.request.WorkorderStatusDTO;
import com.svs.wheel_assist.dto.response.WorkorderResponseDTO;

import java.util.List;

public interface WorkorderService {

    // Caller (from JWT) must own vehicleId
    WorkorderResponseDTO createWorkorder(WorkorderDTO dto);

    WorkorderResponseDTO getWorkorderById(Long workorderId);

    List<WorkorderResponseDTO> getAllWorkorders();

    List<WorkorderResponseDTO> getUnassignedWorkorders();

    // userId is checked against the caller's own identity unless
    // the caller is a MECHANIC
    List<WorkorderResponseDTO> getWorkordersByUser(Long userId);

    // mechanicId is checked against the caller's own mechanic
    // profile -- a mechanic cannot view another mechanic's queue
    List<WorkorderResponseDTO> getWorkordersByMechanic(Long mechanicId);

    // No DTO -- the assigning mechanic is taken from the JWT, not
    // a request body
    WorkorderResponseDTO assignToSelf(Long workorderId);

    // Only the mechanic already assigned to this workorder may
    // progress its status
    WorkorderResponseDTO updateStatus(Long workorderId, WorkorderStatusDTO dto);

    void deleteWorkorder(Long workorderId);
}
