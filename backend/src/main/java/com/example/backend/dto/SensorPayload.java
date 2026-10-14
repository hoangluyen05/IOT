
package com.example.backend.dto;

import java.math.BigDecimal;

// Bản tin đo cảm biến ESP32 gửi lên
public record SensorPayload(
        Long sensorId,
        String type,
        BigDecimal value,
        String time
) {}
