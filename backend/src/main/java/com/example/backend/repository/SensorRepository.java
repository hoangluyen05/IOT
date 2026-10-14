
package com.example.backend.repository;

import com.example.backend.entity.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;

// Truy vấn bảng Sensors
public interface SensorRepository
        extends JpaRepository<Sensor, Long> {
}
