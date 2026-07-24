package com.svs.wheel_assist.entity;

import com.svs.wheel_assist.enums.WorkorderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workorders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "workorder_id")
    private Long workorderId;

    // No direct User FK here -- owner is reached via vehicle.getUser()
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // Nullable: unassigned until a mechanic picks it up
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id")
    private Mechanic mechanic;

    @Column(name = "problem_description", columnDefinition = "TEXT")
    private String problemDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkorderStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
