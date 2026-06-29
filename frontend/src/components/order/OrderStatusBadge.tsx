import type { OrderStatus } from '../../types';

/** 주문 상태별 한국어 라벨 + 뱃지 색상 (전역 통일) */
export const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  PAID:      { label: '결제완료', color: 'text-primary' },
  READY:     { label: '수령대기', color: 'text-tertiary' },
  PREPARING: { label: '준비중',   color: 'text-secondary' },
  SHIPPING:  { label: '배송중',   color: 'text-tertiary' },
  DELIVERED: { label: '배송완료', color: 'text-primary' },
  CONFIRMED: { label: '수령확인', color: 'text-primary' },
  SETTLED:   { label: '거래완료', color: 'text-on-surface-variant' },
  CANCELED:  { label: '주문취소', color: 'text-error' },
  REFUNDED:  { label: '환불완료', color: 'text-error' },
};

export default function OrderStatusBadge({
  status,
  className = '',
}: {
  status: OrderStatus;
  className?: string;
}) {
  const meta = ORDER_STATUS_META[status] ?? { label: status, color: 'text-on-surface' };
  return (
    <span
      className={`inline-flex items-center font-label-md text-label-md font-semibold px-sm py-xs rounded-full bg-surface-container whitespace-nowrap ${meta.color} ${className}`}
    >
      {meta.label}
    </span>
  );
}
