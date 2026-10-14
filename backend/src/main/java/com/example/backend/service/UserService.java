
package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

// Xử lý nghiệp vụ người dùng
@Service
public class UserService {

    private final UserRepository userRepository;

    // Inject Repository qua constructor
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Lấy danh sách người dùng
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Lấy thông tin người dùng theo ID
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng: " + userId
                    )
                );
    }
}
