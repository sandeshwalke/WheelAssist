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
public class UserResponseDTO {

    private Long userId;
    private String name;
    private String phone;
    private String email;
    private Role role;

    // Present only when role = MECHANIC, null otherwise --
    // frontend checks role first, then reads these if relevant
    private String experience;
    private String specialization;

    // Never include password here -- this DTO is what goes back
    // to the client, password stays server-side only
}
