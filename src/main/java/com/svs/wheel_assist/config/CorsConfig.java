package com.svs.wheel_assist.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // Vite's default dev port is 5173, but it auto-increments
                // to 5174, 5175, etc. if that port is already taken by
                // another running dev server. Whitelisting a small range
                // avoids CORS breaking every time that happens.
                .allowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://localhost:5175"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}