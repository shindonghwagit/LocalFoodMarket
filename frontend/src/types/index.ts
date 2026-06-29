// ── 공통 응답 ─────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// ── 사용자 ────────────────────────────────────────────────────────────────────

export type Role = 'CONSUMER' | 'FARMER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  role: Role;
  pointBalance: number;
  connectedProviders: string[];
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ── 농가 ──────────────────────────────────────────────────────────────────────

export type FarmStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Farm {
  id: number;
  name: string;
  region: string;
  category: string;
  certification: string | null;
  description: string | null;
  status: FarmStatus;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
}

// ── 상품 ──────────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  farmId: number;
  farmName: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  harvestDate: string | null;
  description: string | null;
  imageUrl?: string;
}

// ── 주문 ──────────────────────────────────────────────────────────────────────

export type DeliveryMethod = 'PICKUP' | 'DELIVERY';

export type OrderStatus =
  | 'PAID'        // 결제완료 (포인트 hold)
  | 'READY'       // 픽업 수령 준비 완료
  | 'PREPARING'   // 배송 준비중
  | 'SHIPPING'    // 배송중
  | 'DELIVERED'   // 배송완료
  | 'CONFIRMED'   // 구매자 수령확인
  | 'SETTLED'     // 거래완료 (농가 정산)
  | 'CANCELED'    // 주문취소
  | 'REFUNDED';   // 환불완료

export type EscrowStatus = 'HELD' | 'RELEASED' | 'REFUNDED';

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  priceAtOrder: number;
}

export interface Order {
  orderId: number;
  userId?: number;
  farmId?: number;
  totalPrice: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  // 배송
  deliveryAddress: string | null;
  courier: string | null;
  trackingNumber: string | null;
  // 픽업
  pickupLocation: string | null;
  pickupTime: string | null;
  buyerNote: string | null;
  // 에스크로
  escrowStatus: EscrowStatus | null;
  // 주문 직후 응답에만 포함
  remainingPoint?: number | null;
  items: OrderItem[];
  createdAt: string;
}

// ── 리뷰 ──────────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  userId: number;
  authorEmail?: string;
  productId: number;
  productName?: string;
  orderId: number;
  rating: number;
  content: string;
  createdAt: string;
}

// ── 게시글 ────────────────────────────────────────────────────────────────────

export type PostCategory = '구매후기' | '레시피' | '정보공유' | '질문';

export interface Post {
  id: number;
  userId: number;
  authorEmail?: string;
  title: string;
  content: string;
  category: PostCategory;
  likes: number;
  liked?: boolean;
  viewCount: number;
  commentCount?: number;
  imageUrls: string[];
  taggedProducts?: { id: number; name: string }[];
  createdAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  authorEmail?: string;
  content: string;
  createdAt: string;
}

// ── 포인트 ────────────────────────────────────────────────────────────────────

export type PointLogType = 'CHARGE' | 'HOLD' | 'RELEASE' | 'REFUND';

export interface PointLog {
  id: number;
  amount: number;
  type: PointLogType;
  createdAt: string;
}

// ── 페이지네이션 ──────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}
