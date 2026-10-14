
package com.example.backend.dto;

// ESP32 xác nhận trạng thái LED
public record DeviceStatusPayload(
        Long deviceId,
        Boolean status
) {}
