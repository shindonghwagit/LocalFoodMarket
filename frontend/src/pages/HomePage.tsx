import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ── 히어로 ──────────────────────────────────────────────────────────────── */
function HeroSection() {
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
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              placeholder="농가명, 지역, 상품명 검색"
              className="w-full pl-xl pr-md py-sm bg-surface-container-low border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body-md text-body-md"
            />
          </div>
          <Link
            to="/products"
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
      desc: '엄격한 신선도 기준과 친환경 인증을 통과한 전국 1,200여 곳의 정직한 농가.',
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

/* ── 추천 농가 ────────────────────────────────────────────────────────────── */
function FarmersSection() {
  const smallFarmers = [
    {
      img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
      name: '해솔농원 이강민',
      region: '경기 양평 | 무농약 쌈채소',
      rating: '4.8',
      subs: '2k+',
    },
    {
      img: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80',
      name: '과수원길 장동욱',
      region: '경북 영주 | 꿀사과, 배',
      rating: '5.0',
      subs: '1.5k+',
    },
    {
      img: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&q=80',
      name: '꿀비농장 최은희',
      region: '전남 곡성 | 천연 벌꿀',
      rating: '4.9',
      subs: '800+',
    },
    {
      img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=80',
      name: '산들바람 박지우',
      region: '강원 평창 | 고랭지 배추',
      rating: '4.7',
      subs: '1.2k+',
    },
  ];

  return (
    <section className="py-xl bg-surface-container-low">
      <div className="max-w-max-width mx-auto px-gutter">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">이달의 추천 농가</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">열정과 진심을 담아 기르는 우리 동네 숨은 명인들</p>
          </div>
          <Link to="/farms" className="text-primary font-label-md text-label-md flex items-center gap-xs">
            전체보기 <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          {/* 대표 농가 카드 */}
          <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl bg-white shadow-sm hover:-translate-y-2 transition-all duration-300">
            <img
              src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80"
              alt="대표 농가"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-lg text-on-primary">
              <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full text-label-sm mb-sm inline-block font-label-sm">
                Best Farmer
              </span>
              <h3 className="font-headline-lg text-headline-lg">청솔농장 김순복</h3>
              <div className="flex items-center gap-sm mt-xs">
                <div className="flex items-center text-secondary-container">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-md text-label-md ml-xs">4.9</span>
                </div>
                <span className="font-body-md text-body-md opacity-80">| 충남 아산, 무농약 채소</span>
              </div>
            </div>
          </div>

          {/* 소형 농가 카드 */}
          {smallFarmers.map((f) => (
            <div key={f.name} className="bg-white rounded-xl shadow-sm p-sm group hover:-translate-y-1 transition-all">
              <div className="aspect-square rounded-lg overflow-hidden mb-sm relative">
                <img src={f.img} alt={f.name} className="w-full h-full object-cover" />
                <div className="absolute top-sm right-sm bg-white/90 p-xs rounded-full">
                  <span className="material-symbols-outlined text-primary">favorite</span>
                </div>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">{f.name}</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">{f.region}</p>
              <div className="mt-sm flex justify-between items-center">
                <span className="text-secondary font-bold font-label-md text-label-md">★ {f.rating}</span>
                <span className="text-primary font-label-sm text-label-sm">구독자 {f.subs}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 오늘의 신선 배송 ──────────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
    badge: '신선지수 98%',
    name: '강원도 수미 감자 (3kg)',
    farm: '김씨네 감자밭',
    price: '12,500원',
    category: '채소',
  },
  {
    img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80',
    badge: '신선지수 95%',
    name: '친환경 흙당근 (1kg)',
    farm: '싱싱농원',
    price: '4,900원',
    category: '채소',
  },
  {
    img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80',
    badge: '신선지수 99%',
    name: '논산 설향 딸기 (500g)',
    farm: '베리베리팜',
    price: '18,000원',
    category: '과일',
  },
  {
    img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    badge: '신선지수 92%',
    name: '당일착유 수제 요거트',
    farm: '목장이야기',
    price: '6,500원',
    category: '유제품',
  },
];

const CATEGORIES = ['전체', '채소', '과일', '곡류'];

function ProductsSection() {
  const [active, setActive] = useState('전체');
  const filtered = active === '전체' ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);

  return (
    <section className="py-xl max-w-max-width mx-auto px-gutter">
      <div className="flex items-center gap-md mb-lg flex-wrap">
        <h2 className="font-headline-lg text-headline-lg text-primary">오늘의 신선 배송</h2>
        <div className="flex gap-sm overflow-x-auto pb-xs">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-md py-xs rounded-full font-label-md text-label-md cursor-pointer transition-colors ${
                active === c
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {filtered.map((p) => (
          <div key={p.name} className="bg-white rounded-xl shadow-sm overflow-hidden group">
            <div className="relative aspect-[4/5]">
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-sm left-sm bg-secondary-container text-on-secondary-container px-sm py-1 rounded font-label-sm text-label-sm">
                {p.badge}
              </div>
            </div>
            <div className="p-md">
              <h5 className="font-headline-sm text-headline-sm mb-xs">{p.name}</h5>
              <p className="font-label-md text-label-md text-primary mb-md">{p.farm}</p>
              <div className="flex justify-between items-center">
                <span className="font-headline-md text-headline-md text-on-surface">{p.price}</span>
                <button className="bg-surface-container-low p-xs rounded-full hover:bg-primary-fixed transition-colors">
                  <span className="material-symbols-outlined text-primary">add_shopping_cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 커뮤니티 ─────────────────────────────────────────────────────────────── */
function CommunitySection() {
  return (
    <section className="py-xl bg-primary text-on-primary">
      <div className="max-w-max-width mx-auto px-gutter">
        <div className="flex flex-col md:flex-row justify-between items-center mb-lg gap-md text-center md:text-left">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-primary">커뮤니티 하이라이트</h2>
            <p className="font-body-md text-body-md opacity-80">이웃들의 생생한 후기와 제철 식재료 레시피</p>
          </div>
          <Link
            to="/posts"
            className="bg-on-primary text-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-colors"
          >
            더 많은 이야기 보기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {/* 레시피 카드 */}
          <div className="glass-card text-on-surface rounded-xl overflow-hidden shadow-lg">
            <div className="relative h-48">
              <img
                src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80"
                alt="레시피"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-sm right-sm bg-secondary text-on-secondary px-sm py-xs rounded text-label-sm font-label-sm">
                Recipe
              </div>
            </div>
            <div className="p-md">
              <h4 className="font-headline-sm text-headline-sm mb-sm">제철 두릅으로 만드는 건강한 한 끼</h4>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                지금 아니면 맛볼 수 없는 봄의 향기, 두릅을 활용한 3가지 간단 레시피를 소개합니다.
              </p>
              <div className="mt-md flex items-center gap-sm">
                <div className="w-8 h-8 rounded-full bg-surface-container-high" />
                <span className="font-label-md text-label-md">CookMaster</span>
              </div>
            </div>
          </div>

          {/* 리뷰 카드 */}
          <div className="glass-card text-on-surface rounded-xl p-md flex flex-col justify-between shadow-lg border border-white/20">
            <div>
              <div className="flex gap-xs text-secondary mb-md">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
              </div>
              <p className="font-headline-sm text-headline-sm italic mb-md">
                "여기서 산 딸기만큼 달고 신선한 건 처음이에요. 아이들이 너무 좋아해서 매주 주문하고 있습니다."
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">@fresh_love24</span>
              <span className="font-label-sm text-label-sm text-outline">2 days ago</span>
            </div>
          </div>

          {/* 스토리 카드 */}
          <div className="glass-card text-on-surface rounded-xl overflow-hidden shadow-lg">
            <div className="relative h-48">
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80"
                alt="농장 스토리"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-sm right-sm bg-primary text-on-primary px-sm py-xs rounded text-label-sm font-label-sm">
                Story
              </div>
            </div>
            <div className="p-md">
              <h4 className="font-headline-sm text-headline-sm mb-sm">청솔농장 현장 방문기</h4>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                Farmer's Market 팀이 직접 다녀온 충남 아산 청솔농장의 열정 가득한 현장을 전해드립니다.
              </p>
              <div className="mt-md flex items-center gap-sm">
                <div className="w-8 h-8 rounded-full bg-primary-container" />
                <span className="font-label-md text-label-md">Team LFM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 스크롤 탑 버튼 ──────────────────────────────────────────────────────── */
function ScrollTopButton() {
  return (
    <div className="fixed bottom-gutter right-gutter">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-12 h-12 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary-container transition-colors"
      >
        <span className="material-symbols-outlined">arrow_upward</span>
      </button>
    </div>
  );
}

/* ── 페이지 조합 ──────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ValuesSection />
      <FarmersSection />
      <ProductsSection />
      <CommunitySection />
      <ScrollTopButton />
    </>
  );
}
