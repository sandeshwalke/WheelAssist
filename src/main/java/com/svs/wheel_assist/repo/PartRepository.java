package com.svs.wheel_assist.repo;

import com.svs.wheel_assist.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartRepository extends JpaRepository<Part, Long> {

    List<Part> findByJobCardJobId(Long jobId);
}
