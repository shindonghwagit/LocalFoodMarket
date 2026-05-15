package com.localfood.localfoodmarket.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.util.List;

@Getter
public class PostRequestDto {

    @NotBlank(message = "제목을 입력해주세요.")
    @Size(max = 200, message = "제목은 200자 이하로 입력해주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

    @Size(max = 50, message = "카테고리는 50자 이하로 입력해주세요.")
    private String category;

    private List<String> imageUrls;

    private List<Long> productIds;
}
