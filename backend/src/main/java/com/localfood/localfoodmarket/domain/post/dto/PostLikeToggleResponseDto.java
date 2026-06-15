package com.localfood.localfoodmarket.domain.post.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostLikeToggleResponseDto {

    private final boolean liked;
    private final Integer likes;
}
