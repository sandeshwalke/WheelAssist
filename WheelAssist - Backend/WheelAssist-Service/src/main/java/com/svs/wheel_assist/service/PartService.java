package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.PartDTO;
import com.svs.wheel_assist.dto.response.PartResponseDTO;

import java.util.List;

public interface PartService {

    // Only the job card's mechanic can add a part
    PartResponseDTO addPart(Long jobId, PartDTO dto);

    List<PartResponseDTO> getPartsByJobCard(Long jobId);

    // Only the job card's mechanic can remove a part
    void deletePart(Long partId);
}
