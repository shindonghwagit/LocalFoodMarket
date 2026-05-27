import { Link } from 'react-router-dom';
import type { Farm } from '../../types';
import Badge from '../common/Badge';

interface FarmCardProps {
  farm: Farm;
}

export default function FarmCard({ farm }: FarmCardProps) {
  return (
    <Link
      to={`/farms/${farm.id}`}
      className="block bg-white rounded-xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all overflow-hidden border border-outline-variant group"
    >
      {/* 이미지/아이콘 영역 */}
      <div className="h-40 bg-surface-container-high flex items-center justify-center overflow-hidden">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant group-hover:scale-110 transition-transform">
          agriculture
        </span>
      </div>

      {/* 콘텐츠 */}
      <div className="p-md">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs line-clamp-1">
          {farm.name}
        </h3>

        <p className="font-body-md text-body-md text-on-surface-variant mb-sm flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          {farm.region}
        </p>

        {farm.certification && (
          <div className="mb-sm">
            <Badge label={farm.certification} />
          </div>
        )}

        <div className="flex items-center justify-between mt-sm">
          {farm.averageRating != null ? (
            <span className="flex items-center gap-xs font-label-md text-label-md text-secondary">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              {farm.averageRating.toFixed(1)}
              {farm.reviewCount != null && (
                <span className="text-outline">({farm.reviewCount})</span>
              )}
            </span>
          ) : (
            <span className="font-label-md text-label-md text-outline">리뷰 없음</span>
          )}
          <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-xs py-[2px] rounded">
            {farm.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
