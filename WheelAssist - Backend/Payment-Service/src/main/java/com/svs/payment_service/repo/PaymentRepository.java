package com.svs.payment_service.repo;

import com.svs.payment_service.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByInvoiceId(Long invoiceId);
    Optional<Payment> findByTransactionId(String transactionId);
}
