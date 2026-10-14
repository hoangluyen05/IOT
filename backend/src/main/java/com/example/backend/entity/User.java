
package com.example.backend.entity;

import jakarta.persistence.*;

// Ánh xạ Entity với bảng Users trong MySQL
@Entity
@Table(name = "Users")
public class User {

    // Mã người dùng là khóa chính
    @Id
    @Column(name = "user_id", length = 20)
    private String userId;

    // Họ tên người dùng
    @Column(name = "name", length = 100)
    private String name;

    // Đường dẫn báo cáo
    @Column(name = "report", columnDefinition = "TEXT")
    private String report;

    // Đường dẫn tài liệu API
    @Column(name = "api", columnDefinition = "TEXT")
    private String api;

    // Đường dẫn GitHub
    @Column(name = "github", columnDefinition = "TEXT")
    private String github;

    // Đường dẫn Figma
    @Column(name = "figma", columnDefinition = "TEXT")
    private String figma;

    // Constructor rỗng cho JPA
    public User() {
    }

    // Getter và Setter
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getReport() {
        return report;
    }

    public void setReport(String report) {
        this.report = report;
    }

    public String getApi() {
        return api;
    }

    public void setApi(String api) {
        this.api = api;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getFigma() {
        return figma;
    }

    public void setFigma(String figma) {
        this.figma = figma;
    }
}
