package com.localfood.localfoodmarket.domain.point.repository;

import com.localfood.localfoodmarket.domain.point.entity.PointLog;
import com.localfood.localfoodmarket.domain.point.entity.PointType;
import com.localfood.localfoodmarket.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointLogRepository extends JpaRepository<PointLog, Long> {

    Page<PointLog> findByUser(User user, Pageable pageable);

    Page<PointLog> findByUserAndType(User user, PointType type, Pageable pageable);
}
