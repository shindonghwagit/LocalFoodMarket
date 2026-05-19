<div align="center">
  <img src="./docs/logo.png" alt="Farmer's Market Logo" width="200"/>

  # Farmer's Market

  > 지역 농가와 소비자를 직접 연결하는 직거래 플랫폼
</div>

## 서비스 소개

대형 유통망을 거치지 않고 지역 농가에서 소비자에게 신선한 농산물을 직접 공급합니다.
농가는 상품을 등록하고, 소비자는 평점·인증 기반으로 농가를 탐색하여 포인트로 구매합니다.
커뮤니티에서 구매 후기와 레시피를 공유할 수 있습니다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS (Vite) |
| Backend | Spring Boot 3 + Spring Security + JPA |
| Database | PostgreSQL (Neon) |
| 인증 | JWT + OAuth2 (카카오·구글) |
| 실시간 | SSE (Spring SseEmitter) |
| 배포 | Railway (Backend) + Vercel (Frontend) |
| CI/CD | GitHub Actions |

## 프로젝트 구조

```
localfoodmarket/
├── CLAUDE.md          # Claude Code 컨텍스트
├── backend/           # Spring Boot
├── frontend/          # React + TypeScript
└── docs/
    ├── ERD.md         # 데이터베이스 설계
    ├── API.md         # API 명세
    └── ARCHITECTURE.md
```

## 주요 기능

- 농가 상점 개설 및 상품 등록·관리
- 카테고리·인증·평점 기반 농가 탐색
- 포인트 결제 시스템
- 실시간 재고 갱신 (SSE)
- 커뮤니티 게시판 (이미지 업로드, 상품 태그)
- 카카오·구글 소셜 로그인
- 관리자 농가 승인·사용자 관리

## 구현 현황

### Backend

| 기능 | 상태 |
|---|---|
| 이메일 회원가입 / 로그인 (JWT) | ✅ |
| 카카오 · 구글 소셜 로그인 (OAuth2) | ✅ |
| 농가 CRUD + 관리자 승인 플로우 | ✅ |
| 상품 CRUD + 실시간 재고 SSE | ✅ |
| 주문 · 포인트 결제 (트랜잭션) | ✅ |
| 리뷰 (구매 확인 후 작성) | ✅ |
| 커뮤니티 게시글 · 댓글 · 좋아요 | ✅ |
| 이미지 업로드 (로컬 저장) | ✅ |
| 카카오 주소 검색 API 연동 | ✅ |
| 관리자 기능 (농가 승인 · 사용자 관리) | ✅ |
| Swagger UI | ✅ |
| 로컬 시드 데이터 | ✅ |

### Frontend

| 기능 | 상태 |
|---|---|
| React + TypeScript 프로젝트 세팅 | 🔜 |

## 시작하기

### 환경 변수 설정

`backend/src/main/resources/application-local.yml` 에 아래 값을 채워주세요.

```yaml
spring:
  datasource:
    url: jdbc:postgresql://{host}/{db}
    username: {username}
    password: {password}
  security:
    oauth2:
      client:
        registration:
          kakao:
            client-id: {kakao-client-id}
            client-secret: {kakao-client-secret}
          google:
            client-id: {google-client-id}
            client-secret: {google-client-secret}

jwt:
  secret: {32자-이상-시크릿-키}

kakao:
  address:
    api-key: {kakao-rest-api-key}
```

### Backend 실행

```bash
cd backend
./gradlew bootRun
```

Swagger UI: `http://localhost:8080/api/v1/swagger-ui/index.html`

로컬 프로파일로 실행 시 시드 데이터(관리자 · 농가 3개 · 상품 9개 · 소비자 2개)가 자동 생성됩니다.

### Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

## 문서

- [ERD](./docs/ERD.md)
- [API 명세](./docs/API.md)
- [아키텍처](./docs/ARCHITECTURE.md)