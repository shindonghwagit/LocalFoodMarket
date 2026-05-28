import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Post, Comment, Order } from '../types';
import { getPost, toggleLike, getComments, createComment } from '../api/post';
import { getOrders } from '../api/order';
import { createReview } from '../api/review';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORY_COLORS: Record<string, string> = {
  '구매후기': 'bg-primary-fixed text-on-primary-fixed',
  '레시피': 'bg-secondary-fixed text-on-secondary-fixed',
  '정보공유': 'bg-tertiary-fixed text-on-tertiary-fixed',
  '질문': 'bg-surface-container text-on-surface-variant',
};

/* ── 리뷰 작성 패널 ──────────────────────────────────────────────────────── */
function ReviewPanel({ productId, orderId }: { productId: number; orderId: number }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError('내용을 입력해주세요.'); return; }
    setLoading(true);
    try {
      await createReview({ productId, orderId, rating, content });
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? '리뷰 등록에 실패했어요.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="bg-primary-fixed rounded-xl p-md text-center">
      <span className="material-symbols-outlined text-[32px] text-primary mb-xs block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      <p className="font-body-md text-body-md text-on-surface">리뷰가 등록됐어요!</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-outline-variant p-md">
      <h4 className="font-headline-sm text-headline-sm text-on-surface mb-md">구매 상품 리뷰 작성</h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
        <div className="flex items-center gap-xs">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" onClick={() => setRating(s)} className="cursor-pointer">
              <span
                className={`material-symbols-outlined text-[24px] ${s <= rating ? 'text-secondary-container' : 'text-outline-variant'}`}
                style={{ fontVariationSettings: s <= rating ? "'FILL' 1" : "'FILL' 0" }}
              >star</span>
            </button>
          ))}
          <span className="font-label-md text-label-md text-on-surface-variant ml-xs">{rating}점</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="구매 후기를 자세히 작성해주세요"
          rows={4}
          className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">리뷰 등록</Button>
      </form>
    </div>
  );
}

/* ── 댓글 ────────────────────────────────────────────────────────────────── */
function CommentSection({ postId }: { postId: number }) {
  const { isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getComments(postId)
      .then(({ data }) => setComments(data.data))
      .catch(() => {});
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data } = await createComment(postId, content);
      setComments((prev) => [...prev, data.data]);
      setContent('');
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">
        댓글 {comments.length}개
      </h3>

      <div className="flex flex-col gap-sm mb-md">
        {comments.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-outline-variant p-md">
            <div className="flex items-center justify-between mb-xs">
              <span className="font-label-md text-label-md text-on-surface-variant">익명</span>
              <span className="font-label-sm text-label-sm text-outline">
                {new Date(c.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-md">
            첫 댓글을 남겨보세요!
          </p>
        )}
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-sm">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력해주세요"
            className="flex-1 px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" loading={loading} size="sm">등록</Button>
        </form>
      ) : (
        <p className="font-body-md text-body-md text-on-surface-variant text-center py-sm">
          <Link to="/login" className="text-primary hover:underline">로그인</Link> 후 댓글을 작성할 수 있어요
        </p>
      )}
    </div>
  );
}

