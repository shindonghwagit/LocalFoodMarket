import { Link } from 'react-router-dom';
import type { Farm } from '../../types';
import Badge from '../common/Badge';
import vegetableFarmImage from '../../assets/packd/farm-vegetable.png';
import seafoodFarmImage from '../../assets/packd/farm-seafood.png';
import riceFarmImage from '../../assets/packd/farm-rice.png';
import seaweedFarmImage from '../../assets/packd/farm-seaweed.png';
import fruitFarmImage from '../../assets/packd/farm-fruit.png';
import livestockFarmImage from '../../assets/packd/farm-livestock.png';
import dairyFarmImage from '../../assets/packd/farm-dairy.png';

interface FarmCardProps {
  farm: Farm;
}

const splitTags = (value?: string | null): string[] =>
  value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];

const categoryImage = (categories: string[], farmId: number) => {
  if (categories.some((category) => category.includes('수산'))) {
    return farmId % 2 === 0 ? seaweedFarmImage : seafoodFarmImage;
  }
  if (categories.some((category) => category.includes('과일'))) return fruitFarmImage;
  if (categories.some((category) => category.includes('곡'))) return riceFarmImage;
  if (categories.some((category) => category.includes('유제품'))) return dairyFarmImage;
  if (categories.some((category) => category.includes('축산') || category.includes('육류'))) return livestockFarmImage;
  return vegetableFarmImage;
};

export default function FarmCard({ farm }: FarmCardProps) {
  const certifications = splitTags(farm.certification);
  const categories = splitTags(farm.category);
  const fallbackImage = categoryImage(categories, farm.id);

  return (
    <Link
      to={`/farms/${farm.id}`}
      className="block bg-white rounded-xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all overflow-hidden border border-outline-variant group"
    >
      {/* 이미지/아이콘 영역 */}
      <div className="h-40 bg-surface-container-high overflow-hidden">
        <img
          src={fallbackImage}
          alt={`${farm.name} 대표 이미지`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
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

        {certifications.length > 0 && (
          <div className="mb-sm flex flex-wrap gap-xs">
            {certifications.map((c) => (
              <Badge key={c} label={c} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-sm gap-xs">
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
          <div className="flex flex-wrap gap-xs justify-end">
            {categories.map((c) => (
              <span key={c} className="font-label-sm text-label-sm text-primary bg-primary-fixed px-xs py-[2px] rounded">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
