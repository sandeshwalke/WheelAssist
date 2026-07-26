package com.svs.wheel_assist.dto.response;

import com.svs.wheel_assist.enums.Role;
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
public class AuthResponseDTO {

    private String token;
    private Long userId;
    private String name;
    private Role role;

    // Present only when role = MECHANIC
    private Long mechanicId;
}
