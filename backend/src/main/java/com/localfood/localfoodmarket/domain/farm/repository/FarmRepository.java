package com.localfood.localfoodmarket.domain.farm.repository;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.entity.FarmStatus;
import com.localfood.localfoodmarket.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FarmRepository extends JpaRepository<Farm, Long> {

    Optional<Farm> findByUser(User user);

    List<Farm> findByStatus(FarmStatus status);

    Page<Farm> findByStatus(FarmStatus status, Pageable pageable);

    long countByStatus(FarmStatus status);

    boolean existsByUser(User user);

    @Query("SELECT f FROM Farm f WHERE f.status = :status" +
           " AND (:category IS NULL OR f.category LIKE %:category%)" +
           " AND (:certification IS NULL OR f.certification LIKE %:certification%)" +
           " AND (:keyword IS NULL OR f.name LIKE %:keyword% OR f.region LIKE %:keyword%)")
    Page<Farm> findByFilter(@Param("status") FarmStatus status,
                            @Param("category") String category,
                            @Param("certification") String certification,
                            @Param("keyword") String keyword,
                            Pageable pageable);
}
