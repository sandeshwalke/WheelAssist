package com.svs.wheel_assist.dto.response;

import com.svs.wheel_assist.enums.WorkorderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkorderResponseDTO {

    private Long workorderId;

    private Long vehicleId;
    private String vehiclePlate;
    private String vehicleModel;

    private Long ownerId;
    private String ownerName;

    private Long mechanicId;
    private String mechanicName;

    private String problemDescription;
    private WorkorderStatus status;
    private LocalDateTime createdAt;
}
