package com.localfood.localfoodmarket.domain.product.entity;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private Integer stock;

    @Column(length = 50)
    private String category;

    @Column(name = "harvest_date")
    private LocalDate harvestDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Version
    private Long version;

    @Builder
    private Product(Farm farm, String name, Integer price, Integer stock,
                    String category, LocalDate harvestDate, String description) {
        this.farm = farm;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.category = category;
        this.harvestDate = harvestDate;
        this.description = description;
    }

    public void update(String name, Integer price, Integer stock,
                       String category, LocalDate harvestDate, String description) {
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.category = category;
        this.harvestDate = harvestDate;
        this.description = description;
    }

    public void deductStock(int quantity) {
        if (this.stock < quantity) {
            throw new IllegalStateException("재고 부족");
        }
        this.stock -= quantity;
    }
}
