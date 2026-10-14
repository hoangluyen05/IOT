
package com.example.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// Ánh xạ bảng DataSensors
@Entity
@Table(name = "DataSensors")
public class DataSensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "datasensor_id")
    private Long datasensorId;

    // Khóa ngoại tham chiếu Sensors
    @Column(name = "sensor_id")
    private Long sensorId;

    // Giá trị đo
    @Column(name = "value")
    private BigDecimal value;

    // Thời điểm đo
    @Column(name = "time")
    private LocalDateTime time;

    // Loại cảm biến
    @Column(name = "type")
    private String type;

    public Long getDatasensorId() {
        return datasensorId;
    }

    public void setDatasensorId(Long id) {
        this.datasensorId = id;
    }

    public Long getSensorId() {
        return sensorId;
    }

    public void setSensorId(Long id) {
        this.sensorId = id;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
