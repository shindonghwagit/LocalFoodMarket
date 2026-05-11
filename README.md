# 🌾 LocalFoodMarket

> 지역 농가와 소비자를 직접 연결하는 직거래 플랫폼

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

## 시작하기

### Backend
```bash
cd backend
./gradlew bootRun
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 문서

- [ERD](./docs/ERD.md)
- [API 명세](./docs/API.md)
- [아키텍처](./docs/ARCHITECTURE.md)

## 개발자

순천향대학교 AICS Lab · 20214038 신동화
