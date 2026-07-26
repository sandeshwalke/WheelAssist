package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.LoginDTO;
import com.svs.wheel_assist.dto.response.AuthResponseDTO;

public interface AuthService {

    AuthResponseDTO login(LoginDTO dto);
}
