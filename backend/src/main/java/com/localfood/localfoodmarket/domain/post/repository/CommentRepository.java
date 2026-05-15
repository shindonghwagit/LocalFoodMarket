package com.localfood.localfoodmarket.domain.post.repository;

import com.localfood.localfoodmarket.domain.post.entity.Comment;
import com.localfood.localfoodmarket.domain.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c JOIN FETCH c.user WHERE c.post = :post ORDER BY c.createdAt ASC")
    List<Comment> findByPost(@Param("post") Post post);
}
