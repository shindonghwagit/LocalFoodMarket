package com.localfood.localfoodmarket.domain.post.entity;

import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 50)
    private String category;

    @Column(nullable = false)
    private Integer likes = 0;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(nullable = false)
    private boolean blinded = false;

    @Column(name = "report_count", nullable = false, columnDefinition = "integer default 0")
    private Integer reportCount = 0;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<PostImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostProduct> taggedProducts = new ArrayList<>();

    @Builder
    private Post(User user, String title, String content, String category) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.category = category;
        this.likes = 0;
        this.viewCount = 0;
        this.blinded = false;
        this.reportCount = 0;
    }

    public void update(String title, String content, String category) {
        this.title = title;
        this.content = content;
        this.category = category;
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void incrementLikes() {
        this.likes++;
    }

    public void decrementLikes() {
        if (this.likes > 0) this.likes--;
    }

    public void addImage(PostImage image) {
        images.add(image);
    }

    public void clearImages() {
        images.clear();
    }

    public void addTaggedProduct(PostProduct postProduct) {
        taggedProducts.add(postProduct);
    }

    public void clearTaggedProducts() {
        taggedProducts.clear();
    }

    public void blind() {
        this.blinded = true;
    }

    public void unblind() {
        this.blinded = false;
    }

    public void incrementReportCount() {
        this.reportCount++;
    }
}
