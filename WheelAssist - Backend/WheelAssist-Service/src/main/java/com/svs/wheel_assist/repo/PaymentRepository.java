package com.svs.wheel_assist.repo;

import com.svs.wheel_assist.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByInvoiceInvoiceId(Long invoiceId);

    Optional<Payment> findByTransactionId(String transactionId);
}
