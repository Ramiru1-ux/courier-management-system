import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const styles = `
  .pagination-shell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid #E3E7EF;
  }

  .pagination-summary {
    font-size: 12.5px;
    color: #697086;
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pagination-button {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #E3E7EF;
    background: #fff;
    color: #12213F;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pagination-button:hover:not(:disabled) {
    border-color: #D5DBEA;
    background: #F7F8FC;
  }

  .pagination-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .pagination-number {
    min-width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #E3E7EF;
    background: #fff;
    color: #697086;
    font-size: 12.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pagination-number.active {
    background: #12213F;
    border-color: #12213F;
    color: #fff;
  }

  .pagination-ellipsis {
    width: 18px;
    text-align: center;
    color: #9AA1B4;
    font-weight: 700;
  }
`;

function getPageNumbers(currentPage, totalPages) {
  const pageNumbers = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      pageNumbers.push(page);
    }
    return pageNumbers;
  }

  pageNumbers.push(1);

  if (currentPage > 3) pageNumbers.push('...');

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pageNumbers.push(page);
  }

  if (currentPage < totalPages - 2) pageNumbers.push('...');
  pageNumbers.push(totalPages);

  return pageNumbers;
}

export default function Pagination({
  currentPage = 1,
  totalPages = 5,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
}) {
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages || 1);
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);
  const pageNumbers = getPageNumbers(safeCurrentPage, totalPages);

  return (
    <div className="pagination-shell">
      <style>{styles}</style>

      <div className="pagination-summary">
        Showing {startItem}-{endItem} of {totalItems} results
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-button"
          disabled={safeCurrentPage === 1}
          onClick={() => onPageChange && onPageChange(Math.max(safeCurrentPage - 1, 1))}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            );
          }

          const isActive = page === safeCurrentPage;

          return (
            <button
              key={page}
              type="button"
              className={`pagination-number ${isActive ? 'active' : ''}`.trim()}
              onClick={() => onPageChange && onPageChange(page)}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          className="pagination-button"
          disabled={safeCurrentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange && onPageChange(Math.min(safeCurrentPage + 1, totalPages))}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
