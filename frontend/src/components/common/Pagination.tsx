interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-xs" role="navigation" aria-label="페이지 탐색">
      <button
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="이전 페이지"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`w-10 h-10 flex items-center justify-center rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
            p === page
              ? 'bg-primary text-on-primary'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          {p + 1}
        </button>
      ))}

      <button
        disabled={page === totalPages - 1}
        onClick={() => onChange(page + 1)}
        className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="다음 페이지"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
