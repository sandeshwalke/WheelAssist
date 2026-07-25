package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.LoginDTO;
import com.svs.wheel_assist.dto.response.LoginResponseDTO;

public interface AuthService {

    LoginResponseDTO login(LoginDTO dto);
}
