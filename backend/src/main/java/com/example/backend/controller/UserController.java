
package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.service.UserService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

// Cung cấp REST API quản lý thông tin người dùng
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // Inject Service qua constructor
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // API lấy tất cả người dùng
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // API lấy người dùng theo ID
    @GetMapping("/{userId}")
    public User getUserById(
            @PathVariable String userId) {

        return userService.getUserById(userId);
    }
}
// .\mvnw.cmd spring-boot:run