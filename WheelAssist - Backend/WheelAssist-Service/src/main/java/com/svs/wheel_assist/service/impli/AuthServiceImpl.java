package com.svs.wheel_assist.service.impli;

import com.svs.wheel_assist.dto.request.LoginDTO;
import com.svs.wheel_assist.dto.response.AuthResponseDTO;
import com.svs.wheel_assist.entity.Mechanic;
import com.svs.wheel_assist.entity.User;
import com.svs.wheel_assist.enums.Role;
import com.svs.wheel_assist.repo.MechanicRepository;
import com.svs.wheel_assist.repo.UserRepository;
import com.svs.wheel_assist.security.JwtService;
import com.svs.wheel_assist.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final MechanicRepository mechanicRepository;
    private final JwtService jwtService;

    @Override
    public AuthResponseDTO login(LoginDTO dto) {

        // Delegates the actual password check to Spring Security's
        // AuthenticationManager, which uses the DaoAuthenticationProvider
        // (CustomUserDetailsService + BCryptPasswordEncoder) configured
        // in SecurityConfig. Throws BadCredentialsException on mismatch.
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        String token = jwtService.generateToken(user);

        Long mechanicId = null;
        if (user.getRole() == Role.MECHANIC) {
            Mechanic mechanic = mechanicRepository.findByUserUserId(user.getUserId()).orElse(null);
            if (mechanic != null) {
                mechanicId = mechanic.getMechanicId();
            }
        }

        return AuthResponseDTO.builder()
                .token(token)
                .userId(user.getUserId())
                .name(user.getName())
                .role(user.getRole())
                .mechanicId(mechanicId)
                .build();
    }
}
