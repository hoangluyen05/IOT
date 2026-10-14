
package com.example.backend.service;

import com.example.backend.entity.History;
import com.example.backend.repository.HistoryRepository;

import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class HistoryService {

    private final HistoryRepository repo;

    public HistoryService(HistoryRepository repo) {
        this.repo = repo;
    }

    // Lấy tất cả lịch sử
    public Page<History> list(int page, int size) {
        return filter(null, null, null, page, size);
    }

    // Lọc lịch sử theo thiết bị, trạng thái, thời gian
    public Page<History> filter(
            Long deviceId,
            String status,
            LocalDateTime time,
            int page,
            int size) {

        Specification<History> spec = (root, query, cb) -> {

            List<Predicate> conditions = new ArrayList<>();

            // Lọc theo thiết bị LED
            if (deviceId != null) {
                conditions.add(
                    cb.equal(root.get("deviceId"), deviceId)
                );
            }

            // Lọc theo trạng thái
            if (status != null
                    && !status.isBlank()
                    && !status.equalsIgnoreCase("all")) {

                conditions.add(
                    cb.equal(
                        cb.upper(root.get("status")),
                        status.toUpperCase(Locale.ROOT)
                    )
                );
            }

            // Lọc theo thời gian đến phút
            if (time != null) {

                LocalDateTime start = time
                        .withSecond(0)
                        .withNano(0);

                LocalDateTime end = start.plusMinutes(1);

                conditions.add(
                    cb.greaterThanOrEqualTo(
                        root.<LocalDateTime>get("time"),
                        start
                    )
                );

                conditions.add(
                    cb.lessThan(
                        root.<LocalDateTime>get("time"),
                        end
                    )
                );
            }

            return cb.and(
                conditions.toArray(new Predicate[0])
            );
        };

        // Phân trang và sắp xếp mới nhất trước
        Pageable pageable = PageRequest.of(
            Math.max(page, 0),
            Math.min(Math.max(size, 1), 100),
            Sort.by(
                Sort.Direction.DESC,
                "time",
                "historyId"
            )
        );

        return repo.findAll(spec, pageable);
    }
}
