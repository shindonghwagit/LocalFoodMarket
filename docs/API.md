# API 명세 — 로컬 푸드 마켓

## 기본 정보

| 항목 | 내용 |
|---|---|
| Base URL | `http://localhost:8080/api/v1` |
| 인증 방식 | JWT Bearer Token |
| 응답 형식 | JSON |

## 공통 응답 형식

```json
// 성공
{ "success": true, "data": { }, "message": "..." }
// 실패
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

## 공통 에러 코드

| 코드 | HTTP | 설명 |
|---|---|---|
| `UNAUTHORIZED` | 401 | 인증 토큰 없음/만료 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 |
| `DUPLICATE_EMAIL` | 409 | 이메일 중복 |
| `INSUFFICIENT_POINT` | 400 | 포인트 부족 |
| `OUT_OF_STOCK` | 400 | 재고 부족 |
| `FARM_NOT_APPROVED` | 403 | 미승인 농가 |
| `REVIEW_ALREADY_EXISTS` | 409 | 이미 리뷰 작성됨 |
| `ORDER_REQUIRED` | 403 | 구매 내역 없음 |
| `INVALID_ORDER_STATUS` | 400 | 현재 상태에서 불가능한 전이 |
| `ORDER_NOT_CANCELABLE` | 400 | 취소 불가 상태 |
| `ESCROW_ALREADY_SETTLED` | 409 | 이미 정산된 거래 |
| `SOCIAL_ACCOUNT_EXISTS` | 409 | 이미 연동된 소셜 계정 |
| `PASSWORD_TOO_SIMPLE` | 400 | 비밀번호 정책 불충족 |

---

## 1. 인증 `/auth`

(기존과 동일 — 회원가입, 로그인, 토큰 갱신, 로그아웃)

### POST `/auth/register` — 이메일 회원가입
### POST `/auth/register/farm` — 농가 회원가입
### POST `/auth/login` — 로그인
### POST `/auth/refresh` — 토큰 갱신
### POST `/auth/logout` — 로그아웃

비밀번호 정책: 최소 12자, 연속·반복 문자 차단, 특수문자 강제 없음 (NIST SP 800-63B)

---

## 2. 소셜 로그인 `/auth/oauth2`

### GET `/auth/oauth2/kakao` — 카카오 로그인 시작
### GET `/auth/oauth2/google` — 구글 로그인 시작
### GET `/auth/oauth2/callback` — 콜백 처리
### POST `/auth/oauth2/complete` — 최초 가입 role 설정

---

## 3. 사용자 `/users`

### GET `/users/me` — 내 정보 조회
### PATCH `/users/me` — 내 정보 수정

---

## 4. 농가 `/farms`

### GET `/farms` — 농가 목록 (페이지네이션, 카테고리/인증/평점/키워드 필터)
### GET `/farms/{farmId}` — 농가 상세
### PATCH `/farms/me` — 내 농가 정보 수정 (pickup_address 포함)

---

## 5. 상품 `/products`

### GET `/products` — 상품 목록 (필터)
### GET `/products/{productId}` — 상품 상세
### POST `/products` — 상품 등록 (FARMER, APPROVED)
### PATCH `/products/{productId}` — 수정 (FARMER 본인)
### DELETE `/products/{productId}` — 삭제 (FARMER 본인)

---

## 6. 주문 `/orders`

### POST `/orders`
주문 생성 (포인트 hold) | **권한**: CONSUMER

**Request Body**
```json
{
  "deliveryMethod": "DELIVERY",
  "deliveryAddress": "충남 아산시 배방읍 ...",
  "pickupLocation": null,
  "pickupTime": null,
  "buyerNote": "부재 시 경비실에 맡겨주세요",
  "items": [
    { "productId": 1, "quantity": 2 }
  ]
}
```
> deliveryMethod: `PICKUP` | `DELIVERY`
> PICKUP이면 pickupLocation, pickupTime 필수 / DELIVERY면 deliveryAddress 필수
> 한 주문은 한 농가 상품만 허용 (다른 농가 섞이면 VALIDATION_ERROR)

**처리 (@Transactional)**
```
1. 단일 농가 검증
2. 상품 재고 확인 (낙관적 락) → 부족 시 OUT_OF_STOCK
3. 포인트 잔액 확인 → 부족 시 INSUFFICIENT_POINT
4. products.stock 차감
5. users.point_balance 차감
6. point_logs INSERT (type: HOLD)
7. orders INSERT (status: PAID)
8. order_items INSERT
9. escrows INSERT (status: HELD)
10. SSE로 농가에 new-order 이벤트 발송
```

**Response** `201`
```json
{
  "success": true,
  "data": {
    "orderId": 10,
    "totalPrice": 11200,
    "status": "PAID",
    "deliveryMethod": "DELIVERY",
    "remainingPoint": 38800
  }
}
```

---

### GET `/orders` — 내 주문 목록 (CONSUMER)
### GET `/orders/{orderId}` — 주문 상세 (CONSUMER 본인 / 해당 FARMER)

---

### PATCH `/orders/{orderId}/status`
농가의 주문 상태 진행 | **권한**: FARMER (본인 농가 주문)

**Request Body**
```json
{
  "status": "SHIPPING",
  "courier": "CJ대한통운",
  "trackingNumber": "123456789"
}
```
> 허용 전이 (FARMER):
> PAID → PREPARING → SHIPPING → DELIVERED  (배송)
> PAID → READY  (픽업)
> SHIPPING으로 갈 때 courier, trackingNumber 권장

**Response** `200`

---

### PATCH `/orders/{orderId}/confirm`
구매자 수령 확인 → 정산 트리거 | **권한**: CONSUMER (본인 주문)

**처리 (@Transactional)**
```
1. status가 DELIVERED(배송) 또는 READY(픽업)인지 확인
   → 아니면 INVALID_ORDER_STATUS
