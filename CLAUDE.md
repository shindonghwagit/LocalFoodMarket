# 로컬 푸드 마켓 — CLAUDE.md

> Claude Code가 이 파일을 읽고 프로젝트 전체 컨텍스트를 파악한다.
> 코드 작성 전 반드시 이 파일을 먼저 읽을 것.

---

## 프로젝트 개요

지역 농가와 소비자를 연결하는 직거래 플랫폼.
농가가 상품을 등록하고 소비자가 포인트로 구매하며, 커뮤니티에서 구매 후기를 공유한다.

---

## 기술 스택

### Backend
- **언어**: Java 17
- **프레임워크**: Spring Boot 3.x
- **인증**: Spring Security + JWT (Access / Refresh Token) + OAuth2 Client (카카오·구글)
- **ORM**: Spring Data JPA + Hibernate
- **DB**: PostgreSQL (Neon 클라우드)
- **실시간**: SSE (Spring SseEmitter)
- **빌드**: Gradle
- **테스트**: JUnit 5 + Mockito

### Frontend
- **언어**: TypeScript
- **프레임워크**: React 18 + Vite
- **스타일**: Tailwind CSS
- **상태관리**: Zustand
- **HTTP**: Axios
- **라우팅**: React Router v6

### 인프라
- **백엔드 배포**: Railway
- **프론트 배포**: Vercel
- **CI/CD**: GitHub Actions
- **외부 API**: 카카오 주소 검색 API / 카카오 OAuth2 / Google OAuth2

---

## 프로젝트 구조

```
localfood-market/
├── CLAUDE.md
├── docs/
│   ├── ERD.md
│   ├── API.md
│   └── ARCHITECTURE.md
├── backend/                          ← Spring Boot (IntelliJ로 열기)
│   ├── src/main/java/com/localfood/
│   │   ├── domain/
│   │   │   ├── user/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   └── dto/
│   │   │   ├── farm/
│   │   │   ├── product/
│   │   │   ├── order/
│   │   │   ├── review/
│   │   │   ├── post/
│   │   │   └── point/
│   │   ├── global/
│   │   │   ├── config/          ← Security, JPA, SSE 설정
│   │   │   ├── exception/       ← 공통 예외 처리
│   │   │   ├── response/        ← 공통 응답 형식
│   │   │   └── util/
│   │   └── LocalFoodApplication.java
│   └── src/main/resources/
│       ├── application.yml
│       └── application-local.yml
└── frontend/                         ← React (VS Code로 열기)
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── api/
    │   ├── store/
    │   ├── hooks/
    │   └── types/
    └── vite.config.ts
```

---

## 도메인 규칙

### 권한 (Role)
```
CONSUMER  소비자 — 주문, 리뷰 작성, 게시글 작성
FARMER    농가   — 상품 CRUD, 주문 상태 변경 (관리자 승인 후 활성화)
ADMIN     관리자 — 농가 승인, 사용자 관리, 통계
```

### 로그인 후 리다이렉트
```
CONSUMER → /mypage
FARMER   → /farm/dashboard
ADMIN    → /admin
```

### 소셜 로그인 플로우
```
최초 가입 → isNewUser: true → tempToken 발급 → role 선택 → /auth/oauth2/complete
기존 사용자 → accessToken + refreshToken 즉시 발급
```

### 농가 상태 플로우
```
가입 → PENDING → 관리자 승인 → APPROVED (상품 등록 가능)
                              → REJECTED (재신청 필요)
APPROVED 농가만 상품 등록·판매 가능
```

### 리뷰 작성 조건
```
order_id + product_id 조합으로 구매 여부 확인
동일 조합 중복 리뷰 불가 (UNIQUE 제약)
배송완료(DONE) 상태인 주문만 리뷰 작성 가능
```

### 주문·결제
```
주문 시 트랜잭션 처리:
  1. products.stock 차감 (재고 부족 시 OUT_OF_STOCK)
  2. users.point_balance 차감 (부족 시 INSUFFICIENT_POINT)
  3. point_logs INSERT (type: USE)
  4. orders INSERT
  5. order_items INSERT
모두 성공해야 커밋, 하나라도 실패 시 롤백
```

### 비밀번호 정책 (NIST SP 800-63B)
```
최소 12자 이상
연속·반복 문자 차단 (123456, aaaaaa 등)
특수문자 강제 없음
소셜 전용 계정은 password_hash = NULL
```

---

## API 규칙

### Base URL
```
개발: http://localhost:8080/api/v1
운영: https://{railway-domain}/api/v1
```

### 공통 응답 형식
```json
// 성공
{ "success": true, "data": { }, "message": "..." }

// 실패
{ "success": false, "error": { "code": "ERROR_CODE", "message": "사용자 친화적 메시지" } }
```

### 인증 헤더
```
Authorization: Bearer {accessToken}
```

