package com.svs.payment_service.security;

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

    @Value("${wheelassist.internal.api-key}")
    private String expectedApiKey;

    private static final String HEADER_NAME = "X-Internal-Api-Key";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Only lock down the internal endpoint -- let everything else
        // (like /verify) pass through this filter untouched.
        if ("/api/payments/create-order".equals(request.getRequestURI())) {
            String providedKey = request.getHeader(HEADER_NAME);

            if (providedKey == null || !providedKey.equals(expectedApiKey)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Invalid or missing internal API key");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}