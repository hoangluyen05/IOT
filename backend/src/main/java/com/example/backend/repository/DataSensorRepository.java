
package com.example.backend.repository;

import com.example.backend.entity.DataSensor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

// Repository lưu và lọc dữ liệu cảm biến
public interface DataSensorRepository
        extends JpaRepository<DataSensor, Long>,
                JpaSpecificationExecutor<DataSensor> {

    // Lọc theo loại cảm biến
    Page<DataSensor> findByTypeIgnoreCase(
            String type,
            Pageable pageable
    );

    // Lấy dữ liệu mới nhất của từng loại
    Optional<DataSensor>
    findFirstByTypeIgnoreCaseOrderByTimeDesc(
            String type
    );
}