### 에러 메시지 원칙 (농가 고령층 사용자 고려)
```
❌ "VALIDATION_ERROR"
✅ "상품 재고가 부족해요. 수량을 줄여주세요."

❌ "UNAUTHORIZED"
✅ "로그인이 필요한 서비스예요. 로그인 후 이용해주세요."
```

---

## DB 핵심 테이블

```sql
users           -- id, email, password_hash(nullable), role, point_balance
social_accounts -- id, user_id, provider(KAKAO/GOOGLE), provider_id
farms           -- id, user_id, name, region, category, certification, status
products        -- id, farm_id, name, price, stock, category, harvest_date
orders          -- id, user_id, total_price, status, delivery_address
order_items     -- id, order_id, product_id, quantity, price_at_order
reviews         -- id, user_id, product_id, order_id, rating, content
posts           -- id, user_id, title, content, category, likes, view_count
post_images     -- id, post_id, image_url, order_index
post_products   -- id, post_id, product_id  (N:M 해소)
comments        -- id, post_id, user_id, content
point_logs      -- id, user_id, amount, type(CHARGE/USE)
```

> 상세 스키마는 docs/ERD.md 참고

---

## UI/UX 원칙 (농가 대시보드 전용)

농가 사용자는 고령층이 많으므로 아래 원칙을 농가 관련 화면에 적용한다.

```
폰트 크기     본문 최소 16px, 주요 버튼 18px 이상
터치 영역     버튼 최소 48×48px (WCAG 2.1)
색상 대비     WCAG AA 기준 4.5:1 이상
아이콘        단독 사용 금지 — 반드시 텍스트 레이블 병행
에러 메시지   구체적이고 친절하게 (위 에러 메시지 원칙 참고)
확인 다이얼로그  삭제·취소 등 되돌릴 수 없는 액션에 반드시 노출
단계 최소화   핵심 플로우 최대 3단계 이내
```

---

## 실시간 SSE

```java
// 농가 주문 알림 구독
GET /api/v1/sse/farm
event: new-order
data: {"orderId":10,"productName":"유기농 배추","quantity":2,"totalPrice":7000}

// 상품 재고 실시간 구독
GET /api/v1/sse/products/{productId}/stock
event: stock-update
data: {"productId":1,"stock":26}
```

SSE는 Vercel Serverless 환경에서 제한이 있으므로 프론트는 Vercel, 백엔드는 Railway에 배포한다.

---

## Git 규칙

### 브랜치 전략
```
main        배포 브랜치 (직접 커밋 금지)
develop     개발 통합 브랜치
feature/*   기능 개발 (예: feature/auth-login)
fix/*       버그 수정 (예: fix/stock-concurrency)
```

### 커밋 메시지 (Conventional Commits)
```
feat: 새 기능
fix: 버그 수정
refactor: 리팩터링
docs: 문서 수정
test: 테스트 추가
chore: 빌드·설정 변경

예시:
feat(auth): 카카오 소셜 로그인 구현
fix(order): 재고 동시성 트랜잭션 처리 수정
feat(post): 게시글 이미지 다중 업로드 구현
```

---

## 환경변수 (application-local.yml 기준)

```yaml
# DB
spring.datasource.url: jdbc:postgresql://{neon-host}/{db}
spring.datasource.username: {username}
spring.datasource.password: {password}

# JWT
jwt.secret: {secret-key}
jwt.access-expiration: 3600000      # 1시간
jwt.refresh-expiration: 604800000   # 7일

# OAuth2 카카오
spring.security.oauth2.client.registration.kakao.client-id: {kakao-client-id}
spring.security.oauth2.client.registration.kakao.client-secret: {kakao-client-secret}
spring.security.oauth2.client.registration.kakao.redirect-uri: http://localhost:8080/api/v1/auth/oauth2/callback

# OAuth2 구글
spring.security.oauth2.client.registration.google.client-id: {google-client-id}
spring.security.oauth2.client.registration.google.client-secret: {google-client-secret}

# 카카오 주소 검색
kakao.address.api-key: {kakao-rest-api-key}
```

---

## 개발 시 주의사항

1. **Entity 직접 반환 금지** — 반드시 DTO로 변환 후 반환
2. **N+1 문제 주의** — 연관 관계 조회 시 `@EntityGraph` 또는 `fetch join` 사용
3. **재고 차감은 반드시 트랜잭션** — `@Transactional` + 비관적 락 고려
4. **소셜 로그인 콜백은 tempToken으로만 role 설정** — 일반 JWT와 구분
5. **농가 승인 전 상품 등록 시도 시 `FARM_NOT_APPROVED` 반환**
6. **SSE 연결은 타임아웃 처리** — 30초마다 heartbeat 전송

---

## 참고 문서

- ERD 상세: `docs/ERD.md`
- API 전체 명세: `docs/API.md`
- Spring Security OAuth2 공식 문서: https://docs.spring.io/spring-security/reference/servlet/oauth2
- 카카오 로그인 API: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
- 구글 OAuth2: https://developers.google.com/identity/protocols/oauth2