2. orders.status = CONFIRMED, confirmed_at = now
3. escrows.status = RELEASED, released_at = now
4. 농가 users.point_balance += escrow.amount
5. point_logs INSERT (type: RELEASE, 농가 기준)
6. orders.status = SETTLED, settled_at = now
```

**Response** `200`
```json
{
  "success": true,
  "data": { "orderId": 10, "status": "SETTLED" },
  "message": "수령이 확인됐어요. 거래가 완료됐습니다."
}
```

---

### PATCH `/orders/{orderId}/cancel`
주문 취소 → 환불 | **권한**: CONSUMER (본인) 또는 FARMER (본인 농가)

**처리 (@Transactional)**
```
1. 취소 가능 상태 확인
   - CONSUMER: PAID 단계만 단독 취소 가능
   - FARMER: PAID ~ PREPARING/READY 단계 취소 가능
   - 그 외: ORDER_NOT_CANCELABLE
2. products.stock 복원
3. orders.status = CANCELED, canceled_at = now
4. escrows.status = REFUNDED, refunded_at = now
5. 구매자 users.point_balance += escrow.amount
6. point_logs INSERT (type: REFUND)
```

**Response** `200`
```json
{
  "success": true,
  "data": { "orderId": 10, "status": "CANCELED" },
  "message": "주문이 취소됐어요. 포인트가 환불됐습니다."
}
```

---

### (스케줄러) 자동 수령확인
엔드포인트 아님 — Spring `@Scheduled` 매일 0시 실행
```
DELIVERED 상태 + delivered_at + 7일 < now
→ 자동 CONFIRMED → SETTLED → escrow RELEASE
```

---

## 7. 리뷰 `/reviews`

### POST `/reviews` — 리뷰 작성 (CONSUMER, 주문이 CONFIRMED/SETTLED일 때만)
### GET `/reviews/products/{productId}` — 상품 리뷰 목록
### DELETE `/reviews/{reviewId}` — 삭제 (본인)

---

## 8. 커뮤니티 `/posts`

### GET `/posts` — 목록 (필터)
### GET `/posts/{postId}` — 상세
### POST `/posts` — 작성 (CONSUMER, multipart)
### PATCH `/posts/{postId}` — 수정 (본인)
### DELETE `/posts/{postId}` — 삭제 (본인/ADMIN)
### POST `/posts/{postId}/like` — 좋아요 토글

## 9. 댓글 `/comments`
### GET `/comments/posts/{postId}` — 목록
### POST `/comments/posts/{postId}` — 작성 (CONSUMER)
### DELETE `/comments/{commentId}` — 삭제 (본인/ADMIN)

---

## 10. 포인트 `/points`

### GET `/points/balance` — 잔액 조회 (CONSUMER)
### GET `/points/logs` — 이력 조회 (CHARGE/HOLD/RELEASE/REFUND 필터)
### POST `/points/charge` — 충전 (ADMIN)

---

## 11. 관리자 `/admin`

### GET `/admin/farms` — 전체 농가 (status 필터)
### PATCH `/admin/farms/{farmId}/status` — 승인/반려
### GET `/admin/users` — 사용자 목록
### PATCH `/admin/users/{userId}/role` — 권한 변경
### DELETE `/admin/posts/{postId}` — 게시글 블라인드
### GET `/admin/stats` — 통계

---

## 12. 실시간 SSE `/sse`

### GET `/sse/farm` — 농가 주문 알림 (FARMER)
```
event: new-order
data: {"orderId":10,"productName":"유기농 배추","quantity":2,"totalPrice":7000,"deliveryMethod":"DELIVERY"}
```

### GET `/sse/products/{productId}/stock` — 재고 실시간 (전체)
```
event: stock-update
data: {"productId":1,"stock":26}
```

---

## 13. 주소 검색 `/address`
### GET `/address/search?query={주소}` — 카카오 주소 검색 (전체)

## 14. 파일 `/files`
### POST `/files/upload` — 이미지 업로드 (CONSUMER/FARMER, multipart)

---

## 권한 매트릭스 (주문 관련 추가분)

| 엔드포인트 | CONSUMER | FARMER | ADMIN |
|---|:---:|:---:|:---:|
| 주문 생성 | ✅ | — | — |
| 주문 상태 진행 (status) | — | ✅ | — |
| 수령 확인 (confirm) | ✅ | — | — |
| 주문 취소 (cancel) | ✅(PAID) | ✅(준비전) | — |
