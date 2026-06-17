package com.localfood.localfoodmarket.domain.user.repository;

import com.localfood.localfoodmarket.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    Page<User> findByEmailContainingIgnoreCase(String keyword, Pageable pageable);
}
