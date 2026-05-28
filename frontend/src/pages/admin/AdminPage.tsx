import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Farm } from '../../types';
import {
  getAdminStats,
  getAdminFarms,
  updateFarmStatus,
  getAdminPosts,
  deleteAdminPost,
  getAdminUsers,
  updateUserRole,
  suspendUser,
  type AdminStats,
  type AdminPost,
  type AdminUser,
} from '../../api/admin';
import useAuthStore from '../../store/authStore';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

/* ── 사이드바 ──────────────────────────────────────────────────────────────── */
type Tab = 'overview' | 'farms' | 'posts' | 'users';

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: '전체 현황',   icon: 'dashboard' },
  { id: 'farms',    label: '농가 관리',   icon: 'storefront' },
  { id: 'posts',    label: '게시글 관리', icon: 'article' },
  { id: 'users',    label: '사용자 관리', icon: 'group' },
];

function Sidebar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 shrink-0 bg-surface-container-low min-h-screen flex flex-col">
      {/* 로고 */}
      <div className="px-lg py-lg border-b border-outline-variant">
        <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">로컬푸드마켓</p>
        <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">관리자 패널</h1>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-xs p-md flex-1">
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-sm px-md py-sm rounded-xl font-body-md text-body-md transition-colors cursor-pointer text-left ${
              tab === id
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* 하단 사용자 정보 */}
      <div className="px-lg py-md border-t border-outline-variant">
        <p className="font-label-sm text-label-sm text-on-surface-variant truncate mb-xs">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-error transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          로그아웃
        </button>
      </div>
    </aside>
  );
}

/* ── 전체 현황 탭 ────────────────────────────────────────────────────────────── */
function OverviewTab({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  if (loading) return <div className="flex justify-center py-xl"><LoadingSpinner size="lg" /></div>;
  if (!stats) return <p className="font-body-md text-body-md text-on-surface-variant py-xl text-center">통계를 불러올 수 없어요</p>;

  const mainCards = [
    { label: '전체 농가',   value: stats.totalFarms,   icon: 'storefront',    color: 'bg-primary' },
    { label: '승인 대기',   value: stats.pendingFarms,  icon: 'pending',       color: 'bg-secondary' },
    { label: '전체 회원',   value: stats.totalUsers,    icon: 'group',         color: 'bg-tertiary' },
    { label: '신고 게시글', value: stats.reportedPosts, icon: 'report',        color: 'bg-error' },
  ];

  const quickCards = [
    { label: '오늘 신규 가입',  value: `${stats.todaySignups}명`,           icon: 'person_add' },
    { label: '오늘 총 주문',    value: `${stats.todayOrders}건`,            icon: 'shopping_bag' },
    { label: '오늘 매출',       value: `${stats.todayRevenue.toLocaleString()}P`, icon: 'payments' },
    { label: '신규 게시글',     value: `${stats.todayPosts}건`,             icon: 'article' },
  ];

  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-md">
        {mainCards.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-outline-variant p-md">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-sm`}>
              <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
            <p className="font-headline-lg text-headline-lg text-on-surface font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant p-lg">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">오늘의 빠른 통계</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {quickCards.map(({ label, value, icon }) => (
            <div key={label} className="flex items-center gap-md bg-surface-container-low rounded-xl p-md">
              <span className="material-symbols-outlined text-[24px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
                <p className="font-headline-sm text-headline-sm text-on-surface font-bold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 농가 관리 탭 ────────────────────────────────────────────────────────────── */
const FARM_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: '승인 대기', color: 'text-secondary' },
  APPROVED: { label: '승인됨',   color: 'text-primary' },
  REJECTED: { label: '반려됨',   color: 'text-error' },
};

function FarmsTab() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchFarms = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminFarms({ status: statusFilter || undefined, page, size: 10 });
      setFarms(data.data.content);
      setTotalPages(data.data.totalPages);
    } catch {
      setFarms([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchFarms(); }, [fetchFarms]);

  const handleStatus = async (farmId: number, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(farmId);
    try {
      await updateFarmStatus(farmId, status);
      setFarms((prev) => prev.map((f) => (f.id === farmId ? { ...f, status } : f)));
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? '처리에 실패했어요.');
    } finally {
      setProcessingId(null);
    }
  };

  const filterOptions = [
    { value: 'PENDING',  label: '승인 대기' },
    { value: 'APPROVED', label: '승인됨' },
    { value: 'REJECTED', label: '반려됨' },
    { value: '',         label: '전체' },
  ];

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap gap-xs">
        {filterOptions.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => { setStatusFilter(value); setPage(0); }}
            className={`px-md py-xs rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
              statusFilter === value ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-xl"><LoadingSpinner /></div>
        ) : farms.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-xl">해당하는 농가가 없어요</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  {['농가명', '지역', '카테고리', '신청일', '상태', '처리'].map((h) => (
                    <th key={h} className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {farms.map((farm) => {
                  const st = FARM_STATUS_LABELS[farm.status] ?? { label: farm.status, color: 'text-on-surface' };
                  const date = new Date(farm.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
                  const isProcessing = processingId === farm.id;
                  return (
                    <tr key={farm.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-md py-sm font-body-md text-body-md text-on-surface font-semibold">{farm.name}</td>
                      <td className="px-md py-sm font-body-md text-body-md text-on-surface-variant">{farm.region}</td>
                      <td className="px-md py-sm">
                        <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded-full">
                          {farm.category}
                        </span>
                      </td>
                      <td className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{date}</td>
                      <td className={`px-md py-sm font-label-md text-label-md font-semibold ${st.color}`}>{st.label}</td>
                      <td className="px-md py-sm">
                        {farm.status === 'PENDING' ? (
                          <div className="flex gap-xs">
                            <Button
                              size="sm"
                              loading={isProcessing}
                              onClick={() => handleStatus(farm.id, 'APPROVED')}
                            >
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              loading={isProcessing}
                              onClick={() => handleStatus(farm.id, 'REJECTED')}
                            >
                              반려
                            </Button>
                          </div>
                        ) : (
                          <span className="font-label-sm text-label-sm text-outline">처리됨</span>
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

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  );
}

/* ── 게시글 관리 탭 ──────────────────────────────────────────────────────────── */
function PostsTab() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminPosts({ page, size: 10 });
      setPosts(data.data.content);
      setTotalPages(data.data.totalPages);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (postId: number) => {
    setDeletingId(postId);
    try {
      await deleteAdminPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setConfirmId(null);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? '삭제에 실패했어요.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-md">
      <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-xl"><LoadingSpinner /></div>
        ) : posts.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-xl">신고된 게시글이 없어요</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  {['제목', '작성자', '신고 수', '작성일', '처리'].map((h) => (
                    <th key={h} className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {posts.map((post) => {
                  const date = new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                  const isConfirming = confirmId === post.id;
                  return (
                    <tr key={post.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-md py-sm font-body-md text-body-md text-on-surface max-w-[200px]">
                        <p className="line-clamp-1">{post.title}</p>
                      </td>
                      <td className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant">
                        {post.authorEmail.replace(/(.{2}).*(@.*)/, '$1***$2')}
                      </td>
                      <td className="px-md py-sm">
                        <span className={`font-label-md text-label-md font-semibold ${post.reportCount > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                          {post.reportCount}회
                        </span>
                      </td>
                      <td className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{date}</td>
                      <td className="px-md py-sm">
                        {isConfirming ? (
                          <div className="flex gap-xs items-center">
                            <span className="font-label-sm text-label-sm text-error">삭제할까요?</span>
                            <Button
                              size="sm"
                              variant="danger"
                              loading={deletingId === post.id}
                              onClick={() => handleDelete(post.id)}
                            >
                              확인
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setConfirmId(null)}>취소</Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setConfirmId(post.id)}
                          >
                            블라인드
                          </Button>
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

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  );
}

