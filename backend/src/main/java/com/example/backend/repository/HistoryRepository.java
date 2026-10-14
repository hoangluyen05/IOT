
package com.example.backend.repository;

import com.example.backend.entity.History;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

// Repository quản lý lịch sử điều khiển
public interface HistoryRepository
        extends JpaRepository<History, Long>,
                JpaSpecificationExecutor<History> {

    // Tìm lệnh đang chờ ESP32 xác nhận
    Optional<History>
    findFirstByDeviceIdAndActionAndStatusOrderByTimeDesc(
            Long deviceId,
            String action,
            String status
    );
}
