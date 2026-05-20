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
}

// ── 주문 ──────────────────────────────────────────────────────────────────────

export type OrderStatus = 'PAID' | 'PREPARING' | 'SHIPPED' | 'DONE' | 'CANCELLED';

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  priceAtOrder: number;
}

export interface Order {
  id: number;
  totalPrice: number;
  status: OrderStatus;
  deliveryAddress: string;
  items: OrderItem[];
  createdAt: string;
}

// ── 리뷰 ──────────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  userId: number;
  productId: number;
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
  title: string;
  content: string;
  category: PostCategory;
  likes: number;
  viewCount: number;
  imageUrls: string[];
  createdAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
}

// ── 포인트 ────────────────────────────────────────────────────────────────────

export type PointLogType = 'CHARGE' | 'USE';

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
