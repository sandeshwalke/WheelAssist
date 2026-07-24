package com.svs.wheel_assist.repo;

import com.svs.wheel_assist.entity.Mechanic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MechanicRepository extends JpaRepository<Mechanic, Long> {

    Optional<Mechanic> findByUserUserId(Long userId);
}