/* ── 사용자 관리 탭 ──────────────────────────────────────────────────────────── */
const ROLE_LABELS: Record<string, string> = {
  CONSUMER: '소비자',
  FARMER:   '농가',
  ADMIN:    '관리자',
};

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [inputKeyword, setInputKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers({ keyword: keyword || undefined, page, size: 10 });
      setUsers(data.data.content);
      setTotalPages(data.data.totalPages);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: number, role: string) => {
    setProcessingId(userId);
    try {
      await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? '권한 변경에 실패했어요.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSuspend = async (userId: number) => {
    if (!confirm('정말 이 계정을 정지할까요?')) return;
    setProcessingId(userId);
    try {
      await suspendUser(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, suspended: true } : u)));
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? '계정 정지에 실패했어요.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-md">
      <form
        onSubmit={(e) => { e.preventDefault(); setKeyword(inputKeyword); setPage(0); }}
        className="flex gap-sm"
      >
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            value={inputKeyword}
            onChange={(e) => setInputKeyword(e.target.value)}
            placeholder="이메일로 검색"
            className="w-full pl-xl pr-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button type="submit">검색</Button>
      </form>

      <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-xl"><LoadingSpinner /></div>
        ) : users.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-xl">사용자가 없어요</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  {['이메일', '권한', '포인트', '가입일', '상태', '관리'].map((h) => (
                    <th key={h} className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {users.map((u) => {
                  const date = new Date(u.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                  const isProcessing = processingId === u.id;
                  return (
                    <tr key={u.id} className={`hover:bg-surface-container-low transition-colors ${u.suspended ? 'opacity-60' : ''}`}>
                      <td className="px-md py-sm font-body-md text-body-md text-on-surface">{u.email}</td>
                      <td className="px-md py-sm">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={isProcessing || u.suspended}
                          className="px-sm py-xs border border-outline-variant rounded-lg font-label-md text-label-md bg-white focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-md py-sm font-body-md text-body-md text-on-surface whitespace-nowrap">
                        {u.pointBalance.toLocaleString()}P
                      </td>
                      <td className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{date}</td>
                      <td className="px-md py-sm">
                        <span className={`font-label-md text-label-md font-semibold ${u.suspended ? 'text-error' : 'text-primary'}`}>
                          {u.suspended ? '정지됨' : '정상'}
                        </span>
                      </td>
                      <td className="px-md py-sm">
                        {!u.suspended && (
                          <Button
                            size="sm"
                            variant="danger"
                            loading={isProcessing}
                            onClick={() => handleSuspend(u.id)}
                          >
                            정지
                          </Button>
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

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  );
}

/* ── 페이지 ───────────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/'); return; }

    getAdminStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [user, navigate]);

  const TAB_TITLES: Record<Tab, string> = {
    overview: '전체 현황',
    farms:    '농가 관리',
    posts:    '게시글 관리',
    users:    '사용자 관리',
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar tab={tab} setTab={setTab} />

      <main className="flex-1 p-lg overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">{TAB_TITLES[tab]}</h2>

          {tab === 'overview' && <OverviewTab stats={stats} loading={statsLoading} />}
          {tab === 'farms'    && <FarmsTab />}
          {tab === 'posts'    && <PostsTab />}
          {tab === 'users'    && <UsersTab />}
        </div>
      </main>
    </div>
  );
}
