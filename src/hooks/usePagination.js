import { useState, useMemo, useCallback } from 'react';
import { apiHelpers } from '../services/apiHelpers';
import { PAGINATION } from '../utils/constants';

// Custom hook for pagination, search, and sorting
export const usePagination = (data = [], initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchFields, setSearchFields] = useState([]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm || searchFields.length === 0) {
      return data;
    }
    return apiHelpers.search(data, searchTerm, searchFields);
  }, [data, searchTerm, searchFields]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortField) {
      return filteredData;
    }
    return apiHelpers.sort(filteredData, sortField, sortDirection);
  }, [filteredData, sortField, sortDirection]);

  // Paginate sorted data
  const paginatedResult = useMemo(() => {
    return apiHelpers.paginate(sortedData, currentPage, pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Handle search
  const handleSearch = useCallback((term, fields = []) => {
    setSearchTerm(term);
    setSearchFields(fields);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Handle sort
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page
  }, [sortField]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchFields([]);
    setCurrentPage(1);
  }, []);

  // Clear sort
  const clearSort = useCallback(() => {
    setSortField('');
    setSortDirection('asc');
    setCurrentPage(1);
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSearchFields([]);
    setSortField('');
    setSortDirection('asc');
    setCurrentPage(1);
  }, []);

  // Go to first page
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Go to last page
  const goToLastPage = useCallback(() => {
    setCurrentPage(paginatedResult.totalPages);
  }, [paginatedResult.totalPages]);

  // Go to next page
  const goToNextPage = useCallback(() => {
    if (currentPage < paginatedResult.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, paginatedResult.totalPages]);

  // Go to previous page
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Check if has next page
  const hasNextPage = currentPage < paginatedResult.totalPages;

  // Check if has previous page
  const hasPreviousPage = currentPage > 1;

  // Get page numbers for pagination component
  const getPageNumbers = useCallback(() => {
    const { totalPages } = paginatedResult;
    const delta = 2; // Number of pages to show on each side of current page
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
  }, [currentPage, paginatedResult.totalPages]);

  return {
    // Data
    data: paginatedResult.data,
    totalItems: paginatedResult.totalItems,
    totalPages: paginatedResult.totalPages,
    currentPage,
    pageSize,
    
    // Search and sort state
    searchTerm,
    sortField,
    sortDirection,
    
    // Pagination info
    hasNextPage,
    hasPreviousPage,
    
    // Actions
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleSort,
    clearSearch,
    clearSort,
    resetFilters,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    getPageNumbers,
    
    // Computed values
    startIndex: (currentPage - 1) * pageSize + 1,
    endIndex: Math.min(currentPage * pageSize, paginatedResult.totalItems),
    isEmpty: paginatedResult.data.length === 0,
    isFiltered: searchTerm !== '' || sortField !== ''
  };
};

export default usePagination;