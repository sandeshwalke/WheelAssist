package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.LoginDTO;
import com.svs.wheel_assist.dto.response.LoginResponseDTO;
import com.svs.wheel_assist.entity.Mechanic;
import com.svs.wheel_assist.entity.User;
import com.svs.wheel_assist.enums.Role;
import com.svs.wheel_assist.repo.MechanicRepository;
import com.svs.wheel_assist.repo.UserRepository;
import com.svs.wheel_assist.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final MechanicRepository mechanicRepository;

    // TEMPORARY: plain-text password comparison, no hashing, no token issued.

    @Override
    public LoginResponseDTO login(LoginDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.getPassword().equals(dto.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        Long mechanicId = null;
        if (user.getRole() == Role.MECHANIC) {
            Mechanic mechanic = mechanicRepository.findByUserUserId(user.getUserId()).orElse(null);
            if (mechanic != null) {
                mechanicId = mechanic.getMechanicId();
            }
        }

        return LoginResponseDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .mechanicId(mechanicId)
                .build();
    }
}
