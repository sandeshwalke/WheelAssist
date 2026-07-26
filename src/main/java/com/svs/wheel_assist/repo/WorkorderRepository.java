package com.svs.wheel_assist.repo;

import com.svs.wheel_assist.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkorderRepository extends JpaRepository<WorkOrder, Long> {

    List<WorkOrder> findByMechanicIsNull();

    List<WorkOrder> findByMechanicMechanicId(Long mechanicId);

    List<WorkOrder> findByVehicleUserUserId(Long userId);

    List<WorkOrder> findByVehicleVehicleId(Long vehicleId);
}
