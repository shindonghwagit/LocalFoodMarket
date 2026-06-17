package com.localfood.localfoodmarket.domain.post.repository;

import com.localfood.localfoodmarket.domain.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface PostRepository extends JpaRepository<Post, Long> {

    long countByCreatedAtAfter(LocalDateTime dateTime);

    long countByReportCountGreaterThan(int threshold);

    // 관리자용 — blinded 포함 전체 조회, 신고 많은 순 → 최신 순
    @Query("SELECT p FROM Post p ORDER BY p.reportCount DESC, p.createdAt DESC")
    Page<Post> findAllForAdmin(Pageable pageable);

    // 카테고리·키워드 필터 — Pageable로 정렬(latest·popular) 제어
    @Query("SELECT p FROM Post p WHERE p.blinded = false" +
           " AND (:category IS NULL OR p.category = :category)" +
           " AND (:keyword IS NULL OR p.title LIKE %:keyword%)")
    Page<Post> findByFilter(@Param("category") String category,
                            @Param("keyword") String keyword,
                            Pageable pageable);

    // 작성자별 조회 — 마이페이지 "내 게시글"
    @Query("SELECT p FROM Post p WHERE p.blinded = false AND p.user.id = :userId")
    Page<Post> findByUserId(@Param("userId") Long userId, Pageable pageable);

    // 댓글 많은 순 — 서브쿼리 ORDER BY (PostgreSQL native)
    @Query(value = "SELECT * FROM posts" +
                   " WHERE blinded = false" +
                   " AND (CAST(:category AS VARCHAR) IS NULL OR category = :category)" +
                   " AND (CAST(:keyword AS VARCHAR) IS NULL OR title LIKE CONCAT('%',:keyword,'%'))" +
                   " ORDER BY (SELECT COUNT(*) FROM comments WHERE post_id = id) DESC",
           countQuery = "SELECT COUNT(*) FROM posts" +
                        " WHERE blinded = false" +
                        " AND (CAST(:category AS VARCHAR) IS NULL OR category = :category)" +
                        " AND (CAST(:keyword AS VARCHAR) IS NULL OR title LIKE CONCAT('%',:keyword,'%'))",
           nativeQuery = true)
    Page<Post> findByFilterOrderByCommentCount(@Param("category") String category,
                                               @Param("keyword") String keyword,
                                               Pageable pageable);
}
