package com.localfood.localfoodmarket.domain.product.repository;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);

    List<Product> findByFarm(Farm farm);

    Page<Product> findByFarmId(Long farmId, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN FETCH p.farm f" +
           " WHERE (:farmId IS NULL OR f.id = :farmId)" +
           " AND (:category IS NULL OR p.category = :category)" +
           " AND (:keyword IS NULL OR p.name LIKE %:keyword%)")
    Page<Product> findByFilter(@Param("farmId") Long farmId,
                               @Param("category") String category,
                               @Param("keyword") String keyword,
                               Pageable pageable);
}
