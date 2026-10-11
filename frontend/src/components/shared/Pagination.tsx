import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** Zero-based pager matching the backend's PageResponseDto. Hidden when there is only one page. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const btn = "grid size-10 place-items-center rounded-full border border-border bg-card disabled:opacity-40";
  return (
    <div className="mt-10 flex items-center justify-center gap-4 text-sm font-semibold">
      <button className={btn} disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      <span>Page {page + 1} of {totalPages}</span>
      <button className={btn} disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
