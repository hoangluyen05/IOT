
package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Truy vấn dữ liệu từ bảng Users
@Repository
public interface UserRepository
        extends JpaRepository<User, String> {
}
