
package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Giá trị mới nhất trả về Dashboard
public record LatestSensorResponse(
        Long sensorId,
        String type,
        BigDecimal value,
        LocalDateTime time
) {}
