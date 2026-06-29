import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Order, OrderStatus, Product, Farm } from '../../types';
import { getFarmOrders, updateOrderStatus } from '../../api/order';
import { getProducts } from '../../api/product';
import { getMyFarm, updateMyFarm } from '../../api/farm';
import { useFarmSSE } from '../../hooks/useFarmSSE';
import useAuthStore from '../../store/authStore';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';

/* ── 사이드바 ──────────────────────────────────────────────────────────────── */
type Tab = 'dashboard' | 'orders' | 'info' | 'stats';

const NAV_ITEMS: { id: Tab | 'products'; label: string; icon: string }[] = [
  { id: 'dashboard', label: '대시보드',  icon: 'dashboard' },
  { id: 'products',  label: '상품 관리', icon: 'inventory_2' },
  { id: 'orders',    label: '주문 관리', icon: 'receipt_long' },
  { id: 'info',      label: '농가 정보', icon: 'storefront' },
  { id: 'stats',     label: '매출 통계', icon: 'bar_chart' },
];

function Sidebar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <aside className="w-full md:w-52 shrink-0">
      <nav className="flex flex-row md:flex-col gap-xs overflow-x-auto md:overflow-visible pb-xs md:pb-0">
        {NAV_ITEMS.map(({ id, label, icon }) =>
          id === 'products' ? (
            <Link
              key={id}
              to="/farm/products"
              className="flex items-center gap-sm px-md py-sm rounded-xl font-body-md text-body-md whitespace-nowrap transition-colors text-on-surface-variant hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </Link>
          ) : (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              className={`flex items-center gap-sm px-md py-sm rounded-xl font-body-md text-body-md whitespace-nowrap transition-colors cursor-pointer text-left ${
                tab === id
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </button>
          ),
        )}
      </nav>
    </aside>
  );
}

/* ── 주문 상태 전이 (배송 방식별 농가 다음 액션) ───────────────────────────── */
function farmerNextAction(order: Order): { next: OrderStatus; label: string } | null {
  if (order.deliveryMethod === 'PICKUP') {
    // 픽업: PAID → READY
    return order.status === 'PAID' ? { next: 'READY', label: '수령 준비 완료' } : null;
  }
  // 배송: PAID → PREPARING → SHIPPING → DELIVERED
  switch (order.status) {
    case 'PAID':      return { next: 'PREPARING', label: '상품 준비 시작' };
    case 'PREPARING': return { next: 'SHIPPING',  label: '배송 시작' };
    case 'SHIPPING':  return { next: 'DELIVERED', label: '배송 완료' };
    default:          return null;
  }
}

/* ── 대시보드 탭 ────────────────────────────────────────────────────────────── */
function DashboardTab({
  orders,
  products,
  loading,
  onStatusChange,
}: {
  orders: Order[];
  products: Product[];
  loading: boolean;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
}) {
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingCount = orders.filter((o) => o.status === 'PAID').length;

  const stats = [
    { label: '오늘 주문',    value: `${todayOrders.length}건`,           icon: 'shopping_bag',   color: 'bg-primary' },
    { label: '오늘 매출',    value: `${todayRevenue.toLocaleString()}P`, icon: 'payments',       color: 'bg-secondary' },
    { label: '판매 상품 수', value: `${products.length}개`,              icon: 'inventory_2',    color: 'bg-tertiary' },
    { label: '처리 대기',    value: `${pendingCount}건`,                  icon: 'pending_actions', color: 'bg-error' },
  ];

  if (loading) return <div className="flex justify-center py-xl"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="flex flex-col gap-lg">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {stats.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-outline-variant p-md">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-sm`}>
              <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
            <p className="font-headline-md text-headline-md text-on-surface font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* 신규 주문 테이블 */}
      <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
        <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">최근 주문</h2>
          <span className="font-label-sm text-label-sm text-on-surface-variant">최근 20건</span>
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-sm">receipt_long</span>
            <p className="font-body-md text-body-md text-on-surface-variant">아직 주문이 없어요</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  {['주문시각', '상품', '수량', '금액', '상태', '처리'].map((h) => (
                    <th key={h} className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {orders.slice(0, 20).map((order) => {
                  const nextAction = farmerNextAction(order);
                  const time = new Date(order.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                  const item = order.items[0];
                  return (
                    <tr key={order.orderId} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{time}</td>
                      <td className="px-md py-sm font-body-md text-body-md text-on-surface">
                        {item?.productName}
                        {order.items.length > 1 && (
                          <span className="ml-xs font-label-sm text-label-sm text-on-surface-variant">외 {order.items.length - 1}건</span>
                        )}
                      </td>
                      <td className="px-md py-sm font-body-md text-body-md text-on-surface">{item?.quantity}개</td>
                      <td className="px-md py-sm font-body-md text-body-md text-on-surface whitespace-nowrap">{order.totalPrice.toLocaleString()}P</td>
                      <td className="px-md py-sm"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-md py-sm">
                        {nextAction ? (
                          <Button
                            size="sm"
                            variant={nextAction.next === 'DELIVERED' ? 'outline' : 'primary'}
                            onClick={() => onStatusChange(order.orderId, nextAction.next)}
                          >
                            {nextAction.label}
                          </Button>
                        ) : (
                          <span className="font-label-sm text-label-sm text-outline">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 재고 현황 */}
      <div className="bg-white rounded-2xl border border-outline-variant p-lg">
        <div className="flex items-center justify-between mb-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">재고 현황</h2>
          <Link to="/farm/products" className="font-label-md text-label-md text-primary hover:underline">상품 관리 →</Link>
        </div>
        {products.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-md">등록된 상품이 없어요</p>
        ) : (
          <div className="flex flex-col gap-md">
            {products.map((p) => {
              const pct = p.stock > 0 ? Math.min((p.stock / 100) * 100, 100) : 0;
              const isLow = p.stock > 0 && p.stock <= 10;
              const isEmpty = p.stock === 0;
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-xs">
                    <span className="font-body-md text-body-md text-on-surface">{p.name}</span>
                    <span className={`font-label-md text-label-md font-semibold ${isEmpty ? 'text-error' : isLow ? 'text-secondary' : 'text-primary'}`}>
                      {isEmpty ? '품절' : isLow ? `${p.stock}개 (부족)` : `${p.stock}개`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isEmpty ? 'bg-error' : isLow ? 'bg-secondary' : 'bg-primary'}`}
                      style={{ width: `${Math.max(pct, isEmpty ? 0 : 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 주문 관리 탭 ────────────────────────────────────────────────────────────── */
function OrdersTab({
  orders,
  loading,
  onStatusChange,
}: {
  orders: Order[];
  loading: boolean;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
}) {
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  const statusOptions: { value: OrderStatus | ''; label: string }[] = [
    { value: '',         label: '전체' },
    { value: 'PENDING',  label: '결제대기' },
    { value: 'PAID',     label: '결제완료' },
    { value: 'SHIPPING', label: '배송중' },
    { value: 'DONE',     label: '배송완료' },
  ];

  if (loading) return <div className="flex justify-center py-xl"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap gap-xs">
        {statusOptions.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => setFilter(value)}
            className={`px-md py-xs rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
              filter === value ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
        {filtered.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-xl">해당하는 주문이 없어요</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  {['주문번호', '주문일시', '상품', '금액', '배송지', '상태', '처리'].map((h) => (
                    <th key={h} className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((order) => {
                  const st = STATUS_LABELS[order.status] ?? { label: order.status, color: 'text-on-surface' };
                  const nextAction = NEXT_STATUS[order.status as OrderStatus];
                  const date = new Date(order.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-md py-sm font-label-sm text-label-sm text-outline">#{order.id}</td>
                      <td className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{date}</td>
                      <td className="px-md py-sm font-body-md text-body-md text-on-surface max-w-[160px]">
                        <p className="line-clamp-1">{order.items.map((i) => i.productName).join(', ')}</p>
                      </td>
                      <td className="px-md py-sm font-body-md text-body-md text-on-surface whitespace-nowrap">{order.totalPrice.toLocaleString()}P</td>
                      <td className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant max-w-[120px]">
                        <p className="line-clamp-1">{order.deliveryAddress}</p>
                      </td>
                      <td className={`px-md py-sm font-label-md text-label-md font-semibold whitespace-nowrap ${st.color}`}>{st.label}</td>
                      <td className="px-md py-sm whitespace-nowrap">
                        {nextAction ? (
                          <Button size="sm" onClick={() => onStatusChange(order.id, nextAction.next)}>
                            {nextAction.label}
                          </Button>
                        ) : (
                          <span className="font-label-sm text-label-sm text-outline">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 농가 정보 탭 ────────────────────────────────────────────────────────────── */
const FARM_CATEGORIES = ['채소', '과일', '곡류', '축산', '수산', '기타'];
const CERTIFICATIONS = ['무농약', '유기농', 'GAP인증', '친환경'];

const splitTags = (value?: string | null): string[] =>
  value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];

function InfoTab() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const hydrate = (f: Farm) => {
    setName(f.name);
    setRegion(f.region);
    setCategories(splitTags(f.category));
    setCertifications(splitTags(f.certification));
    setDescription(f.description ?? '');
  };

  useEffect(() => {
    getMyFarm()
      .then(({ data }) => {
        setFarm(data.data);
        hydrate(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const handleSave = async () => {
    if (!name.trim())     { setError('농가명을 입력해주세요.'); return; }
    if (!region.trim())   { setError('지역을 입력해주세요.'); return; }
    if (categories.length === 0) { setError('카테고리를 1개 이상 선택해주세요.'); return; }

    setSaving(true);
    setError('');
    try {
      const { data } = await updateMyFarm({
        name: name.trim(),
        region: region.trim(),
        category: categories.join(','),
        certification: certifications.length > 0 ? certifications.join(',') : undefined,
        description: description.trim() || undefined,
      });
      setFarm(data.data);
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? '저장에 실패했어요.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (farm) hydrate(farm);
    setError('');
    setEditing(false);
  };

  if (loading) return <div className="flex justify-center py-xl"><LoadingSpinner size="lg" /></div>;
  if (!farm) return <p className="font-body-md text-body-md text-on-surface-variant py-xl text-center">농가 정보를 불러올 수 없어요</p>;

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING:  { label: '승인 대기', color: 'text-secondary' },
    APPROVED: { label: '승인됨',   color: 'text-primary' },
    REJECTED: { label: '반려됨',   color: 'text-error' },
  };
  const st = STATUS_MAP[farm.status] ?? { label: farm.status, color: 'text-on-surface' };

  const farmCategories = splitTags(farm.category);
  const farmCertifications = splitTags(farm.certification);

  return (
    <div className="bg-white rounded-2xl border border-outline-variant p-lg max-w-2xl">
      <div className="flex items-center justify-between mb-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">농가 정보</h2>
        <div className="flex items-center gap-md">
          <span className={`font-label-md text-label-md font-semibold ${st.color}`}>{st.label}</span>
          {!editing && (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>수정</Button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">농가명</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">지역</label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">카테고리 (복수 선택 가능)</label>
            <div className="flex flex-wrap gap-xs">
              {FARM_CATEGORIES.map((c) => {
                const active = categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategories((prev) => toggle(prev, c))}
                    className={`px-md py-xs rounded-full font-label-md text-label-md border transition-colors cursor-pointer ${
                      active
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">인증 (복수 선택 가능)</label>
            <div className="flex flex-wrap gap-xs">
              {CERTIFICATIONS.map((c) => {
                const active = certifications.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCertifications((prev) => toggle(prev, c))}
                    className={`px-md py-xs rounded-full font-label-md text-label-md border transition-colors cursor-pointer ${
                      active
                        ? 'bg-tertiary-container text-on-tertiary-container border-tertiary'
                        : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">소개</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
          <div className="flex gap-sm justify-end">
            <Button variant="outline" onClick={handleCancel}>취소</Button>
            <Button loading={saving} onClick={handleSave}>저장</Button>
          </div>
        </div>
      ) : (
        <dl className="flex flex-col gap-md">
          <div className="grid grid-cols-[100px_1fr] gap-md">
            <dt className="font-label-md text-label-md text-on-surface-variant">농가명</dt>
            <dd className="font-body-md text-body-md text-on-surface">{farm.name}</dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-md">
            <dt className="font-label-md text-label-md text-on-surface-variant">지역</dt>
            <dd className="font-body-md text-body-md text-on-surface">{farm.region}</dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-md">
            <dt className="font-label-md text-label-md text-on-surface-variant">카테고리</dt>
            <dd className="flex flex-wrap gap-xs">
              {farmCategories.length > 0 ? farmCategories.map((c) => (
                <span key={c} className="px-sm py-xs rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">{c}</span>
              )) : <span className="font-body-md text-body-md text-on-surface-variant">-</span>}
            </dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-md">
            <dt className="font-label-md text-label-md text-on-surface-variant">인증</dt>
            <dd className="flex flex-wrap gap-xs">
              {farmCertifications.length > 0 ? farmCertifications.map((c) => (
                <span key={c} className="px-sm py-xs rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm">{c}</span>
              )) : <span className="font-body-md text-body-md text-on-surface-variant">-</span>}
            </dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-md">
            <dt className="font-label-md text-label-md text-on-surface-variant">소개</dt>
            <dd className="font-body-md text-body-md text-on-surface">{farm.description ?? '-'}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}

/* ── 매출 통계 탭 ────────────────────────────────────────────────────────────── */
function StatsTab({ orders }: { orders: Order[] }) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const dayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === dateStr);
    return {
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + o.totalPrice, 0),
    };
  });

  const maxRevenue = Math.max(...last7.map((d) => d.revenue), 1);
  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
  const doneOrders = orders.filter((o) => o.status === 'DONE');

  return (
    <div className="flex flex-col gap-lg">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
        {[
          { label: '누적 매출',    value: `${totalRevenue.toLocaleString()}P` },
          { label: '완료 주문',    value: `${doneOrders.length}건` },
          { label: '평균 주문금액', value: doneOrders.length > 0 ? `${Math.round(totalRevenue / doneOrders.length).toLocaleString()}P` : '-' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-outline-variant p-md">
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">{label}</p>
            <p className="font-headline-md text-headline-md text-on-surface font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* 7일 매출 차트 */}
      <div className="bg-white rounded-2xl border border-outline-variant p-lg">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-lg">최근 7일 매출</h3>
        <div className="flex items-end gap-sm h-40">
          {last7.map(({ label, revenue, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant text-center">
                {revenue > 0 ? `${(revenue / 1000).toFixed(0)}k` : ''}
              </span>
              <div
                className="w-full bg-primary rounded-t-sm transition-all"
                style={{ height: `${(revenue / maxRevenue) * 120}px`, minHeight: revenue > 0 ? '4px' : '0' }}
                title={`${revenue.toLocaleString()}P / ${count}건`}
              />
              <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 신규 주문 토스트 ──────────────────────────────────────────────────────────── */
function OrderToasts() {
  const { connected, toasts, dismiss } = useFarmSSE();

  return (
    <>
      {/* SSE 연결 상태 */}
      <div className="flex items-center gap-xs">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-primary animate-pulse' : 'bg-outline'}`} />
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {connected ? '실시간 알림 연결됨' : '실시간 알림 연결 중...'}
        </span>
      </div>

      {/* 토스트 */}
      <div className="fixed bottom-lg right-lg z-50 flex flex-col gap-sm max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl shadow-lg border border-primary p-md flex items-start gap-sm pointer-events-auto animate-in slide-in-from-right"
          >
            <span className="material-symbols-outlined text-[20px] text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              notifications
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-label-md text-primary font-semibold">신규 주문!</p>
              <p className="font-body-md text-body-md text-on-surface">
                {t.productName} {t.quantity}개 · {t.totalPrice.toLocaleString()}P
              </p>
            </div>
            <button onClick={() => dismiss(t.id)} className="text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── 페이지 ───────────────────────────────────────────────────────────────── */
export default function FarmDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'FARMER') { navigate('/'); return; }

    Promise.all([
      getFarmOrders({ size: 50 }),
      getMyFarm(),
    ])
      .then(([ordersRes, farmRes]) => {
        setOrders(ordersRes.data.data.content);
        return getProducts({ farmId: farmRes.data.data.id, size: 100 });
      })
      .then(({ data }) => setProducts(data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      const { data } = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.data : o)));
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? '상태 변경에 실패했어요.');
    }
  };

  return (
    <div className="bg-background min-h-screen py-lg">
      <div className="max-w-max-width mx-auto px-gutter">
        {/* 헤더 */}
        <div className="bg-primary text-on-primary rounded-2xl p-lg mb-lg flex items-center justify-between">
          <div>
            <p className="font-label-md text-label-md opacity-80 mb-xs">농가 대시보드</p>
            <h1 className="font-headline-lg text-headline-lg font-bold">
              {user?.email.split('@')[0]} 농가
            </h1>
          </div>
          <OrderToasts />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[208px_1fr] gap-lg">
          <Sidebar tab={tab} setTab={setTab} />

          <main>
            {tab === 'dashboard' && (
              <DashboardTab
                orders={orders}
                products={products}
                loading={loading}
                onStatusChange={handleStatusChange}
              />
            )}
            {tab === 'orders' && (
              <OrdersTab
                orders={orders}
                loading={loading}
                onStatusChange={handleStatusChange}
              />
            )}
            {tab === 'info' && <InfoTab />}
            {tab === 'stats' && <StatsTab orders={orders} />}
          </main>
        </div>
      </div>
    </div>
  );
}
