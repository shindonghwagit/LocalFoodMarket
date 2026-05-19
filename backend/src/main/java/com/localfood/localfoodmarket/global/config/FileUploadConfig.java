package com.localfood.localfoodmarket.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "file")
public class FileUploadConfig {

    private String uploadDir;
    private long maxSize;

    @Bean
    public StandardServletMultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }
}
