# ERD — 로컬 푸드 마켓

## 테이블 목록

| 테이블 | 설명 |
|---|---|
| `users` | 회원 정보 (소비자 / 농가 / 관리자) |
| `social_accounts` | 소셜 로그인 연동 (카카오·구글) |
| `farms` | 농가 상점 정보 |
| `products` | 농산물 상품 |
| `orders` | 주문 헤더 |
| `order_items` | 주문 상세 항목 (orders ↔ products N:M 해소) |
| `reviews` | 상품 리뷰 (구매 확인 필수) |
| `posts` | 커뮤니티 게시글 |
| `post_images` | 게시글 이미지 |
| `post_products` | 게시글 ↔ 상품 태그 (posts ↔ products N:M 해소) |
| `comments` | 게시글 댓글 |
| `point_logs` | 포인트 충전·사용 이력 |

---

## 테이블 상세 정의

### users
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 회원 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 |
| password_hash | VARCHAR(255) | NULL 허용 | 암호화된 비밀번호 (소셜 전용 계정은 NULL) |
| role | ENUM | NOT NULL | CONSUMER / FARMER / ADMIN |
| point_balance | BIGINT | DEFAULT 0 | 보유 포인트 |
| created_at | TIMESTAMP | DEFAULT NOW() | 가입일 |

---

### social_accounts
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | ID |
| user_id | BIGINT | FK → users.id | 연동된 회원 |
| provider | VARCHAR(20) | NOT NULL | KAKAO / GOOGLE |
| provider_id | VARCHAR(255) | NOT NULL | 소셜 서비스의 사용자 고유 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 연동일 |

> (provider, provider_id) UNIQUE 제약으로 중복 연동 방지
> 한 users 계정에 카카오·구글 동시 연동 가능 (1:N)

---

### farms
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 농가 ID |
| user_id | BIGINT | FK → users.id, UNIQUE | 농가 계정 (1:1) |
| name | VARCHAR(100) | NOT NULL | 농장명 |
| region | VARCHAR(100) | NOT NULL | 지역 |
| category | VARCHAR(50) | NOT NULL | 채소 / 과일 / 곡류 / 축산 |
| certification | VARCHAR(100) | | 무농약 / 유기농 / GAP인증 |
| status | ENUM | DEFAULT PENDING | PENDING / APPROVED / REJECTED |
| description | TEXT | | 농가 소개 |

---

### products
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 상품 ID |
| farm_id | BIGINT | FK → farms.id | 농가 |
| name | VARCHAR(100) | NOT NULL | 상품명 |
| price | INT | NOT NULL | 가격 (원) |
| stock | INT | DEFAULT 0 | 재고 수량 |
| category | VARCHAR(50) | | 상품 카테고리 |
| harvest_date | DATE | | 수확일 |
| description | TEXT | | 상품 설명 |

---

### orders
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 주문 ID |
| user_id | BIGINT | FK → users.id | 소비자 |
| total_price | INT | NOT NULL | 총 결제금액 (포인트) |
| status | ENUM | DEFAULT PENDING | PENDING / PAID / SHIPPING / DONE |
| delivery_address | VARCHAR(255) | NOT NULL | 배송지 주소 |
| created_at | TIMESTAMP | DEFAULT NOW() | 주문일 |

---

### order_items
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 항목 ID |
| order_id | BIGINT | FK → orders.id | 주문 |
| product_id | BIGINT | FK → products.id | 상품 |
| quantity | INT | NOT NULL | 수량 |
| price_at_order | INT | NOT NULL | 주문 당시 가격 |

---

### reviews
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 리뷰 ID |
| user_id | BIGINT | FK → users.id | 작성자 |
| product_id | BIGINT | FK → products.id | 상품 |
| order_id | BIGINT | FK → orders.id | 구매 확인용 |
| rating | INT | CHECK 1~5 | 평점 |
| content | TEXT | | 리뷰 내용 |
| created_at | TIMESTAMP | DEFAULT NOW() | 작성일 |

> (order_id, product_id) UNIQUE — 동일 주문·상품 중복 리뷰 방지

---

### posts
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 게시글 ID |
| user_id | BIGINT | FK → users.id | 작성자 |
| title | VARCHAR(200) | NOT NULL | 제목 |
| content | TEXT | NOT NULL | 내용 |
| category | VARCHAR(50) | | 구매후기 / 레시피 / 정보공유 / 질문 |
| likes | INT | DEFAULT 0 | 좋아요 수 |
| view_count | INT | DEFAULT 0 | 조회수 |
| created_at | TIMESTAMP | DEFAULT NOW() | 작성일 |

---

### post_images
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 이미지 ID |
| post_id | BIGINT | FK → posts.id | 게시글 |
| image_url | VARCHAR(500) | NOT NULL | 이미지 URL |
| order_index | INT | DEFAULT 0 | 표시 순서 |

---

### post_products (N:M 해소)
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | ID |
| post_id | BIGINT | FK → posts.id | 게시글 |
| product_id | BIGINT | FK → products.id | 태그된 상품 |

---

### comments
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 댓글 ID |
| post_id | BIGINT | FK → posts.id | 게시글 |
| user_id | BIGINT | FK → users.id | 작성자 |
| content | TEXT | NOT NULL | 댓글 내용 |
| created_at | TIMESTAMP | DEFAULT NOW() | 작성일 |

---

### point_logs
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 이력 ID |
| user_id | BIGINT | FK → users.id | 회원 |
| amount | INT | NOT NULL | 포인트 금액 |
| type | ENUM | NOT NULL | CHARGE / USE |
| created_at | TIMESTAMP | DEFAULT NOW() | 처리일 |

---

## 테이블 관계 요약

```
users 1:N social_accounts    소셜 로그인 연동 (카카오·구글)
users 1:1 farms              농가 계정 연결
farms 1:N products           농가 → 상품 등록
users 1:N orders             소비자 → 주문
orders 1:N order_items       주문 → 주문 항목
products 1:N order_items     상품 → 주문 항목  (orders ↔ products N:M 해소)
users 1:N reviews            소비자 → 리뷰
products 1:N reviews         상품 → 리뷰
orders 1:N reviews           구매 확인 (order_id FK)
users 1:N posts              소비자 → 게시글
posts 1:N post_images        게시글 → 이미지
posts N:M products           post_products 중간 테이블로 해소
posts 1:N comments           게시글 → 댓글
users 1:N comments           소비자 → 댓글
users 1:N point_logs         소비자 → 포인트 이력
```

---

## 설계 원칙

- `users.password_hash` NULL 허용 — 소셜 전용 계정은 비밀번호 없음
- `social_accounts` (provider, provider_id) UNIQUE — 동일 소셜 계정 중복 연동 방지
- `reviews.order_id` FK — 구매한 사람만 리뷰 작성 가능 (어뷰징 방지)
- `farms.status = PENDING` — 관리자 승인 전 상품 등록 불가
- `products.stock` 차감 — 주문 시 트랜잭션으로 처리 (동시성 문제 방지)
- `point_logs` — 모든 포인트 변동 이력 추적 가능
