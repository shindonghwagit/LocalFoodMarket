import { Link } from 'react-router-dom';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="block bg-white rounded-xl shadow-sm overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all border border-outline-variant"
    >
      {/* 이미지 */}
      <div className="relative aspect-[4/5] bg-surface-container-high overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant">eco</span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-error text-on-error px-sm py-xs rounded-full font-label-md text-label-md">
              품절
            </span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-md">
        <p className="font-label-md text-label-md text-primary mb-xs truncate">{product.farmName}</p>
        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-sm line-clamp-2 leading-snug">
          {product.name}
        </h4>

        <div className="flex items-center justify-between">
          <span className="font-headline-md text-headline-md text-on-surface">
            {product.price.toLocaleString()}원
          </span>
          <span
            className={`font-label-sm text-label-sm ${
              product.stock > 0 ? 'text-primary' : 'text-outline'
            }`}
          >
            재고 {product.stock}개
          </span>
        </div>

        {product.harvestDate && (
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">
            수확일: {product.harvestDate}
          </p>
        )}
      </div>
    </Link>
  );
}
