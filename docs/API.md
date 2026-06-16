# API 명세 — 로컬 푸드 마켓

## 기본 정보

| 항목 | 내용 |
|---|---|
| Base URL | `http://localhost:8080/api/v1` |
| 인증 방식 | JWT Bearer Token |
| 응답 형식 | JSON |
| 날짜 형식 | ISO 8601 (`2025-05-11T09:00:00Z`) |

## 공통 응답 형식

### 성공
```json
{
  "success": true,
  "data": { },
  "message": "요청이 성공했습니다"
}
```

### 실패
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "상품을 찾을 수 없습니다"
  }
}
```

## 공통 에러 코드

| 코드 | HTTP | 설명 |
|---|---|---|
| `UNAUTHORIZED` | 401 | 인증 토큰 없음 또는 만료 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 |
| `DUPLICATE_EMAIL` | 409 | 이미 사용 중인 이메일 |
| `INSUFFICIENT_POINT` | 400 | 포인트 부족 |
| `OUT_OF_STOCK` | 400 | 재고 부족 |
| `FARM_NOT_APPROVED` | 403 | 미승인 농가 |
| `REVIEW_ALREADY_EXISTS` | 409 | 이미 리뷰 작성됨 |
| `ORDER_REQUIRED` | 403 | 구매 내역 없음 (리뷰 불가) |
| `SOCIAL_ACCOUNT_EXISTS` | 409 | 이미 연동된 소셜 계정 |
| `PASSWORD_TOO_SIMPLE` | 400 | 비밀번호 정책 불충족 |

---

## 1. 인증 `/auth`

### 비밀번호 정책 (NIST SP 800-63B)
| 규칙 | 내용 |
|---|---|
| 최소 길이 | 8자 이상 |
| 최대 길이 | 제한 없음 (서버 내부 64자 처리) |
| 연속·반복 문자 | 차단 (예: 123456, aaaaaa) |
| 특수문자 | 강제 없음 (권장만) |
| 주기적 변경 강제 | 없음 |

### POST `/auth/register`
이메일 회원가입 | **권한**: 없음

```json
{
  "email": "user@example.com",
  "password": "mypassword12",
  "role": "CONSUMER"
}
```
> role: CONSUMER | FARMER

**Response** `201`

### POST `/auth/register/farm`
농가 회원가입 | **권한**: 없음

```json
{
  "email": "farm@example.com",
  "password": "mypassword12",
  "farmName": "청솔농장",
  "region": "충남 아산",
  "category": "채소",
  "certification": "무농약",
  "description": "무농약 채소 전문 농가입니다"
}
```

**Response** `201` → farm.status: PENDING (관리자 승인 대기)

### POST `/auth/login`
이메일 로그인 | **권한**: 없음

```json
{ "email": "user@example.com", "password": "mypassword12" }
```

**Response** `200`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": { "id": 1, "email": "user@example.com", "role": "CONSUMER" }
  }
}
```

### POST `/auth/refresh` — 액세스 토큰 갱신
### POST `/auth/logout` — 로그아웃 (Refresh Token 무효화) | **권한**: 로그인 필요

---

## 2. 소셜 로그인 `/auth/oauth2`

Spring Security OAuth2 Client 방식. 프론트에서 URL로 리다이렉트하면 백엔드가 처리.

### GET `/auth/oauth2/kakao` — 카카오 로그인 시작
### GET `/auth/oauth2/google` — 구글 로그인 시작

**Flow**
```
1. 프론트 → GET /auth/oauth2/{provider}
2. 백엔드 → 소셜 인증 페이지로 리다이렉트
3. 소셜 → 인증 완료 후 콜백 URL로 리다이렉트
4. 백엔드 콜백 처리 → JWT 발급 → 프론트로 전달
```

### GET `/auth/oauth2/callback`
소셜 로그인 콜백 처리

