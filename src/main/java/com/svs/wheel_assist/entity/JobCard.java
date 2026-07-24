package com.svs.wheel_assist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "job_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_id")
    private Long jobId;

    // 1:1 with Workorder -- one job card per workorder
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workorder_id", nullable = false, unique = true)
    private WorkOrder workorder;

    @Column(name = "work_done", columnDefinition = "TEXT")
    private String workDone;

    @Column(name = "estimated_cost", precision = 10, scale = 2)
    private BigDecimal estimatedCost;
}
