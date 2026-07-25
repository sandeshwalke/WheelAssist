package com.svs.wheel_assist.service;

import com.svs.wheel_assist.dto.request.RegisterDTO;
import com.svs.wheel_assist.dto.response.UserResponseDTO;
import com.svs.wheel_assist.entity.Mechanic;
import com.svs.wheel_assist.entity.User;
import com.svs.wheel_assist.enums.Role;
import com.svs.wheel_assist.enums.UserStatus;
import com.svs.wheel_assist.repo.MechanicRepository;
import com.svs.wheel_assist.repo.UserRepository;
import com.svs.wheel_assist.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final MechanicRepository mechanicRepository;

    // NOTE: password is stored as plain text for now since we're
    // skipping Spring Security/JWT in this pass.

    @Override
    @Transactional
    public UserResponseDTO register(RegisterDTO dto) {

        if (dto.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot self-register as ADMIN");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (userRepository.existsByPhone(dto.getPhone())) {
            throw new IllegalArgumentException("Phone already registered");
        }

        User user = User.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .role(dto.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        String experience = null;
        String specialization = null;

        if (dto.getRole() == Role.MECHANIC) {
            if (dto.getExperience() == null || dto.getExperience().isBlank()
                    || dto.getSpecialization() == null || dto.getSpecialization().isBlank()) {
                throw new IllegalArgumentException(
                        "Experience and specialization are required for mechanic registration");
            }

            Mechanic mechanic = Mechanic.builder()
                    .user(user)
                    .experience(dto.getExperience())
                    .specialization(dto.getSpecialization())
                    .build();

            mechanicRepository.save(mechanic);
            experience = dto.getExperience();
            specialization = dto.getSpecialization();
        }

        return toResponseDTO(user, experience, specialization);
    }

    @Override
    public UserResponseDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        return toResponseDTO(user, null, null);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> toResponseDTO(user, null, null))
                .collect(Collectors.toList());
    }

    // Shared mapper -- if experience/specialization aren't passed in
    // (null, null), it looks them up itself when the user is a
    // MECHANIC. Used by register (which already has the values on
    // hand), getUserById, and getAllUsers.
    private UserResponseDTO toResponseDTO(User user, String experience, String specialization) {

        if (user.getRole() == Role.MECHANIC && experience == null && specialization == null) {
            Mechanic mechanic = mechanicRepository.findByUserUserId(user.getUserId()).orElse(null);
            if (mechanic != null) {
                experience = mechanic.getExperience();
                specialization = mechanic.getSpecialization();
            }
        }

        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole())
                .experience(experience)
                .specialization(specialization)
                .build();
    }
}