**신규 가입 (role 미설정)**
```json
{
  "success": true,
  "data": {
    "isNewUser": true,
    "tempToken": "eyJhbGci...",
    "provider": "kakao",
    "email": "user@kakao.com"
  }
}
```
> isNewUser: true이면 프론트에서 role 선택 화면 표시

**기존 사용자**
```json
{
  "success": true,
  "data": {
    "isNewUser": false,
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": { "id": 1, "email": "user@kakao.com", "role": "CONSUMER" }
  }
}
```

### POST `/auth/oauth2/complete`
소셜 최초 가입 role 설정 완료 | **권한**: 없음 (tempToken 사용)

```json
{
  "tempToken": "eyJhbGci...",
  "role": "CONSUMER"
}
```

**Response** `201` → accessToken, refreshToken 발급

---

## 3. 사용자 `/users`

### GET `/users/me` — 내 정보 조회 | **권한**: 로그인 필요

**Response** `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "CONSUMER",
    "pointBalance": 12500,
    "connectedProviders": ["kakao"],
    "createdAt": "2025-04-30T10:00:00Z"
  }
}
```

### PATCH `/users/me` — 내 정보 수정 | **권한**: 로그인 필요

---

## 4. 농가 `/farms`

### GET `/farms` — 농가 목록 조회 | **권한**: 없음

**Query Parameters**
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | int | 페이지 번호 (default: 0) |
| `size` | int | 페이지 크기 (default: 12) |
| `sort` | string | rating \| latest \| reviews |
| `category` | string | 채소 \| 과일 \| 곡류 \| 축산 |
| `certification` | string | 무농약 \| 유기농 \| GAP인증 \| 친환경 |
| `minRating` | float | 최소 평점 |
| `keyword` | string | 농가명·지역 검색 |

### GET `/farms/{farmId}` — 농가 상세 | **권한**: 없음
### PATCH `/farms/me` — 내 농가 정보 수정 | **권한**: FARMER

---

## 5. 상품 `/products`

### GET `/products` — 상품 목록 | **권한**: 없음

**Query Parameters**
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | int | 페이지 번호 |
| `size` | int | 페이지 크기 |
| `sort` | string | latest \| harvest \| price_asc \| price_desc |
| `category` | string | 카테고리 필터 |
| `keyword` | string | 상품명 검색 |
| `farmId` | long | 특정 농가 상품 |

### GET `/products/{productId}` — 상품 상세 | **권한**: 없음
### POST `/products` — 상품 등록 | **권한**: FARMER (승인된 농가만)
### PATCH `/products/{productId}` — 상품 수정 | **권한**: FARMER (본인)
### DELETE `/products/{productId}` — 상품 삭제 | **권한**: FARMER (본인)

---

## 6. 주문 `/orders`

### POST `/orders`
주문 생성 (포인트 결제) | **권한**: CONSUMER

