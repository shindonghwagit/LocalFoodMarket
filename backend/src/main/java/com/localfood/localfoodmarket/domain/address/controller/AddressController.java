package com.localfood.localfoodmarket.domain.address.controller;

import com.localfood.localfoodmarket.domain.address.dto.AddressDto;
import com.localfood.localfoodmarket.global.client.KakaoAddressClient;
import com.localfood.localfoodmarket.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/address")
@RequiredArgsConstructor
public class AddressController {

    private final KakaoAddressClient kakaoAddressClient;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AddressDto>>> searchAddress(
            @RequestParam String query
    ) {
        List<AddressDto> results = kakaoAddressClient.searchAddress(query).stream()
                .map(doc -> new AddressDto(doc.getAddressName(), doc.getX(), doc.getY()))
                .toList();

        return ResponseEntity.ok(ApiResponse.success(results, "주소 검색 결과예요."));
    }
}
