package com.localfood.localfoodmarket.global.controller;

import com.localfood.localfoodmarket.global.response.ApiResponse;
import com.localfood.localfoodmarket.global.service.FileStorageService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file
    ) {
        String fileUrl = fileStorageService.storeFile(file);
        return ResponseEntity.ok(ApiResponse.success(new FileUploadResponse(fileUrl), "파일이 업로드됐어요."));
    }

    @Getter
    @AllArgsConstructor
    public static class FileUploadResponse {
        private String fileUrl;
    }
}
