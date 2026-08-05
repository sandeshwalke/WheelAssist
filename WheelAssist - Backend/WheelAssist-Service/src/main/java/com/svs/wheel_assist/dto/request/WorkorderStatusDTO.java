package com.svs.wheel_assist.dto.request;

import com.svs.wheel_assist.enums.WorkorderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkorderStatusDTO {

    @NotNull(message = "Status is required")
    private WorkorderStatus status;
}
