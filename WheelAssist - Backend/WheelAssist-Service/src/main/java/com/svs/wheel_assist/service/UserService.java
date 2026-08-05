package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.RegisterDTO;
import com.svs.wheel_assist.dto.request.UserUpdateDTO;
import com.svs.wheel_assist.dto.response.UserResponseDTO;

import java.util.List;

public interface UserService {

    UserResponseDTO register(RegisterDTO dto);

    UserResponseDTO getUserById(Long userId);

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO updateUser(Long userId, UserUpdateDTO dto);

    void deleteUser(Long userId);
}
