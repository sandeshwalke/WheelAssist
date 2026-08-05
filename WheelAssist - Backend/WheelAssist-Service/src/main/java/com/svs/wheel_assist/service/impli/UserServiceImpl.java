package com.svs.wheel_assist.service.impli;

import com.svs.wheel_assist.dto.request.RegisterDTO;
import com.svs.wheel_assist.dto.request.UserUpdateDTO;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final MechanicRepository mechanicRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponseDTO register(RegisterDTO dto) {

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
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        String experience = null;
        String specialization = null;

        if (dto.getRole() == Role.MECHANIC) {
            experience = dto.getExperience() != null ? dto.getExperience() : "General";
            specialization = dto.getSpecialization() != null ? dto.getSpecialization() : "Auto Maintenance";

            Mechanic mechanic = Mechanic.builder()
                    .user(user)
                    .experience(experience)
                    .specialization(specialization)
                    .build();

            mechanicRepository.save(mechanic);
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

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long userId, UserUpdateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        user.setName(dto.getName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());

        Role previousRole = user.getRole();
        user.setRole(dto.getRole());
        user = userRepository.save(user);

        String experience = dto.getExperience();
        String specialization = dto.getSpecialization();

        if (dto.getRole() == Role.MECHANIC) {
            Mechanic mechanic = mechanicRepository.findByUserUserId(userId).orElse(null);
            if (mechanic == null) {
                mechanic = Mechanic.builder()
                        .user(user)
                        .experience(experience != null ? experience : "General")
                        .specialization(specialization != null ? specialization : "General Repairs")
                        .build();
            } else {
                if (experience != null) mechanic.setExperience(experience);
                if (specialization != null) mechanic.setSpecialization(specialization);
            }
            mechanicRepository.save(mechanic);
        } else if (previousRole == Role.MECHANIC) {
            mechanicRepository.findByUserUserId(userId).ifPresent(mechanicRepository::delete);
        }

        return toResponseDTO(user, experience, specialization);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        mechanicRepository.findByUserUserId(userId).ifPresent(mechanicRepository::delete);
        userRepository.delete(user);
    }

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
