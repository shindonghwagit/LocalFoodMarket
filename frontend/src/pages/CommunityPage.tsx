import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Post, PostCategory } from '../types';
import { getPosts } from '../api/post';
import useAuthStore from '../store/authStore';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORIES: { label: string; value: PostCategory | '' }[] = [
  { label: '전체', value: '' },
  { label: '구매후기', value: '구매후기' },
  { label: '레시피', value: '레시피' },
  { label: '정보공유', value: '정보공유' },
  { label: '질문', value: '질문' },
];

const CATEGORY_COLORS: Record<string, string> = {
  '구매후기': 'bg-primary-fixed text-on-primary-fixed',
  '레시피': 'bg-secondary-fixed text-on-secondary-fixed',
  '정보공유': 'bg-tertiary-fixed text-on-tertiary-fixed',
  '질문': 'bg-surface-container text-on-surface-variant',
};

const PAGE_SIZE = 10;

function PostCard({ post }: { post: Post }) {
  const date = new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  return (
    <Link
      to={`/community/${post.id}`}
      className="flex gap-md bg-white rounded-xl border border-outline-variant p-md hover:-translate-y-0.5 hover:shadow-md transition-all"
    >
      {/* 썸네일 */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-high shrink-0 flex items-center justify-center">
        {post.imageUrls.length > 0 ? (
          <img src={post.imageUrls[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant">article</span>
        )}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-xs mb-xs">
          <span className={`font-label-sm text-label-sm px-xs py-[2px] rounded ${CATEGORY_COLORS[post.category] ?? 'bg-surface-container text-on-surface-variant'}`}>
            {post.category}
          </span>
          <span className="font-label-sm text-label-sm text-outline">{date}</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 mb-xs">{post.title}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1 mb-sm">{post.content}</p>

        {/* 태그된 상품 */}
        {post.taggedProducts && post.taggedProducts.length > 0 && (
          <div className="flex gap-xs flex-wrap mb-xs">
            {post.taggedProducts.map((p) => (
              <span key={p.id} className="font-label-sm text-label-sm text-primary bg-primary-fixed px-xs py-[2px] rounded">
                {p.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-md">
          <span className="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">favorite</span>
            {post.likes}
          </span>
          <span className="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">visibility</span>
            {post.viewCount}
          </span>
          {post.commentCount != null && (
            <span className="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
              {post.commentCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get('keyword') ?? '';
  const category = (searchParams.get('category') ?? '') as PostCategory | '';
  const sort = searchParams.get('sort') ?? 'createdAt,desc';
  const page = Number(searchParams.get('page') ?? '0');
  const [inputKeyword, setInputKeyword] = useState(keyword);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getPosts({
        page, size: PAGE_SIZE,
        keyword: keyword || undefined,
        category: category || undefined,
        sort,
      });
      setPosts(data.data.content);
      setTotalPages(data.data.totalPages);
      setTotalElements(data.data.totalElements);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, category, sort]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('keyword', inputKeyword);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* 헤더 */}
      <div className="bg-primary text-on-primary py-lg">
        <div className="max-w-max-width mx-auto px-gutter flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg mb-xs">커뮤니티</h1>
            <p className="font-body-md text-body-md opacity-80">구매 후기, 레시피, 농산물 정보를 나눠요</p>
          </div>
          {isAuthenticated && (
            <Link
              to="/community/write"
              className="flex items-center gap-xs bg-on-primary text-primary px-md py-sm rounded-full font-label-md text-label-md hover:bg-primary-fixed transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              글쓰기
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-max-width mx-auto px-gutter py-lg">
        {/* 검색 */}
        <form onSubmit={handleSearch} className="flex gap-sm mb-lg">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              placeholder="제목, 내용으로 검색"
              className="w-full pl-xl pr-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" className="bg-primary text-on-primary px-lg py-sm rounded-lg font-body-md text-body-md hover:opacity-90 cursor-pointer">검색</button>
        </form>

        {/* 필터 */}
        <div className="flex flex-wrap items-center justify-between gap-md mb-md">
          <div className="flex flex-wrap gap-xs">
            {CATEGORIES.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setParam('category', value)}
                className={`px-md py-xs rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                  category === value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="px-md py-xs border border-outline-variant rounded-lg font-label-md text-label-md bg-white focus:outline-none cursor-pointer"
          >
            <option value="createdAt,desc">최신순</option>
            <option value="likes,desc">인기순</option>
            <option value="commentCount,desc">댓글 많은순</option>
          </select>
        </div>

        <p className="font-label-md text-label-md text-on-surface-variant mb-md">
          {loading ? '불러오는 중...' : `총 ${totalElements}개`}
        </p>

        {/* 목록 */}
        {loading ? (
          <div className="flex justify-center py-xl"><LoadingSpinner size="lg" /></div>
        ) : posts.length > 0 ? (
          <>
            <div className="flex flex-col gap-sm mb-xl">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={(p) => {
              const next = new URLSearchParams(searchParams);
              next.set('page', String(p));
              setSearchParams(next);
            }} />
          </>
        ) : (
          <div className="flex flex-col items-center py-xl text-center">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-md">article</span>
            <p className="font-headline-sm text-headline-sm text-on-surface mb-xs">게시글이 없어요</p>
            {isAuthenticated
              ? <Link to="/community/write" className="font-body-md text-body-md text-primary hover:underline">첫 글을 작성해보세요</Link>
              : <p className="font-body-md text-body-md text-on-surface-variant">아직 게시글이 없습니다.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
