# 아키텍처 — LocalFoodMarket

## 전체 구조

```
┌─────────────────┐        ┌─────────────────────────────┐
│   Browser       │        │   GitHub Actions (CI/CD)    │
│   React + TS    │        │   build → test → deploy     │
└────────┬────────┘        └─────────────────────────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Vercel        │   ← 프론트엔드 호스팅
│   React SPA     │
└────────┬────────┘
         │ REST API / SSE
         ▼
┌─────────────────┐
│   Railway       │   ← 백엔드 호스팅
│   Spring Boot   │
└────────┬────────┘
         │ JDBC
         ▼
┌─────────────────┐
│   Neon          │   ← 클라우드 PostgreSQL
│   PostgreSQL    │
└─────────────────┘
```

---

## Backend 레이어 구조

```
Controller  →  Service  →  Repository  →  DB
    ↑               ↑
   DTO             Entity
```

### 패키지 구조 (도메인별 분리)

```
com.localfood/
├── domain/
│   ├── user/
│   │   ├── controller/   UserController.java
│   │   ├── service/      UserService.java
│   │   ├── repository/   UserRepository.java
│   │   ├── entity/       User.java
│   │   └── dto/          UserRequestDto.java / UserResponseDto.java
│   ├── farm/
│   ├── product/
│   ├── order/
│   ├── review/
│   ├── post/
│   └── point/
└── global/
    ├── config/
    │   ├── SecurityConfig.java
    │   ├── JwtConfig.java
    │   └── OAuth2Config.java
    ├── exception/
    │   ├── GlobalExceptionHandler.java
    │   └── ErrorCode.java
    ├── response/
    │   └── ApiResponse.java
    └── util/
        └── JwtUtil.java
```

---

## 인증 플로우

### 이메일 로그인
```
Client → POST /auth/login
       ← accessToken (1시간) + refreshToken (7일)

Client → API 요청 시 Authorization: Bearer {accessToken}
       ← 만료 시 401

Client → POST /auth/refresh
       ← 새 accessToken
```

### 소셜 로그인 (신규 가입)
```
Client → GET /auth/oauth2/kakao
       ← 카카오 인증 페이지 리다이렉트

카카오 인증 완료 → 백엔드 콜백
백엔드 → isNewUser: true + tempToken 반환

Client → role 선택 화면 표시
Client → POST /auth/oauth2/complete { tempToken, role }
       ← accessToken + refreshToken
```

### 소셜 로그인 (기존 사용자)
```
카카오 인증 완료 → 백엔드 콜백
백엔드 → isNewUser: false + accessToken + refreshToken 바로 반환
```

---

## 실시간 SSE 플로우

```
농가 대시보드 접속
Client → GET /sse/farm (Accept: text/event-stream)
       ← 연결 유지 (30초마다 heartbeat)

소비자가 주문 생성
POST /orders → 트랜잭션 처리 → SSE 이벤트 발송
             ← event: new-order
                data: {orderId, productName, quantity, totalPrice}

재고 변동 시
             ← event: stock-update
                data: {productId, stock}
```

---

## 주문 트랜잭션

```
@Transactional
POST /orders

1. 상품 재고 확인 → 부족 시 OUT_OF_STOCK 예외
2. 포인트 잔액 확인 → 부족 시 INSUFFICIENT_POINT 예외
3. products.stock -= quantity (비관적 락)
4. users.point_balance -= totalPrice
5. point_logs INSERT (type: USE)
6. orders INSERT
7. order_items INSERT (N개)
8. SSE 이벤트 발송 (농가에 알림)

실패 시 전체 롤백
```

---

## CI/CD 파이프라인

```
GitHub Push (develop 브랜치)
    ↓
GitHub Actions
    ├── Backend
    │   ├── ./gradlew test
    │   ├── ./gradlew build
    │   └── Railway 자동 배포
    └── Frontend
        ├── npm run build
        └── Vercel 자동 배포
```

---

## 환경별 설정

| 환경 | Backend | Frontend | DB |
|---|---|---|---|
| 로컬 개발 | localhost:8080 | localhost:5173 | Neon (동일) |
| 운영 | Railway URL | Vercel URL | Neon (동일) |
