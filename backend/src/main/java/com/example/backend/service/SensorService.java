
package com.example.backend.service;

import com.example.backend.dto.LatestSensorResponse;
import com.example.backend.dto.SensorPayload;
import com.example.backend.entity.DataSensor;
import com.example.backend.entity.Sensor;
import com.example.backend.repository.DataSensorRepository;
import com.example.backend.repository.SensorRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class SensorService {

    private final SensorRepository sensors;
    private final DataSensorRepository data;
    private final SimpMessagingTemplate ws;

    public SensorService(
            SensorRepository sensors,
            DataSensorRepository data,
            SimpMessagingTemplate ws) {

        this.sensors = sensors;
        this.data = data;
        this.ws = ws;
    }

    // Lấy danh sách cảm biến
    public List<Sensor> listSensors() {
        return sensors.findAll();
    }

    public Page<DataSensor> history(
        String type,
        int page,
        int size,
        String sort) {

    return filter(type, null, null, page, size, sort);
}

public Page<DataSensor> filter(
        String type,
        BigDecimal value,
        LocalDateTime time,
        int page,
        int size,
        String sort) {

    Specification<DataSensor> spec = (root, query, cb) -> {

        List<Predicate> conditions = new ArrayList<>();

        // Lọc theo loại cảm biến
        if (type != null
                && !type.isBlank()
                && !type.equalsIgnoreCase("all")) {

            conditions.add(
                cb.equal(
                    cb.lower(root.get("type")),
                    type.toLowerCase(Locale.ROOT)
                )
            );
        }

        // Lọc theo một giá trị cụ thể
        if (value != null) {
            conditions.add(
                cb.equal(root.get("value"), value)
            );
        }

        // Lọc thời gian đến độ chính xác một phút
        if (time != null) {
            LocalDateTime start = time
                .withSecond(0)
                .withNano(0);

            LocalDateTime end = start.plusMinutes(1);

            conditions.add(
                cb.greaterThanOrEqualTo(
                    root.<LocalDateTime>get("time"),
                    start
                )
            );

            conditions.add(
                cb.lessThan(
                    root.<LocalDateTime>get("time"),
                    end
                )
            );
        }

        return cb.and(conditions.toArray(new Predicate[0]));
    };

    Sort.Direction direction =
        "asc".equalsIgnoreCase(sort)
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;

    Pageable pageable = PageRequest.of(
        Math.max(page, 0),
        Math.min(Math.max(size, 1), 100),
        Sort.by(direction, "time", "datasensorId")
    );

    return data.findAll(spec, pageable);
}

    // Lấy giá trị mới nhất cho Dashboard
    public List<LatestSensorResponse> latest() {
        List<LatestSensorResponse> result = new ArrayList<>();

        for (String type : List.of(
                "temperature",
                "humidity",
                "light")) {

            data.findFirstByTypeIgnoreCaseOrderByTimeDesc(type)
                .ifPresent(item ->
                    result.add(new LatestSensorResponse(
                        item.getSensorId(),
                        item.getType(),
                        item.getValue(),
                        item.getTime()
                    ))
                );
        }

        return result;
    }

    // Lưu dữ liệu thật nhận từ ESP32
    @Transactional
    public void saveMqttReading(SensorPayload payload) {

        if (payload == null ||
                payload.sensorId() == null ||
                payload.value() == null ||
                payload.type() == null ||
                payload.type().isBlank()) {

            throw new ResponseStatusException(
                BAD_REQUEST,
                "Thiếu sensorId, type hoặc value"
            );
        }

        // Kiểm tra cảm biến tồn tại
        Sensor sensor = sensors.findById(payload.sensorId())
            .orElseThrow(() ->
                new ResponseStatusException(
                    BAD_REQUEST,
                    "sensorId không tồn tại"
                )
            );

        // Tạo bản ghi đo mới
        DataSensor row = new DataSensor();
        row.setSensorId(sensor.getSensorId());
        row.setType(payload.type().toLowerCase(Locale.ROOT));
        row.setValue(payload.value());

        row.setTime(
            payload.time() == null || payload.time().isBlank()
                ? LocalDateTime.now()
                : LocalDateTime.parse(payload.time())
        );

        // Lưu MySQL và cập nhật WebSocket
        DataSensor saved = data.save(row);
        ws.convertAndSend("/topic/sensors", saved);
    }
    
}
