
package com.example.backend.controller;

import com.example.backend.entity.DataSensor;
import com.example.backend.service.SensorService;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// API lọc dữ liệu cảm biến
@RestController
@RequestMapping("/api/data-sensors")
public class DataSensorController {

    private final SensorService service;

    public DataSensorController(SensorService service) {
        this.service = service;
    }

    @GetMapping
    public Page<DataSensor> filter(

            @RequestParam(defaultValue = "all")
            String type,

            @RequestParam(required = false)
            BigDecimal value,

            @RequestParam(required = false)
            @DateTimeFormat(
                iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime time,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size,

            @RequestParam(defaultValue = "desc")
            String sort) {

        return service.filter(
            type, value, time, page, size, sort
        );
    }
}
