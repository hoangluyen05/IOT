
package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.mqtt.MqttGateway;
import com.example.backend.repository.*;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

import static org.springframework.http.HttpStatus.*;

@Service
public class DeviceService {

    private final DeviceRepository devices;
    private final HistoryRepository history;
    private final UserRepository users;
    private final MqttGateway mqtt;
    private final SimpMessagingTemplate ws;

    public DeviceService(
            DeviceRepository devices,
            HistoryRepository history,
            UserRepository users,
            MqttGateway mqtt,
            SimpMessagingTemplate ws) {

        this.devices = devices;
        this.history = history;
        this.users = users;
        this.mqtt = mqtt;
        this.ws = ws;
    }

    // Lấy danh sách thiết bị
    public List<Device> list() {
        return devices.findAll();
    }

    // Gửi lệnh bật/tắt một LED
    public History command(
            Long deviceId,
            DeviceCommandRequest request) {

        // Kiểm tra yêu cầu
        if (request == null ||
                request.status() == null ||
                request.userId() == null ||
                request.userId().isBlank()) {

            throw new ResponseStatusException(
                BAD_REQUEST,
                "Thiếu status hoặc userId"
            );
        }

        // Kiểm tra LED tồn tại
        devices.findById(deviceId).orElseThrow(() ->
            new ResponseStatusException(
                NOT_FOUND,
                "Không tìm thấy LED"
            )
        );

        // Kiểm tra người dùng tồn tại
        if (!users.existsById(request.userId())) {
            throw new ResponseStatusException(
                BAD_REQUEST,
                "userId không tồn tại"
            );
        }

        // Kiểm tra MQTT đã kết nối
        if (!mqtt.isConnected()) {
            throw new ResponseStatusException(
                SERVICE_UNAVAILABLE,
                "MQTT broker chưa kết nối"
            );
        }

        // Lưu lịch sử đang chờ xác nhận
        History row = new History();
        row.setDeviceId(deviceId);
        row.setUserId(request.userId());
        row.setAction(request.status() ? "ON" : "OFF");
        row.setStatus("PENDING");
        row.setTime(LocalDateTime.now());

        History saved = history.save(row);

        try {
            // Gửi lệnh MQTT xuống ESP32
            mqtt.sendCommand(
                new DeviceCommandPayload(
                    deviceId,
                    request.status()
                )
            );
        } catch (Exception ex) {
            saved.setStatus("FAILED");
            history.save(saved);

            throw new ResponseStatusException(
                SERVICE_UNAVAILABLE,
                "Không gửi được lệnh MQTT",
                ex
            );
        }

        // Thông báo có hành động mới
        ws.convertAndSend("/topic/actions", saved);
        return saved;
    }

    // Bật/tắt tất cả LED
    public List<History> commandAll(
            DeviceCommandRequest request) {

        List<History> result = new ArrayList<>();

        for (Device device : devices.findAll()) {
            result.add(
                command(device.getDeviceId(), request)
            );
        }

        return result;
    }

    // Nhận trạng thái xác nhận từ ESP32
    @Transactional
    public void confirmStatus(DeviceStatusPayload payload) {

        if (payload == null ||
                payload.deviceId() == null ||
                payload.status() == null) {
            return;
        }

        Device device = devices.findById(payload.deviceId())
            .orElseThrow(() ->
                new ResponseStatusException(
                    NOT_FOUND,
                    "Không tìm thấy LED"
                )
            );

        // Cập nhật trạng thái LED trong MySQL
        device.setStatus(payload.status());
        devices.save(device);

        String action = payload.status() ? "ON" : "OFF";

        // Xác nhận lệnh đang chờ
        history
            .findFirstByDeviceIdAndActionAndStatusOrderByTimeDesc(
                payload.deviceId(),
                action,
                "PENDING"
            )
            .ifPresent(item -> {
                item.setStatus("SUCCESS");
                History saved = history.save(item);
                ws.convertAndSend("/topic/actions", saved);
            });

        // Phát trạng thái mới cho React
        ws.convertAndSend("/topic/devices", device);
    }
}
