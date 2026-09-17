import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Farm, Post, Product } from '../types';
import { getFarms } from '../api/farm';
import { getPosts } from '../api/post';
import { getProducts } from '../api/product';
import FarmCard from '../components/farm/FarmCard';
import ProductCard from '../components/product/ProductCard';
import heroImage from '../assets/packd/hero-local.png';
import differenceImage from '../assets/packd/difference-local.png';
import bundleImage from '../assets/packd/bundle-local.png';

const BENEFITS = [['eco', '산지에서 바로'], ['verified', '믿을 수 있는 농가'], ['inventory_2', '신선함 그대로'], ['recycling', '필요한 만큼만']];

function EditorialSection({ title, body, action, image, reverse = false }: { title: string; body: string; action: string; image: string; reverse?: boolean }) {
  return <section className="packd-editorial"><div className={`packd-editorial__inner ${reverse ? 'packd-editorial__inner--reverse' : ''}`}>
    <img className="packd-editorial__image" src={image} alt="" />
    <div className="packd-editorial__copy"><h2>{title}</h2><p>{body}</p><Link to="/farms" className="packd-cta">{action}</Link></div>
  </div></section>;
}

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { getProducts({ size: 4 }).then((r) => setProducts(r.data.data.content)).catch(() => setProducts([])); }, []);
  return <section className="packd-products"><div className="packd-section-heading"><p>LOCAL MARKET</p><h2>오늘 수확한 신선함</h2></div>
    {products.length ? <div className="packd-products__grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p className="packd-empty">등록된 상품을 준비하고 있어요.</p>}
    <div className="packd-centered-action"><Link to="/farms" className="packd-cta">모든 상품 보기</Link></div>
  </section>;
}

function Farms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  useEffect(() => { getFarms({ size: 3 }).then((r) => setFarms(r.data.data.content)).catch(() => setFarms([])); }, []);
  return <section className="packd-farms"><div className="packd-section-heading"><p>MEET THE GROWERS</p><h2>정직하게 기른 우리 농가</h2></div>
    {farms.length ? <div className="packd-farms__grid">{farms.map((farm) => <FarmCard key={farm.id} farm={farm} />)}</div> : <p className="packd-empty">추천 농가를 준비하고 있어요.</p>}
    <div className="packd-centered-action"><Link to="/farms" className="packd-cta packd-cta--dark">농가 둘러보기</Link></div>
  </section>;
}

function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => { getPosts({ size: 3 }).then((r) => setPosts(r.data.data.content)).catch(() => setPosts([])); }, []);
  return <section className="packd-community"><div className="packd-section-heading"><p>FROM OUR COMMUNITY</p><h2>함께 나누는 식탁 이야기</h2></div>
    <div className="packd-community__grid">{posts.map((post, index) => <Link to={`/community/${post.id}`} className="packd-post" key={post.id}>
      {post.imageUrls[0] ? <img src={post.imageUrls[0]} alt="" /> : <div className={`packd-post__placeholder packd-post__placeholder--${index}`} />}
      <div><small>{post.category}</small><h3>{post.title}</h3><p>{post.content}</p><span>자세히 보기 →</span></div>
    </Link>)}</div>
    {!posts.length && <p className="packd-empty">새로운 이야기를 기다리고 있어요.</p>}
    <div className="packd-centered-action"><Link to="/community" className="packd-cta">커뮤니티 둘러보기</Link></div>
  </section>;
}

export default function HomePage() {
  return <div className="packd-home">
    <section className="packd-hero"><img src={heroImage} alt="신선한 제철 농산물" /><div className="packd-hero__shade" />
      <div className="packd-hero__content"><p>LOCAL HARVEST, DELIVERED</p><h1>산지의 신선함을<br />오늘 식탁으로</h1><span>지역 농가가 정성껏 기른 제철 먹거리를 만나보세요.</span><Link to="/farms" className="packd-cta">신선한 상품 보러가기</Link></div>
    </section>
    <section className="packd-benefits">{BENEFITS.map(([icon, label]) => <div key={label}><span className="material-symbols-outlined">{icon}</span><b>{label}</b></div>)}</section>
    <EditorialSection title="로컬푸드의 특별함" body="농가와 소비자를 바로 연결해 수확한 지 얼마 되지 않은 농산물을 전합니다. 생산자의 정성과 제철의 맛을 가장 신선할 때 경험해 보세요." action="로컬푸드 알아보기" image={differenceImage} />
    <FeaturedProducts />
    <EditorialSection title="알뜰하게 만나는 제철 꾸러미" body="계절마다 가장 맛있는 농산물만 골라 한 상자에 담았습니다. 무엇을 골라야 할지 고민될 때, 농부의 추천을 받아보세요." action="꾸러미 보러가기" image={bundleImage} reverse />
    <Farms /><Community />
  </div>;
}
