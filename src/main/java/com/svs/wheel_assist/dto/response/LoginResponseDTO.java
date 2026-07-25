package com.svs.wheel_assist.dto.response;

import com.svs.wheel_assist.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// No token here -- this is the pre-JWT version. Frontend stores
// this object (in memory/localStorage) to know who's logged in.
// Every protected endpoint is still open to anyone right now,
// since there's no Security filter checking requests yet.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {

    private Long userId;
    private String name;
    private String email;
    private Role role;

    // Present only when role = MECHANIC
    private Long mechanicId;
}
