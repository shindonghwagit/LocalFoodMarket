import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Farm, Product, Review } from '../types';
import { getFarm } from '../api/farm';
import { getProducts } from '../api/product';
import { getReviews } from '../api/review';
import Badge from '../components/common/Badge';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const splitTags = (value?: string | null): string[] =>
  value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];

/* ── 별점 표시 ────────────────────────────────────────────────────────────── */
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const textSize = size === 'sm' ? 'text-[16px]' : 'text-[20px]';
  return (
    <div className="flex items-center gap-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${textSize} ${
            i < Math.round(rating) ? 'text-secondary-container' : 'text-outline-variant'
          }`}
          style={{ fontVariationSettings: i < Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

/* ── 리뷰 카드 ────────────────────────────────────────────────────────────── */
function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-outline-variant p-md">
      <div className="flex items-start justify-between mb-sm">
        <div className="flex flex-col gap-xs">
          <StarRating rating={review.rating} size="sm" />
          {review.productName && (
            <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-xs py-[2px] rounded w-fit">
              {review.productName}
            </span>
          )}
        </div>
        <span className="font-label-sm text-label-sm text-outline">{date}</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface">{review.content}</p>
      <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">
        {review.authorEmail
          ? review.authorEmail.replace(/(.{2}).*(@.*)/, '$1***$2')
          : '구매자'}
      </p>
    </div>
  );
}

/* ── 페이지 ───────────────────────────────────────────────────────────────── */
export default function FarmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const farmId = Number(id);

  const [farm, setFarm] = useState<Farm | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!farmId) return;

    Promise.all([
      getFarm(farmId),
      getProducts({ farmId, size: 8 }),
      getReviews({ farmId, size: 6 }),
    ])
      .then(([farmRes, productsRes, reviewsRes]) => {
        setFarm(farmRes.data.data);
        setProducts(productsRes.data.data.content);
        setReviews(reviewsRes.data.data.content);
      })
      .catch(() => setError('농가 정보를 불러오는 데 실패했어요.'))
      .finally(() => setLoading(false));
  }, [farmId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-md px-gutter text-center">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant">error</span>
        <p className="font-headline-sm text-headline-sm text-on-surface">{error || '농가를 찾을 수 없어요'}</p>
        <Link
          to="/farms"
          className="font-body-md text-body-md text-primary hover:underline"
        >
          농가 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const avgRating = farm.averageRating ?? 0;

  return (
    <div className="bg-background min-h-screen">
      {/* 히어로 */}
      <div className="bg-primary text-on-primary">
        <div className="max-w-max-width mx-auto px-gutter py-xl">
          <Link
            to="/farms"
            className="inline-flex items-center gap-xs font-label-md text-label-md text-on-primary/70 hover:text-on-primary mb-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            농가 목록
          </Link>

          <div className="flex flex-col md:flex-row gap-lg items-start">
            {/* 농가 아이콘 */}
            <div className="w-24 h-24 bg-primary-container rounded-2xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[48px] text-on-primary-container">
                agriculture
              </span>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-sm mb-sm">
                <h1 className="font-headline-lg text-headline-lg">{farm.name}</h1>
                {splitTags(farm.certification).map((c) => (
                  <Badge key={c} label={c} />
                ))}
                {farm.status === 'APPROVED' && (
                  <span className="flex items-center gap-xs font-label-sm text-label-sm text-on-primary/80">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    승인 농가
                  </span>
                )}
              </div>

              <div className="font-body-lg text-body-lg text-on-primary/80 flex flex-wrap items-center gap-xs mb-md">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
                <span>{farm.region}</span>
                <span className="mx-xs text-on-primary/40">•</span>
                <div className="flex flex-wrap gap-xs">
                  {splitTags(farm.category).map((c) => (
                    <span key={c} className="bg-primary-container text-on-primary-container px-sm py-xs rounded-full font-label-sm text-label-sm">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* 통계 */}
              <div className="flex flex-wrap gap-lg">
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center gap-xs">
                    <StarRating rating={avgRating} size="sm" />
                    <span className="font-headline-sm text-headline-sm">
                      {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-primary/70">
                    리뷰 {farm.reviewCount ?? 0}개
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="font-headline-sm text-headline-sm">{products.length}</span>
                  <span className="font-label-sm text-label-sm text-on-primary/70">판매 상품</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-max-width mx-auto px-gutter py-xl">

        {/* 농가 소개 */}
        {farm.description && (
          <section className="mb-xl">
            <h2 className="font-headline-md text-headline-md text-primary mb-md">농가 소개</h2>
            <div className="bg-white rounded-xl border border-outline-variant p-lg">
              <p className="font-body-lg text-body-lg text-on-surface leading-relaxed whitespace-pre-line">
                {farm.description}
              </p>
            </div>
          </section>
        )}

        {/* 판매 상품 */}
        <section className="mb-xl">
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-headline-md text-headline-md text-primary">판매 상품</h2>
            <span className="font-label-md text-label-md text-on-surface-variant">
              {products.length}개
            </span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-lg text-center bg-white rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-sm">
                inventory_2
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                등록된 상품이 없어요
              </p>
            </div>
          )}
        </section>

        {/* 구매 리뷰 */}
        <section>
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-headline-md text-headline-md text-primary">구매 리뷰</h2>
            {avgRating > 0 && (
              <div className="flex items-center gap-sm">
                <StarRating rating={avgRating} />
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  {avgRating.toFixed(1)}
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant">
                  ({farm.reviewCount ?? 0}개)
                </span>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-lg text-center bg-white rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-sm">
                rate_review
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                아직 리뷰가 없어요. 첫 번째 구매 후기를 남겨보세요!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
