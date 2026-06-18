# ERD — 로컬 푸드 마켓

## 테이블 목록

| 테이블 | 설명 |
|---|---|
| `users` | 회원 정보 (소비자 / 농가 / 관리자) |
| `social_accounts` | 소셜 로그인 연동 (카카오·구글) |
| `farms` | 농가 상점 정보 |
| `products` | 농산물 상품 |
| `orders` | 주문 헤더 (배송/픽업 + 에스크로) |
| `order_items` | 주문 상세 항목 (orders ↔ products N:M 해소) |
| `escrows` | 에스크로 (포인트 hold/release/refund) |
| `reviews` | 상품 리뷰 (구매 확인 필수) |
| `posts` | 커뮤니티 게시글 |
| `post_images` | 게시글 이미지 |
| `post_products` | 게시글 ↔ 상품 태그 (posts ↔ products N:M 해소) |
| `comments` | 게시글 댓글 |
| `point_logs` | 포인트 변동 이력 (충전/사용/잠금/해제/환불) |

---

## 테이블 상세 정의

### users
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | 회원 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 |
| password_hash | VARCHAR(255) | NULL 허용 | 암호화된 비밀번호 (소셜 전용 NULL) |
| role | ENUM | NOT NULL | CONSUMER / FARMER / ADMIN |
| point_balance | BIGINT | DEFAULT 0 | 보유 포인트 (사용 가능 잔액) |
| created_at | TIMESTAMP | DEFAULT NOW() | 가입일 |

> point_balance는 "사용 가능한" 포인트. 주문 시 hold되면 balance에서 차감되고 escrow로 이동.

---

### social_accounts
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | ID |
| user_id | BIGINT | FK → users.id | 연동된 회원 |
| provider | VARCHAR(20) | NOT NULL | KAKAO / GOOGLE |
| provider_id | VARCHAR(255) | NOT NULL | 소셜 서비스 고유 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 연동일 |

> (provider, provider_id) UNIQUE

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
| pickup_address | VARCHAR(255) | | 픽업 기본 주소 |
| description | TEXT | | 농가 소개 |

> pickup_address: 픽업 거래 시 기본 수령 장소로 제안

---

### products
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 상품 ID |
| farm_id | BIGINT | FK → farms.id | 농가 |
| name | VARCHAR(100) | NOT NULL | 상품명 |
| price | INT | NOT NULL | 가격 (포인트) |
| stock | INT | DEFAULT 0 | 재고 수량 |
| category | VARCHAR(50) | | 상품 카테고리 |
| harvest_date | DATE | | 수확일 |
| description | TEXT | | 상품 설명 |
| version | BIGINT | DEFAULT 0 | 낙관적 락 (@Version) — 재고 동시성 |

---

### orders
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 주문 ID |
| user_id | BIGINT | FK → users.id | 소비자 |
| farm_id | BIGINT | FK → farms.id | 농가 (정산 대상) |
| total_price | INT | NOT NULL | 총 결제금액 (포인트) |
| status | ENUM | NOT NULL | 아래 상태 플로우 참고 |
| delivery_method | ENUM | NOT NULL | PICKUP / DELIVERY |
| delivery_address | VARCHAR(255) | | (배송 시) 배송지 주소 |
| courier | VARCHAR(50) | | (배송 시) 택배사 |
| tracking_number | VARCHAR(100) | | (배송 시) 송장번호 |
| pickup_location | VARCHAR(255) | | (픽업 시) 수령 장소 |
| pickup_time | TIMESTAMP | | (픽업 시) 수령 약속 시간 |
| buyer_note | VARCHAR(500) | | 구매자 요청사항 |
| delivered_at | TIMESTAMP | | 배송완료/픽업완료 시각 (자동확정 기준) |
| confirmed_at | TIMESTAMP | | 수령확인 시각 |
| settled_at | TIMESTAMP | | 정산 완료 시각 |
| canceled_at | TIMESTAMP | | 취소 시각 |
| version | BIGINT | DEFAULT 0 | 낙관적 락 — 상태 전이 동시성 |
| created_at | TIMESTAMP | DEFAULT NOW() | 주문일 |

> 한 주문은 한 농가의 상품만 담는다 (farm_id 단일). 여러 농가 상품은 주문 분리.

#### orders.status 상태 플로우
```
PAID  (결제 완료 — 포인트 hold)
  │
  ├─ PICKUP 흐름
  │    READY (수령 준비됨) → 구매자 수령확인 → CONFIRMED → SETTLED
  │
  └─ DELIVERY 흐름
       PREPARING (준비중) → SHIPPING (배송중) → DELIVERED (배송완료)
                                                    │
                                       구매자 수령확인 → CONFIRMED → SETTLED
                                       7일 무응답 → 자동 CONFIRMED → SETTLED

  CANCELED  (취소 — 포인트 refund)
  REFUNDED  (환불 완료)
```

