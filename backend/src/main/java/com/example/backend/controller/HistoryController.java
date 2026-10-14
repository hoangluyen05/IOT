
package com.example.backend.controller;

import com.example.backend.entity.History;
import com.example.backend.service.HistoryService;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

// API lọc lịch sử điều khiển
@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService service;

    public HistoryController(HistoryService service) {
        this.service = service;
    }

    @GetMapping
    public Page<History> filter(

            @RequestParam(required = false)
            Long deviceId,

            @RequestParam(defaultValue = "all")
            String status,

            @RequestParam(required = false)
            @DateTimeFormat(
                iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime time,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size) {

        return service.filter(
            deviceId, status, time, page, size
        );
    }
}
