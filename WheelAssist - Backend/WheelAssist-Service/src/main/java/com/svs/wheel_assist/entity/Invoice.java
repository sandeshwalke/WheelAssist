package com.svs.wheel_assist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long invoiceId;

    // 1:1 with JobCard -- one invoice per job card
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false, unique = true)
    private JobCard jobCard;

    // These are snapshot values computed at generation time --
    // never recalculated live even if part prices change later
    @Column(name = "parts_cost", precision = 10, scale = 2)
    private BigDecimal partsCost;

    @Column(name = "labour_cost", precision = 10, scale = 2)
    private BigDecimal labourCost;

    @Column(precision = 10, scale = 2)
    private BigDecimal gst;

    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(nullable = false)
    private Boolean paid;

    @CreationTimestamp
    @Column(name = "invoice_date", updatable = false)
    private LocalDateTime invoiceDate;
}
