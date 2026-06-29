import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import type { DeliveryMethod, Farm, Product } from '../types';
import { getProduct } from '../api/product';
import { createOrder } from '../api/order';
import { getFarm } from '../api/farm';
import { searchAddress } from '../api/address';
import type { AddressResult } from '../api/address';
import { useStockSSE } from '../hooks/useStockSSE';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

/* ── 주소 검색 모달 ─────────────────────────────────────────────────────────── */
function AddressModal({
  onSelect,
  onClose,
}: {
  onSelect: (addr: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await searchAddress(query);
      setResults(data.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-gutter bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-[32rem] p-lg shadow-xl">
        <div className="flex items-center justify-between mb-md">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">주소 검색</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-sm mb-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 강남구 테헤란로, 삼성동 159"
            className="flex-1 px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" loading={loading} size="sm">검색</Button>
        </form>

        <div className="max-h-60 overflow-y-auto flex flex-col gap-xs">
          {results.length === 0 && !loading && !searched && (
            <p className="font-body-md text-body-md text-on-surface-variant text-center py-md">
              구·동·도로명까지 입력하면 더 잘 찾아요
            </p>
          )}
          {results.length === 0 && !loading && searched && (
            <p className="font-body-md text-body-md text-on-surface-variant text-center py-md">
              검색 결과가 없어요. 더 구체적인 주소로 다시 시도해주세요.
            </p>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => onSelect(r.addressName)}
              className="text-left px-md py-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <p className="font-body-md text-body-md text-on-surface">{r.addressName}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 페이지 ───────────────────────────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, setUser } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [buyerNote, setBuyerNote] = useState('');
  const [farm, setFarm] = useState<Farm | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    getProduct(productId)
      .then(({ data }) => {
        setProduct(data.data);
        // 픽업 수령 장소(농가 주소) 표시용
        getFarm(data.data.farmId)
          .then(({ data: f }) => setFarm(f.data))
          .catch(() => {});
      })
      .catch(() => setError('상품 정보를 불러오는 데 실패했어요.'))
      .finally(() => setLoading(false));
  }, [productId]);

  const stock = useStockSSE(productId, product?.stock ?? 0);
  const maxStock = product?.stock ?? 0;
  const stockPct = maxStock > 0 ? Math.min((stock / maxStock) * 100, 100) : 0;

  const isLoggedIn = isAuthenticated && !!user;
  const totalPrice = (product?.price ?? 0) * quantity;
  const hasEnoughPoints = (user?.pointBalance ?? 0) >= totalPrice;
  const fullAddress = detailAddress ? `${address} ${detailAddress}` : address;
  // 픽업 수령 장소 = 농가 주소(지역). 농가 정보를 못 불러오면 농가명으로 대체.
  const pickupLocation = farm ? `${farm.name} (${farm.region})` : product?.farmName ?? '';

  const handleOrder = async () => {
    if (!isLoggedIn) { navigate('/login', { state: { from: location.pathname } }); return; }
    if (quantity > stock) { setOrderError('재고가 부족해요.'); return; }
    if (!hasEnoughPoints) { setOrderError('포인트가 부족해요.'); return; }

    if (deliveryMethod === 'DELIVERY' && !address) {
      setOrderError('배송지를 입력해주세요.');
      return;
    }
    if (deliveryMethod === 'PICKUP' && !pickupTime) {
      setOrderError('수령 희망 시간을 선택해주세요.');
      return;
    }

    setOrdering(true);
    setOrderError('');
    try {
      const { data } = await createOrder({
        deliveryMethod,
        items: [{ productId, quantity }],
        buyerNote: buyerNote.trim() || null,
        ...(deliveryMethod === 'DELIVERY'
          ? { deliveryAddress: fullAddress }
          : { pickupLocation, pickupTime }),
      });
      const remaining = data.data.remainingPoint;
      if (user && typeof remaining === 'number') {
        setUser({ ...user, pointBalance: remaining });
      }
      setOrderSuccess(true);
    } catch (err: any) {
      setOrderError(err?.response?.data?.error?.message ?? '주문에 실패했어요. 다시 시도해주세요.');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-xl">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error || !product) return (
    <div className="flex flex-col items-center py-xl gap-md text-center px-gutter">
      <span className="material-symbols-outlined text-[64px] text-on-surface-variant">error</span>
      <p className="font-headline-sm text-headline-sm text-on-surface">{error || '상품을 찾을 수 없어요'}</p>
      <Link to="/farms" className="text-primary hover:underline font-body-md text-body-md">농가 목록으로</Link>
    </div>
  );

  if (orderSuccess) return (
    <div className="max-w-[28rem] mx-auto px-gutter py-xl text-center">
      <div className="bg-white rounded-2xl border border-outline-variant p-lg">
        <span className="material-symbols-outlined text-[64px] text-primary mb-md block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">주문 완료!</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
          {product.name} {quantity}개 주문이 완료됐어요.
        </p>
        <div className="flex gap-sm">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/mypage')}>주문 내역</Button>
          <Button className="flex-1" onClick={() => navigate('/farms')}>쇼핑 계속</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background py-lg">
      <div className="max-w-max-width mx-auto px-gutter">
        {/* 뒤로가기 */}
        <Link to={`/farms/${product.farmId}`}
          className="inline-flex items-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-primary mb-lg transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {product.farmName}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
          {/* 왼쪽: 이미지 */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container-high flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[96px] text-on-surface-variant">eco</span>
            )}
          </div>

          {/* 오른쪽: 정보 + 주문 */}
          <div className="flex flex-col gap-md">
            {/* 헤더 */}
            <div>
              <div className="flex items-center gap-sm mb-xs flex-wrap">
                <Link to={`/farms/${product.farmId}`}
                  className="font-label-md text-label-md text-primary hover:underline">
                  {product.farmName}
                </Link>
                {product.category && (
                  <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded-full">
                    {product.category}
                  </span>
                )}
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">{product.name}</h1>
              {product.harvestDate && (
                <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  수확일: {product.harvestDate}
                </p>
              )}
            </div>

            {/* 가격 */}
            <div className="py-md border-t border-b border-outline-variant">
              <span className="font-headline-xl text-headline-xl text-on-surface">
                {product.price.toLocaleString()}원
              </span>
            </div>

            {/* 실시간 재고 */}
            <div>
              <div className="flex justify-between items-center mb-xs">
                <span className="font-label-md text-label-md text-on-surface-variant">실시간 재고</span>
                <span className={`font-label-md text-label-md font-semibold ${stock > 0 ? 'text-primary' : 'text-error'}`}>
                  {stock > 0 ? `${stock}개 남음` : '품절'}
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stockPct > 30 ? 'bg-primary' : stockPct > 10 ? 'bg-secondary-container' : 'bg-error'}`}
                  style={{ width: `${stockPct}%` }}
                />
              </div>
            </div>

            {/* 수량 선택 */}
            <div className="flex items-center gap-md">
              <span className="font-body-md text-body-md text-on-surface-variant">수량</span>
              <div className="flex items-center gap-sm border border-outline-variant rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="w-10 text-center font-body-md text-body-md font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={quantity >= stock}
                  className="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <span className="font-body-md text-body-md text-on-surface font-semibold">
                합계: {totalPrice.toLocaleString()}원
              </span>
            </div>

            {/* 수령 방법 선택 */}
            <div className="flex flex-col gap-xs">
              <span className="font-label-md text-label-md text-on-surface-variant">수령 방법</span>
              <div className="grid grid-cols-2 gap-sm">
                {([
                  { value: 'DELIVERY', label: '택배 배송', icon: 'local_shipping' },
                  { value: 'PICKUP', label: '직접 픽업', icon: 'storefront' },
                ] as { value: DeliveryMethod; label: string; icon: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setDeliveryMethod(opt.value); setOrderError(''); }}
                    className={`flex items-center justify-center gap-xs px-md py-sm rounded-lg border font-body-md text-body-md transition-colors cursor-pointer ${
                      deliveryMethod === opt.value
                        ? 'border-primary bg-primary-fixed text-primary font-semibold'
                        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 배송 선택 시: 배송지 */}
            {deliveryMethod === 'DELIVERY' && (
              <div className="flex flex-col gap-xs">
                <span className="font-label-md text-label-md text-on-surface-variant">배송지</span>
                <div className="flex gap-sm">
                  <input
                    readOnly
                    value={address}
                    placeholder="주소를 검색해주세요"
                    className="flex-1 px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md bg-surface-container-low cursor-pointer"
                    onClick={() => setShowAddressModal(true)}
                  />
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-md py-sm bg-surface-container border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    검색
                  </button>
                </div>
                {address && (
                  <input
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    placeholder="상세 주소 (동/호수 등)"
                    className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>
            )}

            {/* 픽업 선택 시: 수령 장소 + 수령 희망 시간 */}
            {deliveryMethod === 'PICKUP' && (
              <div className="flex flex-col gap-sm">
                <div className="flex flex-col gap-xs">
                  <span className="font-label-md text-label-md text-on-surface-variant">수령 장소</span>
                  <div className="flex items-center gap-xs px-md py-sm bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">storefront</span>
                    {pickupLocation || '농가 정보를 불러오는 중...'}
                  </div>
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="font-label-md text-label-md text-on-surface-variant">수령 희망 시간</span>
                  <input
                    type="datetime-local"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* 요청사항 */}
            <div className="flex flex-col gap-xs">
              <span className="font-label-md text-label-md text-on-surface-variant">요청사항 (선택)</span>
              <textarea
                value={buyerNote}
                onChange={(e) => setBuyerNote(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder={deliveryMethod === 'PICKUP' ? '예: 도착 10분 전 연락드릴게요' : '예: 부재 시 경비실에 맡겨주세요'}
                className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 포인트 */}
            {isLoggedIn && user && (
              <div className="bg-surface-container-low rounded-xl p-md flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>loyalty</span>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">보유 포인트</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface">
                      {user.pointBalance.toLocaleString()}P
                    </p>
                  </div>
                </div>
                {!hasEnoughPoints && (
                  <span className="font-label-sm text-label-sm text-error">
                    {(totalPrice - user.pointBalance).toLocaleString()}P 부족
                  </span>
                )}
              </div>
            )}

            {/* 주문 에러 */}
            {orderError && (
              <p className="font-body-md text-body-md text-error bg-error-container px-md py-sm rounded-lg">{orderError}</p>
            )}

            {/* 주문 버튼 */}
            <Button
              size="lg"
              className="w-full"
              disabled={stock === 0 || (isLoggedIn && !hasEnoughPoints)}
              loading={ordering}
              onClick={handleOrder}
            >
              {!isLoggedIn
                ? '로그인 후 주문하기'
                : stock === 0
                ? '품절'
                : `포인트로 주문하기 (${totalPrice.toLocaleString()}P)`}
            </Button>

            {/* 상품 설명 */}
            {product.description && (
              <div className="border-t border-outline-variant pt-md">
                <p className="font-label-md text-label-md text-on-surface-variant mb-xs">상품 소개</p>
                <p className="font-body-md text-body-md text-on-surface whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddressModal && (
        <AddressModal
          onSelect={(addr) => { setAddress(addr); setShowAddressModal(false); }}
          onClose={() => setShowAddressModal(false)}
        />
      )}
    </div>
  );
}
