
package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// Bảng lịch sử điều khiển LED
@Entity
@Table(name = "History")
public class History {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    // Khóa ngoại tới Devices
    @Column(name = "device_id")
    private Long deviceId;

    // Khóa ngoại tới Users
    @Column(name = "user_id", length = 20)
    private String userId;

    // Hành động ON hoặc OFF
    @Column(name = "action")
    private String action;

    // PENDING, SUCCESS hoặc FAILED
    @Column(name = "status")
    private String status;

    // Thời điểm thực hiện
    @Column(name = "time")
    private LocalDateTime time;

    public Long getHistoryId() {
        return historyId;
    }

    public void setHistoryId(Long historyId) {
        this.historyId = historyId;
    }

    public Long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(Long deviceId) {
        this.deviceId = deviceId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }
}