/* ── 페이지 ───────────────────────────────────────────────────────────────── */
export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);

  const [doneOrders, setDoneOrders] = useState<Order[]>([]);

  useEffect(() => {
    getPost(postId)
      .then(({ data }) => {
        setPost(data.data);
        setLikeCount(data.data.likes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  // 구매 완료 주문 확인 (리뷰 작성 가능 여부)
  useEffect(() => {
    if (!isAuthenticated) return;
    getOrders()
      .then(({ data }) => setDoneOrders(data.data.content.filter((o) => o.status === 'DONE')))
      .catch(() => {});
  }, [isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const { data } = await toggleLike(postId);
      setLiked(data.data.liked);
      setLikeCount(data.data.likes);
    } catch {}
  };

  if (loading) return (
    <div className="flex justify-center py-xl"><LoadingSpinner size="lg" /></div>
  );
  if (!post) return (
    <div className="text-center py-xl">
      <p className="font-body-md text-body-md text-on-surface-variant">게시글을 찾을 수 없어요</p>
    </div>
  );

  // 이 게시글 태그 상품 중 구매완료된 것
  const reviewableItems = post.taggedProducts?.flatMap((tp) =>
    doneOrders.flatMap((o) =>
      o.items.filter((i) => i.productId === tp.id).map((i) => ({ productId: tp.id, orderId: o.id, productName: tp.name }))
    )
  ) ?? [];

  const date = new Date(post.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-background py-lg">
      <div className="max-w-max-width mx-auto px-gutter">
        <Link to="/community" className="inline-flex items-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-primary mb-lg transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          커뮤니티
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-xl">
          {/* 메인 콘텐츠 */}
          <div>
            {/* 헤더 */}
            <div className="mb-lg">
              <div className="flex items-center gap-sm mb-md flex-wrap">
                <span className={`font-label-md text-label-md px-sm py-xs rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-surface-container text-on-surface-variant'}`}>
                  {post.category}
                </span>
                <span className="font-label-sm text-label-sm text-outline">{date}</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">{post.title}</h1>
              <div className="flex items-center gap-md text-on-surface-variant">
                <span className="font-label-md text-label-md">
                  {post.authorEmail ? post.authorEmail.replace(/(.{2}).*(@.*)/, '$1***$2') : '익명'}
                </span>
                <span className="flex items-center gap-xs font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  {post.viewCount}
                </span>
              </div>
            </div>

            {/* 이미지 갤러리 */}
            {post.imageUrls.length > 0 && (
              <div className="mb-lg">
                <div className="aspect-video rounded-xl overflow-hidden bg-surface-container-high mb-sm">
                  <img src={post.imageUrls[imgIndex]} alt="" className="w-full h-full object-cover" />
                </div>
                {post.imageUrls.length > 1 && (
                  <div className="flex gap-sm overflow-x-auto">
                    {post.imageUrls.map((url, i) => (
                      <button key={i} onClick={() => setImgIndex(i)} className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors cursor-pointer ${i === imgIndex ? 'border-primary' : 'border-transparent'}`}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 본문 */}
            <div className="bg-white rounded-xl border border-outline-variant p-lg mb-lg">
              <p className="font-body-lg text-body-lg text-on-surface whitespace-pre-line leading-relaxed">{post.content}</p>
            </div>

            {/* 태그된 상품 */}
            {post.taggedProducts && post.taggedProducts.length > 0 && (
              <div className="mb-lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">관련 상품</h3>
                <div className="flex flex-wrap gap-sm">
                  {post.taggedProducts.map((p) => (
                    <Link key={p.id} to={`/products/${p.id}`}
                      className="flex items-center gap-xs bg-white border border-outline-variant rounded-full px-md py-xs hover:border-primary hover:text-primary transition-colors font-label-md text-label-md text-on-surface">
                      <span className="material-symbols-outlined text-[16px]">eco</span>
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 좋아요 */}
            <div className="flex justify-center mb-xl">
              <button
                onClick={handleLike}
                className={`flex items-center gap-sm px-xl py-sm rounded-full border-2 transition-all cursor-pointer ${liked ? 'border-error bg-error-container text-error' : 'border-outline-variant text-on-surface-variant hover:border-error hover:text-error'}`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                <span className="font-body-md text-body-md">{likeCount}</span>
              </button>
            </div>

            {/* 댓글 */}
            <CommentSection postId={postId} />
          </div>

          {/* 우측 패널 */}
          <div className="flex flex-col gap-md">
            {/* 글쓴이 정보 */}
            <div className="bg-white rounded-xl border border-outline-variant p-md">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">
                    {post.authorEmail ? post.authorEmail.replace(/(.{2}).*(@.*)/, '$1***$2') : '익명'}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{date}</p>
                </div>
              </div>
            </div>

            {/* 구매 리뷰 패널 */}
            {reviewableItems.length > 0 && (
              <div>
                <h4 className="font-label-md text-label-md text-on-surface-variant mb-sm">구매하신 상품에 리뷰를 남겨보세요</h4>
                {reviewableItems.map((item, i) => (
                  <ReviewPanel key={i} productId={item.productId} orderId={item.orderId} />
                ))}
              </div>
            )}

            {/* 같은 카테고리 글쓰기 유도 */}
            {isAuthenticated && (
              <Link to="/community/write" className="flex items-center justify-center gap-sm bg-primary-fixed text-primary rounded-xl p-md hover:bg-primary hover:text-on-primary transition-colors font-body-md text-body-md">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                나도 글쓰기
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
