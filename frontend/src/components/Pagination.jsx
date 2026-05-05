import { ChevronLeft, ChevronRight } from "lucide-react";


// Component phân trang
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-xl">
      <span className="text-xs text-gray-500 font-medium">
        Đang xem trang{" "}
        <span className="text-[#113e48] font-bold">{currentPage}</span> trên
        tổng số {totalPages}
      </span>

      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500/20"
          title="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500/20"
          title="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
