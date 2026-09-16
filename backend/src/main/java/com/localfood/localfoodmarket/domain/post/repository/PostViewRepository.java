package com.localfood.localfoodmarket.domain.post.repository;

import com.localfood.localfoodmarket.domain.post.entity.Post;
import com.localfood.localfoodmarket.domain.post.entity.PostView;
import com.localfood.localfoodmarket.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostViewRepository extends JpaRepository<PostView, Long> {

    boolean existsByPostAndUser(Post post, User user);
}