```json
{
  "deliveryAddress": "충남 아산시 배방읍 ...",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

**Response** `201`
```json
{
  "success": true,
  "data": {
    "orderId": 10,
    "totalPrice": 11200,
    "status": "PAID",
    "remainingPoint": 1300
  }
}
```
> 트랜잭션: stock 차감 + point_logs 생성 + orders 생성 원자적 처리

### GET `/orders` — 내 주문 목록 | **권한**: CONSUMER
### GET `/orders/{orderId}` — 주문 상세 | **권한**: CONSUMER (본인)
### PATCH `/orders/{orderId}/status` — 주문 상태 변경 | **권한**: FARMER

---

## 7. 리뷰 `/reviews`

### POST `/reviews`
리뷰 작성 | **권한**: CONSUMER (구매 확인 필수)

```json
{
  "productId": 1,
  "orderId": 10,
  "rating": 5,
  "content": "정말 신선하고 맛있어요!"
}
```
> orderId + productId 조합으로 구매 여부 확인 / 중복 불가

### GET `/reviews/products/{productId}` — 상품 리뷰 목록 | **권한**: 없음
### DELETE `/reviews/{reviewId}` — 리뷰 삭제 | **권한**: CONSUMER (본인)

---

## 8. 커뮤니티 `/posts`

### GET `/posts` — 게시글 목록 | **권한**: 없음

**Query Parameters**
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | int | 페이지 번호 |
| `size` | int | 페이지 크기 (default: 10) |
| `sort` | string | latest \| popular \| comments |
| `category` | string | 구매후기 \| 레시피 \| 정보공유 \| 질문 |
| `keyword` | string | 제목 검색 |

### GET `/posts/{postId}` — 게시글 상세 | **권한**: 없음

### POST `/posts`
게시글 작성 | **권한**: CONSUMER | Content-Type: multipart/form-data

| 필드 | 타입 | 설명 |
|---|---|---|
| title | string | 제목 |
| content | string | 내용 |
| category | string | 카테고리 |
| productIds | long[] | 태그할 상품 ID |
| images | file[] | 이미지 최대 5장 / 장당 10MB |

### PATCH `/posts/{postId}` — 수정 | **권한**: CONSUMER (본인)
### DELETE `/posts/{postId}` — 삭제 | **권한**: CONSUMER (본인) \| ADMIN
### POST `/posts/{postId}/like` — 좋아요 토글 | **권한**: CONSUMER

---

## 9. 댓글 `/comments`

### GET `/comments/posts/{postId}` — 댓글 목록 | **권한**: 없음
### POST `/comments/posts/{postId}` — 댓글 작성 | **권한**: CONSUMER
### DELETE `/comments/{commentId}` — 댓글 삭제 | **권한**: CONSUMER (본인) \| ADMIN

---

## 10. 포인트 `/points`

### GET `/points/balance` — 잔액 조회 | **권한**: CONSUMER
### GET `/points/logs` — 이력 조회 | **권한**: CONSUMER
### POST `/points/charge` — 포인트 충전 | **권한**: ADMIN

---

## 11. 관리자 `/admin`

### GET `/admin/farms` — 전체 농가 목록 | **권한**: ADMIN
### PATCH `/admin/farms/{farmId}/status` — 농가 승인·반려 | **권한**: ADMIN
### GET `/admin/users` — 전체 사용자 목록 | **권한**: ADMIN
### PATCH `/admin/users/{userId}/role` — 권한 변경 | **권한**: ADMIN
### DELETE `/admin/posts/{postId}` — 게시글 블라인드 | **권한**: ADMIN
### GET `/admin/stats` — 플랫폼 통계 | **권한**: ADMIN

---

## 12. 실시간 SSE `/sse`

### GET `/sse/farm` — 농가 주문 알림 구독 | **권한**: FARMER
```
Accept: text/event-stream

event: new-order
data: {"orderId":10,"productName":"유기농 배추","quantity":2,"totalPrice":7000}

event: stock-update
data: {"productId":1,"stock":26}
```

### GET `/sse/products/{productId}/stock` — 재고 실시간 구독 | **권한**: 없음
```
event: stock-update
data: {"productId":1,"stock":26}
```

---

## 권한 매트릭스

| 엔드포인트 | 비로그인 | CONSUMER | FARMER | ADMIN |
|---|:---:|:---:|:---:|:---:|
| 농가·상품·게시글 조회 | ✅ | ✅ | ✅ | ✅ |
| 이메일 회원가입·로그인 | ✅ | — | — | — |
| 소셜 로그인 (카카오·구글) | ✅ | — | — | — |
| 주문 생성 | — | ✅ | — | — |
| 리뷰 작성 | — | ✅ | — | — |
| 게시글·댓글 작성 / 좋아요 | — | ✅ | — | — |
| 상품 등록·수정·삭제 | — | — | ✅ | — |
| 주문 상태 변경 | — | — | ✅ | — |
| 농가 승인·반려 | — | — | — | ✅ |
| 포인트 충전 | — | — | — | ✅ |
| 사용자 권한 변경 | — | — | — | ✅ |
| 게시글 강제 삭제 | — | — | — | ✅ |
