
package com.example.backend.repository;

import com.example.backend.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

// Truy vấn bảng Devices
public interface DeviceRepository
        extends JpaRepository<Device, Long> {
}
