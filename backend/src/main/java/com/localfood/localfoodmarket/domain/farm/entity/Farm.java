package com.localfood.localfoodmarket.domain.farm.entity;

import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "farms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Farm extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String region;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 100)
    private String certification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FarmStatus status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder
    private Farm(User user, String name, String region, String category,
                 String certification, String description) {
        this.user = user;
        this.name = name;
        this.region = region;
        this.category = category;
        this.certification = certification;
        this.description = description;
        this.status = FarmStatus.PENDING;
    }

    public void update(String name, String region, String category,
                       String certification, String description) {
        this.name = name;
        this.region = region;
        this.category = category;
        this.certification = certification;
        this.description = description;
    }

    public void approve() {
        this.status = FarmStatus.APPROVED;
    }

    public void reject() {
        this.status = FarmStatus.REJECTED;
    }
}
