package com.svs.wheel_assist.repo;

import com.svs.wheel_assist.entity.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobCardRepository extends JpaRepository<JobCard, Long> {

    Optional<JobCard> findByWorkorderWorkorderId(Long workorderId);

    boolean existsByWorkorderWorkorderId(Long workorderId);
}
