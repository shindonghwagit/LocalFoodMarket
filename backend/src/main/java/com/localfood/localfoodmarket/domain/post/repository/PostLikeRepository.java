package com.localfood.localfoodmarket.domain.post.repository;

import com.localfood.localfoodmarket.domain.post.entity.Post;
import com.localfood.localfoodmarket.domain.post.entity.PostLike;
import com.localfood.localfoodmarket.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByUserAndPost(User user, Post post);

    boolean existsByUserAndPost(User user, Post post);
}
