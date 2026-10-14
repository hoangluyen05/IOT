
package com.example.backend.controller;

import com.example.backend.dto.DeviceCommandRequest;
import com.example.backend.entity.*;
import com.example.backend.service.DeviceService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// API điều khiển thiết bị
@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService service;

    public DeviceController(DeviceService service) {
        this.service = service;
    }

    // GET /api/devices
    @GetMapping
    public List<Device> list() {
        return service.list();
    }

    // POST /api/devices/{id}/commands
    @PostMapping("/{id}/commands")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public History command(
            @PathVariable Long id,
            @RequestBody DeviceCommandRequest body) {

        return service.command(id, body);
    }

    // POST /api/devices/commands/bulk
    @PostMapping("/commands/bulk")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public List<History> all(
            @RequestBody DeviceCommandRequest body) {

        return service.commandAll(body);
    }
}
