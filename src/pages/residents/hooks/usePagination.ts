import { useState } from 'react';

interface UsePaginationProps {
  defaultPageSize?: number;
  defaultCurrentPage?: number;
  totalItems: number;
}

export const usePagination = ({ 
  defaultPageSize = 10, 
  defaultCurrentPage = 1,
  totalItems
}: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(defaultCurrentPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Ensure current page is valid when total changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }
  
  const paginateItems = <T>(items: T[]): T[] => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  };
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const changePageSize = (newSize: number) => {
    // When changing page size, try to keep the same items visible
    const firstItemIndex = (currentPage - 1) * pageSize;
    const newPage = Math.floor(firstItemIndex / newSize) + 1;
    
    setPageSize(newSize);
    setCurrentPage(newPage);
  };
  
  return {
    currentPage,
    pageSize,
    totalPages,
    paginateItems,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    setCurrentPage,
    setPageSize
  };
};
