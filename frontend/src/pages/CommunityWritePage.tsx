import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { PostCategory, Order } from '../types';
import { createPost } from '../api/post';
import { getOrders } from '../api/order';
import Button from '../components/common/Button';

const CATEGORIES: PostCategory[] = ['구매후기', '레시피', '정보공유', '질문'];
const MAX_IMAGES = 5;

export default function CommunityWritePage() {
  const navigate = useNavigate();

  const [category, setCategory] = useState<PostCategory>('구매후기');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [taggedProductIds, setTaggedProductIds] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getOrders().then(({ data }) => setOrders(data.data.content)).catch(() => {});
  }, []);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - images.length;
    const added = files.slice(0, remaining);
    setImages((prev) => [...prev, ...added]);
    setPreviews((prev) => [...prev, ...added.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const toggleProduct = (productId: number) => {
    setTaggedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await createPost({ title, content, category, productIds: taggedProductIds, images });
      navigate(`/community/${data.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? '게시글 등록에 실패했어요.');
    } finally {
      setLoading(false);
    }
  };

  // 주문에서 고유 상품 목록 추출
  const purchasedProducts = orders.flatMap((o) =>
    o.items.map((i) => ({ id: i.productId, name: i.productName })),
  ).filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx);

  return (
    <div className="bg-background py-lg">
      <div className="max-w-[48rem] mx-auto px-gutter">
        <Link to="/community" className="inline-flex items-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-primary mb-lg transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          커뮤니티
        </Link>

        <h1 className="font-headline-md text-headline-md text-on-surface mb-lg">글쓰기</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          {/* 카테고리 */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">카테고리</label>
            <div className="flex flex-wrap gap-sm">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-md py-xs rounded-full font-label-md text-label-md transition-colors cursor-pointer border ${
                    category === c
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">제목 *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              maxLength={100}
              className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="font-label-sm text-label-sm text-outline text-right">{title.length}/100</p>
          </div>

          {/* 내용 */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">내용 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력해주세요"
              rows={10}
              className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* 이미지 업로드 */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">
              이미지 ({images.length}/{MAX_IMAGES})
            </label>
            <div className="flex flex-wrap gap-sm">
              {previews.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-xs right-xs w-6 h-6 bg-error text-on-error rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-xs text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <span className="font-label-sm text-label-sm">추가</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleImageAdd} />
          </div>

          {/* 상품 태그 */}
          {purchasedProducts.length > 0 && (
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">구매 상품 태그</label>
              <div className="flex flex-wrap gap-sm">
                {purchasedProducts.map((p) => {
                  const selected = taggedProductIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      className={`flex items-center gap-xs px-md py-xs rounded-full border font-label-md text-label-md transition-colors cursor-pointer ${
                        selected
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">eco</span>
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="font-body-md text-body-md text-error bg-error-container px-md py-sm rounded-lg">{error}</p>
          )}

          <div className="flex gap-sm justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/community')}>취소</Button>
            <Button type="submit" loading={loading}>게시글 등록</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
