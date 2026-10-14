
package com.example.backend.controller;

import com.example.backend.dto.LatestSensorResponse;
import com.example.backend.entity.*;
import com.example.backend.service.SensorService;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// API danh sách và dữ liệu cảm biến
@RestController
@RequestMapping("/api/sensors")
public class SensorController {

    private final SensorService service;

    public SensorController(SensorService service) {
        this.service = service;
    }

    // GET /api/sensors
    @GetMapping
    public List<Sensor> all() {
        return service.listSensors();
    }

    // GET /api/sensors/latest
    @GetMapping("/latest")
    public List<LatestSensorResponse> latest() {
        return service.latest();
    }

    // GET /api/sensors/history
    @GetMapping("/history")
    public Page<DataSensor> history(
            @RequestParam(defaultValue = "all")
            String type,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size,

            @RequestParam(defaultValue = "desc")
            String sort) {

        return service.history(type, page, size, sort);
    }
}
