
package com.example.backend.dto;

// Yêu cầu bật/tắt LED từ React
public record DeviceCommandRequest(
        Boolean status,
        String userId
) {}
