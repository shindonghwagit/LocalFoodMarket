import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import api from '../../api/axios';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductData,
} from '../../api/product';
import { getMyFarm } from '../../api/farm';
import useAuthStore from '../../store/authStore';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/* ── 사이드바 (FarmDashboardPage와 동일한 구조) ───────────────────────────── */
const NAV_ITEMS = [
  { label: '대시보드',  icon: 'dashboard',       path: '/farm/dashboard' },
  { label: '상품 관리', icon: 'inventory_2',      path: '/farm/products' },
  { label: '주문 관리', icon: 'receipt_long',     path: '/farm/dashboard' },
  { label: '농가 정보', icon: 'storefront',       path: '/farm/dashboard' },
  { label: '매출 통계', icon: 'bar_chart',        path: '/farm/dashboard' },
];

function Sidebar() {
  return (
    <aside className="w-full md:w-52 shrink-0">
      <nav className="flex flex-row md:flex-col gap-xs overflow-x-auto md:overflow-visible pb-xs md:pb-0">
        {NAV_ITEMS.map(({ label, icon, path }) => {
          const isActive = label === '상품 관리';
          return (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-sm px-md py-sm rounded-xl font-body-md text-body-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/* ── 상품 등록/수정 모달 ──────────────────────────────────────────────────── */
const CATEGORIES = ['채소', '과일', '곡류', '유제품', '육류', '수산물', '기타'];

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}

function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const isEdit = !!product;
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductData>({
    name: product?.name ?? '',
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    category: product?.category ?? CATEGORIES[0],
    harvestDate: product?.harvestDate ?? '',
    description: product?.description ?? '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(product?.imageUrl ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('상품명을 입력해주세요.'); return; }
    if (form.price <= 0) { setError('가격을 올바르게 입력해주세요.'); return; }
    if (form.stock < 0) { setError('재고를 올바르게 입력해주세요.'); return; }

    setLoading(true);
    setError('');
    try {
      let res;
      if (image) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          if (v !== undefined && v !== '') fd.append(k, String(v));
        });
        fd.append('image', image);
        res = isEdit
          ? await api.patch<any>(`/products/${product!.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          : await api.post<any>('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = isEdit
          ? await updateProduct(product!.id, form)
          : await createProduct(form);
      }
      onSave(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? '저장에 실패했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-gutter bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-[36rem] p-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-lg">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            {isEdit ? '상품 수정' : '상품 등록'}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          {/* 이미지 */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">상품 이미지</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-40 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-sm cursor-pointer hover:border-primary hover:bg-primary-fixed transition-colors overflow-hidden"
            >
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant">add_photo_alternate</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">클릭하여 이미지 추가</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />
          </div>

          {/* 상품명 */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">상품명 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="예: 유기농 배추"
              maxLength={50}
              className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 카테고리 */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">카테고리 *</label>
            <div className="flex flex-wrap gap-xs">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, category: c }))}
                  className={`px-md py-xs rounded-full font-label-md text-label-md border transition-colors cursor-pointer ${
                    form.category === c
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 가격 / 재고 */}
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">가격 (원) *</label>
              <input
                type="number"
                min={0}
                value={form.price || ''}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                placeholder="0"
                className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">재고 (개) *</label>
              <input
                type="number"
                min={0}
                value={form.stock || ''}
                onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                placeholder="0"
                className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* 수확일 */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">수확일</label>
            <input
              type="date"
              value={form.harvestDate ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, harvestDate: e.target.value }))}
              className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 설명 */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">상품 소개</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              placeholder="상품에 대해 자세히 소개해주세요"
              className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {error && (
            <p className="font-body-md text-body-md text-error bg-error-container px-md py-sm rounded-lg">{error}</p>
          )}

          <div className="flex gap-sm justify-end">
            <Button type="button" variant="outline" onClick={onClose}>취소</Button>
            <Button type="submit" loading={loading}>{isEdit ? '수정 완료' : '등록하기'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── 삭제 확인 모달 ──────────────────────────────────────────────────────── */
function DeleteConfirmModal({
  product,
  onClose,
  onDelete,
}: {
  product: Product;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProduct(product.id);
      onDelete();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-gutter bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-[24rem] p-lg shadow-xl">
        <div className="flex flex-col items-center text-center gap-md">
          <span className="material-symbols-outlined text-[48px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
            delete_forever
          </span>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">상품을 삭제할까요?</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              <span className="font-semibold text-on-surface">{product.name}</span>을(를) 삭제하면<br />되돌릴 수 없어요.
            </p>
          </div>
          <div className="flex gap-sm w-full">
            <Button variant="outline" className="flex-1" onClick={onClose}>취소</Button>
            <Button variant="danger" className="flex-1" loading={loading} onClick={handleDelete}>삭제</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 페이지 ───────────────────────────────────────────────────────────────── */
export default function FarmProductManagePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    if (user?.role !== 'FARMER') { navigate('/'); return; }

    getMyFarm()
      .then(({ data }) => getProducts({ farmId: data.data.id, size: 100 }))
      .then(({ data }) => setProducts(data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleSave = (saved: Product) => {
    setProducts((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
    setModalMode(null);
    setSelectedProduct(null);
  };

  const handleDelete = () => {
    if (deleteTarget) setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="bg-background min-h-screen py-lg">
      <div className="max-w-max-width mx-auto px-gutter">
        {/* 헤더 */}
        <div className="bg-primary text-on-primary rounded-2xl p-lg mb-lg flex items-center justify-between">
          <div>
            <p className="font-label-md text-label-md opacity-80 mb-xs">농가 대시보드</p>
            <h1 className="font-headline-lg text-headline-lg font-bold">상품 관리</h1>
          </div>
          <Button
            onClick={() => { setSelectedProduct(null); setModalMode('create'); }}
            className="bg-on-primary text-primary hover:bg-primary-fixed"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            상품 등록
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[208px_1fr] gap-lg">
          <Sidebar />

          <main>
            {loading ? (
              <div className="flex justify-center py-xl"><LoadingSpinner size="lg" /></div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center py-xl text-center bg-white rounded-2xl border border-outline-variant">
                <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-md">inventory_2</span>
                <p className="font-headline-sm text-headline-sm text-on-surface mb-xs">등록된 상품이 없어요</p>
                <p className="font-body-md text-body-md text-on-surface-variant mb-lg">첫 상품을 등록해보세요</p>
                <Button onClick={() => { setSelectedProduct(null); setModalMode('create'); }}>
                  상품 등록하기
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
                <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    전체 상품 <span className="font-label-md text-label-md text-on-surface-variant ml-sm">{products.length}개</span>
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => { setSelectedProduct(null); setModalMode('create'); }}
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    추가
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-container-low">
                      <tr>
                        {['이미지', '상품명', '카테고리', '가격', '재고', '수확일', '관리'].map((h) => (
                          <th key={h} className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {products.map((p) => {
                        const isLow = p.stock > 0 && p.stock <= 10;
                        const isEmpty = p.stock === 0;
                        return (
                          <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-md py-sm">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center shrink-0">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">eco</span>
                                )}
                              </div>
                            </td>
                            <td className="px-md py-sm">
                              <p className="font-body-md text-body-md text-on-surface font-semibold">{p.name}</p>
                            </td>
                            <td className="px-md py-sm">
                              <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded-full">
                                {p.category}
                              </span>
                            </td>
                            <td className="px-md py-sm font-body-md text-body-md text-on-surface whitespace-nowrap">
                              {p.price.toLocaleString()}원
                            </td>
                            <td className="px-md py-sm whitespace-nowrap">
                              <span className={`font-label-md text-label-md font-semibold ${isEmpty ? 'text-error' : isLow ? 'text-secondary' : 'text-primary'}`}>
                                {isEmpty ? '품절' : `${p.stock}개`}
                              </span>
                              {isLow && !isEmpty && (
                                <span className="ml-xs font-label-sm text-label-sm text-secondary">⚠</span>
                              )}
                            </td>
                            <td className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                              {p.harvestDate ?? '-'}
                            </td>
                            <td className="px-md py-sm">
                              <div className="flex gap-xs">
                                <button
                                  onClick={() => { setSelectedProduct(p); setModalMode('edit'); }}
                                  className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                                  title="수정"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(p)}
                                  className="p-xs rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors cursor-pointer"
                                  title="삭제"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {(modalMode === 'create' || modalMode === 'edit') && (
        <ProductModal
          product={modalMode === 'edit' ? selectedProduct : null}
          onClose={() => { setModalMode(null); setSelectedProduct(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
