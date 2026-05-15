package com.localfood.localfoodmarket.domain.product.controller;

import com.localfood.localfoodmarket.domain.product.dto.ProductRequestDto;
import com.localfood.localfoodmarket.domain.product.dto.ProductResponseDto;
import com.localfood.localfoodmarket.domain.product.service.ProductService;
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

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProductResponseDto> create(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid ProductRequestDto request) {
        return ApiResponse.success(productService.createProduct(userId, request), "상품이 등록됐어요.");
    }

    @PatchMapping("/{productId}")
    public ApiResponse<ProductResponseDto> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long productId,
            @RequestBody @Valid ProductRequestDto request) {
        return ApiResponse.success(productService.updateProduct(userId, productId, request), "상품 정보가 수정됐어요.");
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long productId) {
        productService.deleteProduct(userId, productId);
    }

    @GetMapping
    public ApiResponse<Page<ProductResponseDto>> getProducts(
            @RequestParam(required = false) Long farmId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(productService.getProducts(farmId, category, keyword, pageable));
    }

    @GetMapping("/{productId}")
    public ApiResponse<ProductResponseDto> getProduct(@PathVariable Long productId) {
        return ApiResponse.success(productService.getProduct(productId));
    }
}
