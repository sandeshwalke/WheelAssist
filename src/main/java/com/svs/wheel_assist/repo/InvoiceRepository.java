package com.svs.wheel_assist.repo;

import com.svs.wheel_assist.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByJobCardJobId(Long jobId);

    boolean existsByJobCardJobId(Long jobId);
}