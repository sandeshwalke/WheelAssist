package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.JobCardDTO;
import com.svs.wheel_assist.dto.request.JobCardUpdateDTO;
import com.svs.wheel_assist.dto.response.JobCardResponseDTO;

import java.util.List;

public interface JobCardService {

    JobCardResponseDTO createJobCard(JobCardDTO dto);

    JobCardResponseDTO getJobCardById(Long jobId);

    JobCardResponseDTO getJobCardByWorkorder(Long workorderId);
    
    JobCardResponseDTO updateJobCard(Long jobId, JobCardUpdateDTO dto);

    List<JobCardResponseDTO> getAllJobCards();
    

}
