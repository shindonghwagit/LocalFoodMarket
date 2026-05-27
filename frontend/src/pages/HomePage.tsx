import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Farm, Product, Post } from '../types';
import { getFarms } from '../api/farm';
import { getProducts } from '../api/product';
import { getPosts } from '../api/post';
import FarmCard from '../components/farm/FarmCard';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

/* ── 히어로 ──────────────────────────────────────────────────────────────── */
function HeroSection() {
  const [keyword, setKeyword] = useState('');
  return (
    <section className="relative h-[640px] flex items-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80"
        alt="농장 배경"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 hero-gradient" />
      <div className="relative max-w-max-width mx-auto px-gutter w-full text-center">
        <h1 className="font-headline-xl text-headline-xl text-on-primary mb-md max-w-3xl mx-auto leading-tight">
          농장의 신선함을 식탁으로 직접
        </h1>
        <p className="font-body-lg text-body-lg text-on-primary opacity-90 mb-lg max-w-2xl mx-auto">
          전국의 우수한 농가들과 직접 연결되어, 오늘 수확한 가장 신선한 식재료를 경험해보세요.
        </p>
        <div className="max-w-3xl mx-auto glass-card p-sm rounded-xl shadow-lg flex flex-col md:flex-row gap-sm">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="농가명, 지역, 상품명 검색"
              className="w-full pl-xl pr-md py-sm bg-surface-container-low border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body-md text-body-md"
            />
          </div>
          <Link
            to={`/farms?keyword=${encodeURIComponent(keyword)}`}
            className="bg-secondary-container text-on-secondary-container px-xl py-sm rounded-lg font-headline-sm text-headline-sm font-bold hover:bg-secondary hover:text-on-secondary transition-colors text-center"
          >
            검색하기
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 가치 제안 ────────────────────────────────────────────────────────────── */
function ValuesSection() {
  const values = [
    {
      icon: 'local_shipping',
      title: '직거래로 더 신선하게',
      desc: '유통 단계를 획기적으로 줄여, 어제까지 밭에 있던 채소를 오늘 배송합니다.',
    },
    {
      icon: 'verified_user',
      title: '인증된 지역 농가',
      desc: '엄격한 신선도 기준과 친환경 인증을 통과한 전국 우수 농가.',
      filled: true,
    },
    {
      icon: 'loyalty',
      title: '포인트 혜택',
      desc: '구매할 때마다 쌓이는 포인트로 다음 쇼핑도 즐겁게, 농가 응원도 함께.',
    },
  ];

  return (
    <section className="py-xl max-w-max-width mx-auto px-gutter">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {values.map((v) => (
          <div key={v.title} className="flex flex-col items-center text-center p-md">
            <div className="w-16 h-16 bg-primary-fixed flex items-center justify-center rounded-full text-primary mb-md">
              <span
                className="material-symbols-outlined text-[32px]"
                style={v.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {v.icon}
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">{v.title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 인기 농가 ────────────────────────────────────────────────────────────── */
function FarmsSection() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFarms({ size: 3 })
      .then((res) => setFarms(res.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-xl bg-surface-container-low">
      <div className="max-w-max-width mx-auto px-gutter">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">이달의 추천 농가</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              열정과 진심을 담아 기르는 우리 동네 숨은 명인들
            </p>
          </div>
          <Link
            to="/farms"
            className="text-primary font-label-md text-label-md flex items-center gap-xs hover:opacity-70 transition-opacity"
          >
            전체보기
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-lg">
            <LoadingSpinner size="lg" />
          </div>
        ) : farms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
            {farms.map((farm) => (
              <FarmCard key={farm.id} farm={farm} />
            ))}
          </div>
        ) : (
          <div className="text-center py-lg">
            <p className="font-body-md text-body-md text-on-surface-variant">
              등록된 농가가 없습니다.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── 오늘의 신선 상품 ─────────────────────────────────────────────────────── */
const CATEGORIES = ['전체', '채소', '과일', '곡류', '유제품'];

function ProductsSection() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('전체');

  useEffect(() => {
    getProducts({ size: 8 })
      .then((res) => setAllProducts(res.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === '전체'
      ? allProducts.slice(0, 4)
      : allProducts.filter((p) => p.category === activeCategory).slice(0, 4);

  return (
    <section className="py-xl max-w-max-width mx-auto px-gutter">
      <div className="flex items-center gap-md mb-lg flex-wrap">
        <h2 className="font-headline-lg text-headline-lg text-primary">오늘의 신선 배송</h2>
        <div className="flex gap-sm overflow-x-auto pb-xs">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-md py-xs rounded-full font-label-md text-label-md cursor-pointer transition-colors whitespace-nowrap ${
                activeCategory === c
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-lg">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-lg">
          <p className="font-body-md text-body-md text-on-surface-variant">
            해당 카테고리의 상품이 없습니다.
          </p>
        </div>
      )}

      <div className="text-center mt-lg">
        <Link
          to="/farms"
          className="inline-flex items-center gap-xs font-body-md text-body-md text-primary border border-primary px-lg py-sm rounded-full hover:bg-primary-fixed transition-colors"
        >
          더 많은 상품 보기
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </section>
  );
}

/* ── 커뮤니티 ─────────────────────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  '레시피': 'bg-secondary text-on-secondary',
  '구매후기': 'bg-primary text-on-primary',
  '정보공유': 'bg-tertiary text-on-tertiary',
  '질문': 'bg-surface-dim text-on-surface',
};

function CommunitySection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts({ size: 3 })
      .then((res) => setPosts(res.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-xl bg-primary text-on-primary">
      <div className="max-w-max-width mx-auto px-gutter">
        <div className="flex flex-col md:flex-row justify-between items-center mb-lg gap-md text-center md:text-left">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-primary">
              커뮤니티 하이라이트
            </h2>
            <p className="font-body-md text-body-md opacity-80">
              이웃들의 생생한 후기와 제철 식재료 레시피
            </p>
          </div>
          <Link
            to="/community"
            className="bg-on-primary text-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-colors shrink-0"
          >
            더 많은 이야기 보기
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-lg">
            <LoadingSpinner size="lg" className="border-on-primary border-t-transparent" />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/community/${post.id}`}
                className="glass-card text-on-surface rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all block"
              >
                {post.imageUrls.length > 0 && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.imageUrls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute top-sm right-sm px-sm py-xs rounded text-label-sm font-label-sm ${
                        CATEGORY_COLORS[post.category] ?? 'bg-primary text-on-primary'
                      }`}
                    >
                      {post.category}
                    </div>
                  </div>
                )}
                <div className="p-md">
                  {post.imageUrls.length === 0 && (
                    <span
                      className={`inline-block mb-sm px-sm py-xs rounded text-label-sm font-label-sm ${
                        CATEGORY_COLORS[post.category] ?? 'bg-primary text-on-primary'
                      }`}
                    >
                      {post.category}
                    </span>
                  )}
                  <h4 className="font-headline-sm text-headline-sm mb-sm line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                    {post.content}
                  </p>
                  <div className="mt-md flex items-center gap-sm text-on-surface-variant">
                    <span className="flex items-center gap-xs font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px]">favorite</span>
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-xs font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      {post.viewCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-lg">
            <p className="font-body-md text-body-md opacity-80">
              아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── 스크롤 탑 버튼 ───────────────────────────────────────────────────────── */
function ScrollTopButton() {
  return (
    <div className="fixed bottom-gutter right-gutter">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-12 h-12 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary-container transition-colors cursor-pointer"
        aria-label="맨 위로 이동"
      >
        <span className="material-symbols-outlined">arrow_upward</span>
      </button>
    </div>
  );
}

/* ── 페이지 조합 ─────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ValuesSection />
      <FarmsSection />
      <ProductsSection />
      <CommunitySection />
      <ScrollTopButton />
    </>
  );
}
