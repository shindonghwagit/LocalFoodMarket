package com.localfood.localfoodmarket.global.service;

import com.localfood.localfoodmarket.global.config.FileUploadConfig;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");

    private final Path uploadPath;
    private final long maxSize;

    public FileStorageService(FileUploadConfig config) {
        this.uploadPath = Paths.get(config.getUploadDir()).toAbsolutePath().normalize();
        this.maxSize = config.getMaxSize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new IllegalStateException("업로드 폴더를 생성할 수 없어요.", e);
        }
    }

    public String storeFile(MultipartFile file) {
        validateExtension(file.getOriginalFilename());
        validateSize(file.getSize());

        String extension = extractExtension(file.getOriginalFilename());
        String storedFilename = UUID.randomUUID() + "." + extension;
        Path targetPath = uploadPath.resolve(storedFilename);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("파일 저장 실패: {}", storedFilename, e);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        return "/uploads/" + storedFilename;
    }

    public void deleteFile(String fileUrl) {
        if (!StringUtils.hasText(fileUrl)) return;
        String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        Path filePath = uploadPath.resolve(filename).normalize();

        // 업로드 폴더 밖 경로 접근 차단
        if (!filePath.startsWith(uploadPath)) return;

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("파일 삭제 실패: {}", filename, e);
        }
    }

    private void validateExtension(String originalFilename) {
        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BusinessException(ErrorCode.INVALID_FILE_EXTENSION);
        }
    }

    private void validateSize(long fileSize) {
        if (fileSize > maxSize) {
            throw new BusinessException(ErrorCode.FILE_TOO_LARGE);
        }
    }

    private String extractExtension(String filename) {
        if (!StringUtils.hasText(filename) || !filename.contains(".")) {
            throw new BusinessException(ErrorCode.INVALID_FILE_EXTENSION);
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
