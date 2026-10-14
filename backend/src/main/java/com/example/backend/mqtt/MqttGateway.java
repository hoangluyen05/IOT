
package com.example.backend.mqtt;

import com.example.backend.dto.*;
import com.example.backend.service.SensorService;
import com.example.backend.service.DeviceService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PreDestroy;

import org.eclipse.paho.client.mqttv3.*;
import org.slf4j.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

// Kết nối MQTT giữa Backend và ESP32
@Component
public class MqttGateway {

    private static final Logger log =
        LoggerFactory.getLogger(MqttGateway.class);

    private final ObjectMapper mapper;
    private final SensorService sensorService;
    private final DeviceService deviceService;

    private final String url;
    private final String username;
    private final String password;

    private MqttClient client;

    public MqttGateway(
            ObjectMapper mapper,
            @Lazy SensorService sensorService,
            @Lazy DeviceService deviceService,
            @Value("${iot.mqtt.url}") String url,
            @Value("${iot.mqtt.username:}") String username,
            @Value("${iot.mqtt.password:}") String password) {

        this.mapper = mapper;
        this.sensorService = sensorService;
        this.deviceService = deviceService;
        this.url = url;
        this.username = username;
        this.password = password;
    }

    // Tự thử kết nối lại sau mỗi 5 giây
    @Scheduled(fixedDelay = 5000)
    public synchronized void connectIfNeeded() {

        if (isConnected()) {
            return;
        }

        try {
            if (client != null) {
                try {
                    client.close();
                } catch (Exception ignored) {
                }
            }

            // Tạo MQTT Client
            client = new MqttClient(
                url,
                "iot-backend-" + UUID.randomUUID(),
                new org.eclipse.paho.client.mqttv3.persist.MemoryPersistence()
            );

            // Xử lý bản tin MQTT
            client.setCallback(new MqttCallback() {

                @Override
                public void connectionLost(Throwable cause) {
                    log.warn(
                        "MQTT disconnected: {}",
                        cause.getMessage()
                    );
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {
                }

                @Override
                public void messageArrived(
                        String topic,
                        MqttMessage message) {

                    String json = new String(
                        message.getPayload(),
                        StandardCharsets.UTF_8
                    );

                    try {
                        // Nhận dữ liệu cảm biến
                        if (topic.equals("iot/sensors/data")) {

                            SensorPayload payload =
                                mapper.readValue(
                                    json,
                                    SensorPayload.class
                                );

                            sensorService.saveMqttReading(payload);
                        }

                        // Nhận phản hồi trạng thái LED
                        else if (topic.equals("iot/devices/status")) {

                            DeviceStatusPayload payload =
                                mapper.readValue(
                                    json,
                                    DeviceStatusPayload.class
                                );

                            deviceService.confirmStatus(payload);
                        }

                    } catch (Exception ex) {
                        log.error(
                            "MQTT message invalid for topic {}: {}",
                            topic,
                            ex.getMessage()
                        );
                    }
                }
            });

            // Cấu hình kết nối Broker
            MqttConnectOptions options =
                new MqttConnectOptions();

            options.setCleanSession(true);
            options.setConnectionTimeout(3);

            if (!username.isBlank()) {
                options.setUserName(username);
            }

            if (!password.isBlank()) {
                options.setPassword(password.toCharArray());
            }

            // Kết nối MQTT
            client.connect(options);

            // Đăng ký các topic nhận dữ liệu
            client.subscribe(
                new String[] {
                    "iot/sensors/data",
                    "iot/devices/status"
                },
                new int[] {1, 1}
            );

            log.info("Connected MQTT broker {}", url);

        } catch (Exception ex) {
            log.warn(
                "MQTT not available yet: {}",
                ex.getMessage()
            );
        }
    }

    // Kiểm tra MQTT đang kết nối
    public synchronized boolean isConnected() {
        return client != null && client.isConnected();
    }

    // Gửi lệnh bật/tắt LED xuống ESP32
    public synchronized void sendCommand(
            DeviceCommandPayload payload) throws Exception {

        if (!isConnected()) {
            throw new IllegalStateException(
                "MQTT disconnected"
            );
        }

        byte[] json = mapper.writeValueAsBytes(payload);

        MqttMessage message = new MqttMessage(json);
        message.setQos(1);

        client.publish(
            "iot/devices/commands",
            message
        );
    }

    // Đóng kết nối khi dừng Backend
    @PreDestroy
    public synchronized void close() {

        if (client != null) {
            try {
                client.disconnect();
                client.close();
            } catch (Exception ignored) {
            }
        }
    }
}
