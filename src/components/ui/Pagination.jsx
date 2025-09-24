import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';
import Select from './Select';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showInfo = true,
  className = ''
}) => {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 ${className}`}>
      {/* Info */}
      {showInfo && (
        <div className="flex-1 flex justify-between sm:hidden">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex}</span> to{' '}
            <span className="font-medium">{endIndex}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
      )}

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {showInfo && (
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex}</span> to{' '}
              <span className="font-medium">{endIndex}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
            
            {showPageSizeSelector && (
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Show:</label>
                <Select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                  options={pageSizeOptions.map(size => ({
                    value: size,
                    label: size.toString()
                  }))}
                  className="w-20"
                />
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center space-x-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Numbers */}
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm text-gray-500">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="min-w-[2.5rem]"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}

          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;