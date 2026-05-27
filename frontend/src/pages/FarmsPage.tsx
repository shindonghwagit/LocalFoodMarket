import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Farm } from '../types';
import { getFarms } from '../api/farm';
import FarmCard from '../components/farm/FarmCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORIES = ['전체', '채소', '과일', '곡류', '축산', '수산', '기타'];
const CERTIFICATIONS = ['무농약', '유기농', 'GAP인증', '친환경'];
const PAGE_SIZE = 9;

export default function FarmsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get('keyword') ?? '';
  const category = searchParams.get('category') ?? '';
  const certification = searchParams.get('certification') ?? '';
  const sort = searchParams.get('sort') ?? 'createdAt,desc';
  const page = Number(searchParams.get('page') ?? '0');

  const [inputKeyword, setInputKeyword] = useState(keyword);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  const fetchFarms = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getFarms({
        page,
        size: PAGE_SIZE,
        keyword: keyword || undefined,
        category: category || undefined,
        certification: certification || undefined,
        sort,
      });
      setFarms(data.data.content);
      setTotalPages(data.data.totalPages);
      setTotalElements(data.data.totalElements);
    } catch {
      setFarms([]);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, category, certification, sort]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('keyword', inputKeyword);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* 상단 헤더 */}
      <div className="bg-primary text-on-primary py-lg">
        <div className="max-w-max-width mx-auto px-gutter">
          <h1 className="font-headline-lg text-headline-lg mb-xs">농가 찾기</h1>
          <p className="font-body-md text-body-md opacity-80">
            인증된 지역 농가와 직접 연결되어 신선한 농산물을 만나보세요
          </p>
        </div>
      </div>

      <div className="max-w-max-width mx-auto px-gutter py-lg">
        {/* 검색바 */}
        <form onSubmit={handleSearch} className="flex gap-sm mb-lg">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              placeholder="농장명, 지역으로 검색"
              className="w-full pl-xl pr-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-on-primary px-lg py-sm rounded-lg font-body-md text-body-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            검색
          </button>
          {(keyword || category || certification) && (
            <button
              type="button"
              onClick={() => {
                setInputKeyword('');
                setSearchParams(new URLSearchParams());
              }}
              className="px-md py-sm rounded-lg border border-outline-variant text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors cursor-pointer"
            >
              초기화
            </button>
          )}
        </form>

        {/* 필터 영역 */}
        <div className="flex flex-wrap gap-md mb-lg">
          {/* 카테고리 */}
          <div className="flex flex-col gap-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant">카테고리</span>
            <div className="flex flex-wrap gap-xs">
              {CATEGORIES.map((c) => {
                const val = c === '전체' ? '' : c;
                const active = category === val;
                return (
                  <button
                    key={c}
                    onClick={() => setParam('category', val)}
                    className={`px-md py-xs rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                      active
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 인증 */}
          <div className="flex flex-col gap-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant">인증</span>
            <div className="flex flex-wrap gap-xs">
              {CERTIFICATIONS.map((c) => {
                const active = certification === c;
                return (
                  <button
                    key={c}
                    onClick={() => setParam('certification', active ? '' : c)}
                    className={`px-md py-xs rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                      active
                        ? 'bg-tertiary-container text-on-tertiary-container border border-tertiary'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-tertiary-fixed'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 정렬 + 결과 수 */}
        <div className="flex items-center justify-between mb-md">
          <p className="font-label-md text-label-md text-on-surface-variant">
            {loading ? '검색 중...' : `총 ${totalElements}개 농가`}
          </p>
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="px-md py-xs border border-outline-variant rounded-lg font-label-md text-label-md bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="createdAt,desc">최신순</option>
            <option value="averageRating,desc">평점 높은순</option>
            <option value="name,asc">이름순</option>
          </select>
        </div>

        {/* 목록 */}
        {loading ? (
          <div className="flex justify-center py-xl">
            <LoadingSpinner size="lg" />
          </div>
        ) : farms.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md mb-xl">
              {farms.map((farm) => (
                <FarmCard key={farm.id} farm={farm} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-md">
              search_off
            </span>
            <p className="font-headline-sm text-headline-sm text-on-surface mb-xs">
              검색 결과가 없어요
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              다른 검색어나 필터를 시도해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
