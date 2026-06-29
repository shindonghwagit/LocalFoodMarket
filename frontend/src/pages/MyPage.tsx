import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Order, PointLog, PointLogType, Post } from '../types';
import { getOrders, confirmOrder, cancelOrder } from '../api/order';
import { getPosts } from '../api/post';
import { chargePoint, getPointLogs } from '../api/point';
import { getMe } from '../api/auth';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import OrderStatusBadge from '../components/order/OrderStatusBadge';

const CHARGE_AMOUNTS = [10000, 30000, 50000, 100000];

// 포인트 로그 유형별 표시 (부호 + 라벨 + 색상)
const POINT_LOG_META: Record<PointLogType, { label: string; sign: '+' | '-'; positive: boolean }> = {
  CHARGE:  { label: '충전',      sign: '+', positive: true },
  HOLD:    { label: '주문 결제', sign: '-', positive: false },
  RELEASE: { label: '판매 정산', sign: '+', positive: true },
  REFUND:  { label: '주문 환불', sign: '+', positive: true },
};

/* ── 주문 내역 탭 ─────────────────────────────────────────────────────────── */
function OrdersTab() {
  const { setUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    getOrders()
      .then(({ data }) => setOrders(data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const refreshPoint = () => {
    getMe().then(({ data }) => setUser(data.data)).catch(() => {});
  };

  const handleConfirm = async (orderId: number) => {
    setActingId(orderId);
    setActionError('');
    try {
      const { data } = await confirmOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? data.data : o)));
    } catch (err: any) {
      setActionError(err?.response?.data?.error?.message ?? '수령 확인에 실패했어요.');
    } finally {
      setActingId(null);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!window.confirm('주문을 취소하고 포인트를 환불받으시겠어요?')) return;
    setActingId(orderId);
    setActionError('');
    try {
      const { data } = await cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? data.data : o)));
      refreshPoint(); // 환불 포인트 반영
    } catch (err: any) {
      setActionError(err?.response?.data?.error?.message ?? '주문 취소에 실패했어요.');
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-lg"><LoadingSpinner /></div>;

  if (orders.length === 0) return (
    <div className="flex flex-col items-center py-xl text-center">
      <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-md">receipt_long</span>
      <p className="font-headline-sm text-headline-sm text-on-surface mb-xs">주문 내역이 없어요</p>
      <Link to="/farms" className="font-body-md text-body-md text-primary hover:underline">쇼핑 시작하기</Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-md">
      {actionError && (
        <p className="font-body-md text-body-md text-error bg-error-container px-md py-sm rounded-lg">{actionError}</p>
      )}
      {orders.map((order) => {
        const date = new Date(order.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
        const acting = actingId === order.orderId;
        const canConfirm = order.status === 'DELIVERED' || order.status === 'READY';
        const canCancel = order.status === 'PAID';
        const canReview = order.status === 'SETTLED' || order.status === 'CONFIRMED';
        return (
          <div key={order.orderId} className="bg-white rounded-xl border border-outline-variant p-md">
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-md flex-wrap">
                <span className="font-label-sm text-label-sm text-outline">{date} · 주문 #{order.orderId}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                {order.totalPrice.toLocaleString()}P
              </span>
            </div>

            <div className="flex flex-col gap-xs mb-md">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-xs border-b border-outline-variant last:border-0">
                  <Link to={`/products/${item.productId}`}
                    className="font-body-md text-body-md text-on-surface hover:text-primary transition-colors">
                    {item.productName}
                  </Link>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {item.quantity}개 · {item.priceAtOrder.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>

            {/* 배송/픽업 정보 */}
            <div className="flex flex-col gap-xs mb-md font-label-sm text-label-sm text-on-surface-variant">
              {order.deliveryMethod === 'PICKUP' ? (
                <>
                  <p className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">storefront</span>
                    픽업 · {order.pickupLocation ?? '-'}
                  </p>
                  {order.pickupTime && (
                    <p className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      수령 희망: {new Date(order.pickupTime).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    배송 · {order.deliveryAddress ?? '-'}
                  </p>
                  {(order.status === 'SHIPPING' || order.status === 'DELIVERED') && order.trackingNumber && (
                    <p className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                      {order.courier ?? '택배'} · 송장 {order.trackingNumber}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* 액션 */}
            {(canConfirm || canCancel || canReview) && (
              <div className="flex items-center justify-end gap-sm">
                {canCancel && (
                  <button
                    onClick={() => handleCancel(order.orderId)}
                    disabled={acting}
                    className="flex items-center gap-xs border border-outline-variant text-on-surface-variant px-md py-xs rounded-full font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    주문 취소
                  </button>
                )}
                {canConfirm && (
                  <button
                    onClick={() => handleConfirm(order.orderId)}
                    disabled={acting}
                    className="flex items-center gap-xs bg-primary text-on-primary px-md py-xs rounded-full font-label-md text-label-md hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    수령 확인
                  </button>
                )}
                {canReview && (
                  <Link
                    to="/community/write"
                    className="flex items-center gap-xs bg-primary-fixed text-primary px-md py-xs rounded-full font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">rate_review</span>
                    리뷰 작성
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── 포인트 탭 ────────────────────────────────────────────────────────────── */
function PointTab() {
  const { user, setUser } = useAuthStore();
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [charging, setCharging] = useState(false);
  const [chargeError, setChargeError] = useState('');

  useEffect(() => {
    getMe()
      .then(({ data }) => setUser(data.data))
      .catch(() => {});
    getPointLogs({ size: 20 })
      .then(({ data }) => setLogs(data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCharge = async (amount: number) => {
    setCharging(true);
    setChargeError('');
    try {
      const { data } = await chargePoint(amount);
      if (user) setUser({ ...user, pointBalance: data.data.pointBalance });
      setLogs((prev) => [{ id: Date.now(), amount, type: 'CHARGE', createdAt: new Date().toISOString() }, ...prev]);
    } catch (err: any) {
      setChargeError(err?.response?.data?.error?.message ?? '충전에 실패했어요.');
    } finally {
      setCharging(false);
    }
  };

  return (
    <div className="flex flex-col gap-lg">
      {/* 잔액 카드 */}
      <div className="bg-primary text-on-primary rounded-2xl p-lg">
        <p className="font-label-md text-label-md opacity-80 mb-xs">현재 포인트 잔액</p>
        <p className="font-headline-xl text-headline-xl font-bold">
          {(user?.pointBalance ?? 0).toLocaleString()}P
        </p>
        <p className="font-label-sm text-label-sm opacity-70 mt-xs">1P = 1원 직거래 구매에 사용</p>
      </div>

      {/* 충전 */}
      <div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">포인트 충전</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-sm mb-sm">
          {CHARGE_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => handleCharge(amount)}
              disabled={charging}
              className="py-md bg-white border border-outline-variant rounded-xl font-body-md text-body-md text-on-surface hover:border-primary hover:bg-primary-fixed transition-all cursor-pointer disabled:opacity-50 text-center"
            >
              <span className="block font-headline-sm text-headline-sm text-primary">+{(amount / 10000).toFixed(0)}만</span>
              <span className="text-on-surface-variant">{amount.toLocaleString()}P</span>
            </button>
          ))}
        </div>
        {chargeError && <p className="font-label-sm text-label-sm text-error">{chargeError}</p>}
      </div>

      {/* 내역 */}
      <div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">포인트 내역</h3>
        {loading ? (
          <div className="flex justify-center py-md"><LoadingSpinner /></div>
        ) : logs.length > 0 ? (
          <div className="flex flex-col gap-xs">
            {logs.map((log) => {
              const meta = POINT_LOG_META[log.type] ?? { label: log.type, sign: '', positive: true };
              return (
                <div key={log.id} className="flex items-center justify-between bg-white rounded-xl border border-outline-variant px-md py-sm">
                  <div className="flex items-center gap-sm">
                    <span className={`material-symbols-outlined text-[20px] ${meta.positive ? 'text-primary' : 'text-error'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {meta.positive ? 'add_circle' : 'remove_circle'}
                    </span>
                    <span className="font-body-md text-body-md text-on-surface">{meta.label}</span>
                  </div>
                  <span className={`font-headline-sm text-headline-sm ${meta.positive ? 'text-primary' : 'text-error'}`}>
                    {meta.sign}{log.amount.toLocaleString()}P
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-md">포인트 내역이 없어요</p>
        )}
      </div>
    </div>
  );
}

/* ── 내 게시글 탭 ─────────────────────────────────────────────────────────── */
function MyPostsTab() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getPosts({ userId: user.id, size: 20 })
      .then(({ data }) => setPosts(data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex justify-center py-lg"><LoadingSpinner /></div>;

  if (posts.length === 0) return (
    <div className="flex flex-col items-center py-xl text-center">
      <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-md">article</span>
      <p className="font-headline-sm text-headline-sm text-on-surface mb-xs">작성한 게시글이 없어요</p>
      <Link to="/community/write" className="font-body-md text-body-md text-primary hover:underline">첫 글 작성하기</Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-sm">
      {posts.map((post) => (
        <Link key={post.id} to={`/community/${post.id}`}
          className="flex items-center justify-between bg-white rounded-xl border border-outline-variant px-md py-sm hover:border-primary transition-colors">
          <div className="flex-1 min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant mr-sm">{post.category}</span>
            <span className="font-body-md text-body-md text-on-surface line-clamp-1">{post.title}</span>
          </div>
          <div className="flex items-center gap-sm ml-md shrink-0 text-on-surface-variant">
            <span className="flex items-center gap-xs font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">favorite</span>{post.likes}
            </span>
            <span className="font-label-sm text-label-sm text-outline">
              {new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ── 페이지 ───────────────────────────────────────────────────────────────── */
type TabId = 'orders' | 'points' | 'posts';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'orders', label: '주문 내역', icon: 'receipt_long' },
  { id: 'points', label: '포인트', icon: 'loyalty' },
  { id: 'posts', label: '내 게시글', icon: 'article' },
];

export default function MyPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<TabId>('orders');

  return (
    <div className="bg-background min-h-screen py-lg">
      <div className="max-w-max-width mx-auto px-gutter">
        {/* 프로필 헤더 */}
        <div className="bg-primary text-on-primary rounded-2xl p-lg mb-lg flex items-center gap-lg">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[32px] text-on-primary-container">person</span>
          </div>
          <div>
            <p className="font-headline-md text-headline-md font-bold">
              {user?.email.split('@')[0]}님
            </p>
            <p className="font-body-md text-body-md opacity-80">{user?.email}</p>
            <p className="font-label-md text-label-md mt-xs">
              보유 포인트: <span className="font-bold">{(user?.pointBalance ?? 0).toLocaleString()}P</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-lg">
          {/* 사이드바 */}
          <aside>
            <nav className="flex flex-col gap-xs">
              {TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-sm px-md py-sm rounded-xl font-body-md text-body-md transition-colors cursor-pointer text-left ${
                    tab === id
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* 콘텐츠 */}
          <main>
            {tab === 'orders' && <OrdersTab />}
            {tab === 'points' && <PointTab />}
            {tab === 'posts'  && <MyPostsTab />}
          </main>
        </div>
      </div>
    </div>
  );
}
