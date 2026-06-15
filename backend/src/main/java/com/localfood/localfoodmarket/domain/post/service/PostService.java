package com.localfood.localfoodmarket.domain.post.service;

import com.localfood.localfoodmarket.domain.post.dto.CommentRequestDto;
import com.localfood.localfoodmarket.domain.post.dto.CommentResponseDto;
import com.localfood.localfoodmarket.domain.post.dto.PostLikeToggleResponseDto;
import com.localfood.localfoodmarket.domain.post.dto.PostRequestDto;
import com.localfood.localfoodmarket.domain.post.dto.PostResponseDto;
import com.localfood.localfoodmarket.domain.post.entity.Comment;
import com.localfood.localfoodmarket.domain.post.entity.Post;
import com.localfood.localfoodmarket.domain.post.entity.PostImage;
import com.localfood.localfoodmarket.domain.post.entity.PostLike;
import com.localfood.localfoodmarket.domain.post.entity.PostProduct;
import com.localfood.localfoodmarket.domain.post.repository.CommentRepository;
import com.localfood.localfoodmarket.domain.post.repository.PostLikeRepository;
import com.localfood.localfoodmarket.domain.post.repository.PostRepository;
import com.localfood.localfoodmarket.domain.product.entity.Product;
import com.localfood.localfoodmarket.domain.product.repository.ProductRepository;
import com.localfood.localfoodmarket.domain.user.entity.Role;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.UserRepository;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public PostResponseDto createPost(Long userId, PostRequestDto request) {
        User user = findUser(userId);

        if (user.getRole() != Role.CONSUMER) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "소비자만 게시글을 작성할 수 있어요.");
        }

        Post post = postRepository.save(Post.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .build());

        attachImages(post, request.getImageUrls());
        attachProducts(post, request.getProductIds());

        return PostResponseDto.from(post);
    }

    @Transactional(readOnly = true)
    public Page<PostResponseDto> getPosts(String category, String keyword, String sort, Pageable pageable) {
        Page<Post> posts;

        if ("comments".equals(sort)) {
            Pageable plain = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
            posts = postRepository.findByFilterOrderByCommentCount(category, keyword, plain);
        } else if ("popular".equals(sort)) {
            Pageable byLikes = PageRequest.of(
                    pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "likes"));
            posts = postRepository.findByFilter(category, keyword, byLikes);
        } else {
            // latest (default)
            Pageable byLatest = PageRequest.of(
                    pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt"));
            posts = postRepository.findByFilter(category, keyword, byLatest);
        }

        return posts.map(PostResponseDto::from);
    }

    @Transactional
    public PostResponseDto getPost(Long postId) {
        Post post = findPost(postId);
        post.incrementViewCount();
        return PostResponseDto.from(post);
    }

    @Transactional
    public PostResponseDto updatePost(Long userId, Long postId, PostRequestDto request) {
        User user = findUser(userId);
        Post post = findPost(postId);

        if (!post.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.POST_FORBIDDEN);
        }

        post.update(request.getTitle(), request.getContent(), request.getCategory());
        post.clearImages();
        post.clearTaggedProducts();
        attachImages(post, request.getImageUrls());
        attachProducts(post, request.getProductIds());

        return PostResponseDto.from(post);
    }

    @Transactional
    public void deletePost(Long userId, Long postId) {
        User user = findUser(userId);
        Post post = findPost(postId);

        boolean isOwner = post.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new BusinessException(ErrorCode.POST_FORBIDDEN);
        }

        postRepository.delete(post);
    }

    @Transactional
    public PostLikeToggleResponseDto toggleLike(Long userId, Long postId) {
        User user = findUser(userId);
        Post post = findPost(postId);

        boolean nowLiked;
        var existing = postLikeRepository.findByUserAndPost(user, post);
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            post.decrementLikes();
            nowLiked = false;
        } else {
            postLikeRepository.save(PostLike.builder().user(user).post(post).build());
            post.incrementLikes();
            nowLiked = true;
        }

        return PostLikeToggleResponseDto.builder()
                .liked(nowLiked)
                .likes(post.getLikes())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDto> getComments(Long postId) {
        Post post = findPost(postId);
        return commentRepository.findByPost(post).stream()
                .map(CommentResponseDto::from)
                .toList();
    }

    @Transactional
    public CommentResponseDto createComment(Long userId, Long postId, CommentRequestDto request) {
        User user = findUser(userId);

        if (user.getRole() != Role.CONSUMER) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "소비자만 댓글을 작성할 수 있어요.");
        }

        Post post = findPost(postId);

        Comment comment = commentRepository.save(Comment.builder()
                .post(post)
                .user(user)
                .content(request.getContent())
                .build());

        return CommentResponseDto.from(comment);
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        User user = findUser(userId);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        boolean isOwner = comment.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new BusinessException(ErrorCode.COMMENT_FORBIDDEN);
        }

        commentRepository.delete(comment);
    }

    // ── 헬퍼 ──────────────────────────────────────────────────────────────

    private void attachImages(Post post, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return;
        for (int i = 0; i < imageUrls.size(); i++) {
            post.addImage(PostImage.builder()
                    .post(post)
                    .imageUrl(imageUrls.get(i))
                    .orderIndex(i)
                    .build());
        }
    }

    private void attachProducts(Post post, List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) return;
        for (Long productId : productIds) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
            post.addTaggedProduct(PostProduct.builder()
                    .post(post)
                    .product(product)
                    .build());
        }
    }

    private Post findPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
    }
}
