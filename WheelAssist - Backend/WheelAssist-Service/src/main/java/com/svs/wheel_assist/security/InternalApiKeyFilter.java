package com.svs.wheel_assist.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    @Value("${paymentservice.internal.api-key}")
    private String expectedApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Only lock down internal callback routes -- everything else
        // (the normal customer/mechanic-facing API) passes through
        // this filter untouched and is handled by the existing
        // JwtAuthFilter/SecurityConfig rules instead.
        if (request.getRequestURI().startsWith("/internal/")) {
            String providedKey = request.getHeader("X-Internal-Api-Key");

            if (providedKey == null || !providedKey.equals(expectedApiKey)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Invalid or missing internal API key");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}