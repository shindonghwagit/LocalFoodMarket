package com.localfood.localfoodmarket.domain.post.controller;

import com.localfood.localfoodmarket.domain.post.dto.CommentRequestDto;
import com.localfood.localfoodmarket.domain.post.dto.CommentResponseDto;
import com.localfood.localfoodmarket.domain.post.dto.PostRequestDto;
import com.localfood.localfoodmarket.domain.post.dto.PostResponseDto;
import com.localfood.localfoodmarket.domain.post.service.PostService;
import com.localfood.localfoodmarket.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // ── 게시글 ──────────────────────────────────────────────────────────────

    @GetMapping("/posts")
    public ApiResponse<Page<PostResponseDto>> getPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "latest") String sort,
            @PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.success(postService.getPosts(category, keyword, sort, pageable));
    }

    @GetMapping("/posts/{postId}")
    public ApiResponse<PostResponseDto> getPost(@PathVariable Long postId) {
        return ApiResponse.success(postService.getPost(postId));
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostResponseDto> createPost(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid PostRequestDto request) {
        return ApiResponse.success(postService.createPost(userId, request), "게시글이 등록됐어요.");
    }

    @PatchMapping("/posts/{postId}")
    public ApiResponse<PostResponseDto> updatePost(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long postId,
            @RequestBody @Valid PostRequestDto request) {
        return ApiResponse.success(postService.updatePost(userId, postId, request), "게시글이 수정됐어요.");
    }

    @DeleteMapping("/posts/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long postId) {
        postService.deletePost(userId, postId);
    }

    @PostMapping("/posts/{postId}/like")
    public ApiResponse<PostResponseDto> toggleLike(@PathVariable Long postId) {
        return ApiResponse.success(postService.toggleLike(postId), "좋아요가 반영됐어요.");
    }

    // ── 댓글 ──────────────────────────────────────────────────────────────

    @GetMapping("/comments/posts/{postId}")
    public ApiResponse<List<CommentResponseDto>> getComments(@PathVariable Long postId) {
        return ApiResponse.success(postService.getComments(postId));
    }

    @PostMapping("/comments/posts/{postId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CommentResponseDto> createComment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long postId,
            @RequestBody @Valid CommentRequestDto request) {
        return ApiResponse.success(postService.createComment(userId, postId, request), "댓글이 등록됐어요.");
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long commentId) {
        postService.deleteComment(userId, commentId);
    }
}
