
package com.example.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Cấu hình Jackson 2 để xử lý JSON MQTT
@Configuration
public class JacksonConfig {

    // Tạo ObjectMapper cho Spring Boot sử dụng
    @Bean
    public ObjectMapper objectMapper() {

        ObjectMapper mapper = new ObjectMapper();

        // Hỗ trợ kiểu ngày giờ Java
        mapper.registerModule(new JavaTimeModule());

        return mapper;
    }
}
