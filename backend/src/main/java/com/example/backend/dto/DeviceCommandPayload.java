
package com.example.backend.dto;

// Lệnh Backend gửi xuống ESP32
public record DeviceCommandPayload(
        Long deviceId,
        Boolean status
) {}