---

### order_items
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 항목 ID |
| order_id | BIGINT | FK → orders.id | 주문 |
| product_id | BIGINT | FK → products.id | 상품 |
| quantity | INT | NOT NULL | 수량 |
| price_at_order | INT | NOT NULL | 주문 당시 가격 스냅샷 |

---

### escrows
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 에스크로 ID |
| order_id | BIGINT | FK → orders.id, UNIQUE | 대상 주문 (1:1) |
| buyer_id | BIGINT | FK → users.id | 구매자 |
| farm_id | BIGINT | FK → farms.id | 정산 대상 농가 |
| amount | INT | NOT NULL | 잠금 금액 (포인트) |
| status | ENUM | NOT NULL | HELD / RELEASED / REFUNDED |
| held_at | TIMESTAMP | NOT NULL | 잠금 시각 |
| released_at | TIMESTAMP | | 농가 정산(release) 시각 |
| refunded_at | TIMESTAMP | | 구매자 환불 시각 |

> 결제 시 HELD 생성 → 수령확인(CONFIRMED) 시 RELEASED (농가 포인트 지급)
> 취소 시 REFUNDED (구매자 포인트 복원)

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

> (order_id, product_id) UNIQUE — 중복 리뷰 방지
> 주문 status가 CONFIRMED 또는 SETTLED일 때만 작성 가능

---

### posts / post_images / post_products / comments
(기존과 동일)

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

### post_images
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 이미지 ID |
| post_id | BIGINT | FK → posts.id | 게시글 |
| image_url | VARCHAR(500) | NOT NULL | 이미지 URL |
| order_index | INT | DEFAULT 0 | 표시 순서 |

### post_products (N:M 해소)
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | ID |
| post_id | BIGINT | FK → posts.id | 게시글 |
| product_id | BIGINT | FK → products.id | 태그된 상품 |

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
| order_id | BIGINT | FK → orders.id, NULL 허용 | 관련 주문 (충전은 NULL) |
| amount | INT | NOT NULL | 변동 금액 (+/-) |
| type | ENUM | NOT NULL | CHARGE / HOLD / RELEASE / REFUND |
| balance_after | BIGINT | NOT NULL | 변동 후 잔액 (추적용) |
| created_at | TIMESTAMP | DEFAULT NOW() | 처리일 |

#### point_logs.type 의미
```
CHARGE   관리자 충전        balance +
HOLD     주문 결제(잠금)     balance -  (escrow로 이동)
RELEASE  농가 정산          농가 balance +  (수령확인 후)
REFUND   주문 취소·환불      구매자 balance +  (복원)
```

---

## 테이블 관계 요약

```
users 1:N social_accounts    소셜 로그인 연동
users 1:1 farms              농가 계정
farms 1:N products           농가 → 상품
users 1:N orders             소비자 → 주문
farms 1:N orders             농가 → 주문 (정산 대상)
orders 1:N order_items       주문 → 항목
products 1:N order_items     상품 → 항목  (N:M 해소)
orders 1:1 escrows           주문 → 에스크로
users 1:N reviews            소비자 → 리뷰
products 1:N reviews         상품 → 리뷰
orders 1:N reviews           구매 확인
users 1:N posts              소비자 → 게시글
posts 1:N post_images        게시글 → 이미지
posts N:M products           post_products 해소
posts 1:N comments           게시글 → 댓글
users 1:N comments           소비자 → 댓글
users 1:N point_logs         포인트 이력
orders 1:N point_logs        주문별 포인트 이력
```

---

## 설계 원칙

- **에스크로** — 결제 시 구매자 포인트를 시스템이 hold, 수령확인 시 농가에 release, 취소 시 refund. 직거래 신뢰 보장.
- **한 주문 = 한 농가** — orders.farm_id 단일. 정산 단위를 명확히.
- **동시성** — products.version, orders.version 낙관적 락(@Version)으로 재고·상태 이중 처리 방지.
- **자동확정** — DELIVERED 후 7일 무응답 시 스케줄러가 CONFIRMED 처리 (구매자 미응답으로 농가 정산이 막히는 것 방지).
- **point_logs.balance_after** — 모든 변동 후 잔액 기록으로 정산 감사(audit) 가능.
- `reviews.order_id` FK — 구매 확인된 주문만 리뷰 가능.
- `farms.status = PENDING` — 승인 전 상품 등록 불가.
