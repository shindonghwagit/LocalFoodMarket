package com.localfood.localfoodmarket.domain.product.service;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.entity.FarmStatus;
import com.localfood.localfoodmarket.domain.farm.repository.FarmRepository;
import com.localfood.localfoodmarket.domain.product.dto.ProductRequestDto;
import com.localfood.localfoodmarket.domain.product.dto.ProductResponseDto;
import com.localfood.localfoodmarket.domain.product.entity.Product;
import com.localfood.localfoodmarket.domain.product.repository.ProductRepository;
import com.localfood.localfoodmarket.domain.user.entity.Role;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.UserRepository;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import com.localfood.localfoodmarket.global.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final SseEmitterManager sseEmitterManager;

    @Transactional
    public ProductResponseDto createProduct(Long userId, ProductRequestDto request) {
        Farm farm = getApprovedFarmByUserId(userId);

        Product product = Product.builder()
                .farm(farm)
                .name(request.getName())
                .price(request.getPrice())
                .stock(request.getStock())
                .category(request.getCategory())
                .harvestDate(request.getHarvestDate())
                .description(request.getDescription())
                .build();

        return ProductResponseDto.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponseDto updateProduct(Long userId, Long productId, ProductRequestDto request) {
        Product product = findProductOwnedBy(userId, productId);

        product.update(
                request.getName(),
                request.getPrice(),
                request.getStock(),
                request.getCategory(),
                request.getHarvestDate(),
                request.getDescription()
        );

        int newStock = request.getStock();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                sseEmitterManager.sendStockUpdate(productId, newStock);
            }
        });

        return ProductResponseDto.from(product);
    }

    @Transactional
    public void deleteProduct(Long userId, Long productId) {
        Product product = findProductOwnedBy(userId, productId);
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponseDto> getProducts(Long farmId, String category,
                                                String keyword, Pageable pageable) {
        return productRepository
                .findByFilter(farmId, category, keyword, pageable)
                .map(ProductResponseDto::from);
    }

    @Transactional(readOnly = true)
    public ProductResponseDto getProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        return ProductResponseDto.from(product);
    }

    // 내부 헬퍼 — FARMER + APPROVED 농가 확인
    private Farm getApprovedFarmByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));

        if (user.getRole() != Role.FARMER) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "농가만 상품을 등록할 수 있어요.");
        }

        Farm farm = farmRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        if (farm.getStatus() != FarmStatus.APPROVED) {
            throw new BusinessException(ErrorCode.FARM_NOT_APPROVED);
        }

        return farm;
    }

    // 내부 헬퍼 — 상품 조회 + 본인 농가 소유 확인
    private Product findProductOwnedBy(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        Farm farm = farmRepository.findByUser(
                userRepository.findById(userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."))
        ).orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        if (!product.getFarm().getId().equals(farm.getId())) {
            throw new BusinessException(ErrorCode.PRODUCT_FORBIDDEN);
        }

        return product;
    }
}
