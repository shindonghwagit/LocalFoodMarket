package com.localfood.localfoodmarket.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 인증·인가
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요한 서비스예요. 로그인 후 이용해주세요."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없어요."),

    // 리소스
    NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 정보를 찾을 수 없어요."),

    // 입력값
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "입력값을 다시 확인해주세요."),
    PASSWORD_TOO_SIMPLE(HttpStatus.BAD_REQUEST, "비밀번호가 너무 단순해요. 8자 이상으로 설정해주세요."),

    // 회원·소셜
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일이에요."),
    SOCIAL_ACCOUNT_EXISTS(HttpStatus.CONFLICT, "이미 연동된 소셜 계정이에요."),

    // 포인트·재고
    INSUFFICIENT_POINT(HttpStatus.BAD_REQUEST, "포인트가 부족해요. 포인트를 충전 후 이용해주세요."),
    OUT_OF_STOCK(HttpStatus.BAD_REQUEST, "상품 재고가 부족해요. 수량을 줄여주세요."),

    // 농가
    FARM_NOT_FOUND(HttpStatus.NOT_FOUND, "농가 정보를 찾을 수 없어요."),
    FARM_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 등록된 농가가 있어요."),
    FARM_NOT_APPROVED(HttpStatus.FORBIDDEN, "아직 승인되지 않은 농가예요. 관리자 승인 후 이용해주세요."),

    // 상품
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "상품을 찾을 수 없어요."),
    PRODUCT_FORBIDDEN(HttpStatus.FORBIDDEN, "본인 농가의 상품만 수정·삭제할 수 있어요."),

    // 주문
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "주문 정보를 찾을 수 없어요."),
    ORDER_FORBIDDEN(HttpStatus.FORBIDDEN, "본인의 주문만 조회할 수 있어요."),
    ORDER_STATUS_FORBIDDEN(HttpStatus.FORBIDDEN, "해당 주문의 상태를 변경할 권한이 없어요."),
    INVALID_ORDER_STATUS(HttpStatus.BAD_REQUEST, "현재 주문 상태에서는 처리할 수 없어요."),
    ORDER_NOT_CANCELABLE(HttpStatus.BAD_REQUEST, "지금은 주문을 취소할 수 없는 상태예요."),
    ORDER_CONFLICT(HttpStatus.CONFLICT, "주문이 동시에 몰려 처리하지 못했어요. 잠시 후 다시 시도해주세요."),

    // 결제(충전)
    PAYMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "결제 정보를 찾을 수 없어요."),
    PAYMENT_AMOUNT_MISMATCH(HttpStatus.BAD_REQUEST, "결제 금액이 일치하지 않아요. 다시 시도해주세요."),
    PAYMENT_ALREADY_DONE(HttpStatus.CONFLICT, "이미 처리된 결제예요."),
    PAYMENT_CONFIRM_FAILED(HttpStatus.BAD_REQUEST, "결제 승인에 실패했어요. 잠시 후 다시 시도해주세요."),

    // 리뷰
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없어요."),
    REVIEW_FORBIDDEN(HttpStatus.FORBIDDEN, "본인의 리뷰만 삭제할 수 있어요."),
    REVIEW_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 리뷰를 작성하셨어요."),
    ORDER_REQUIRED(HttpStatus.FORBIDDEN, "구매한 상품에만 리뷰를 작성할 수 있어요."),
    ORDER_NOT_DONE(HttpStatus.BAD_REQUEST, "배송이 완료된 주문에만 리뷰를 작성할 수 있어요."),

    // 게시글·댓글
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없어요."),
    POST_FORBIDDEN(HttpStatus.FORBIDDEN, "본인의 게시글만 수정·삭제할 수 있어요."),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없어요."),
    COMMENT_FORBIDDEN(HttpStatus.FORBIDDEN, "본인의 댓글만 삭제할 수 있어요."),

    // 파일 업로드
    INVALID_FILE_EXTENSION(HttpStatus.BAD_REQUEST, "jpg, jpeg, png 파일만 업로드할 수 있어요."),
    FILE_TOO_LARGE(HttpStatus.BAD_REQUEST, "파일 크기는 10MB 이하여야 해요."),
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장 중 오류가 발생했어요. 잠시 후 다시 시도해주세요."),

    // 외부 API
    KAKAO_API_ERROR(HttpStatus.SERVICE_UNAVAILABLE, "주소 검색 서비스에 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요."),

    // 서버
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.");

    private final HttpStatus status;
    private final String message;
}
