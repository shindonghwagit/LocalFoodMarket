package com.localfood.localfoodmarket.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;
    private final ErrorBody error;

    @Getter
    public static class ErrorBody {
        private final String code;
        private final String message;

        private ErrorBody(String code, String message) {
            this.code = code;
            this.message = message;
        }
    }

    private ApiResponse(T data, String message) {
        this.success = true;
        this.data = data;
        this.message = message;
        this.error = null;
    }

    private ApiResponse(String code, String message) {
        this.success = false;
        this.data = null;
        this.message = null;
        this.error = new ErrorBody(code, message);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data, "요청이 성공했습니다");
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(data, message);
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(code, message);
    }
}
