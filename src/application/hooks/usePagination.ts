/**
 * usePagination Hook
 * Hook pour gérer la pagination de données
 */

import { useState, useMemo } from 'react';

interface UsePaginationOptions<T> {
  data: T[];
  pageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  paginatedData: T[];
  totalItems: number;
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

/**
 * Hook pour gérer la pagination
 */
export function usePagination<T>({
  data,
  pageSize = 10,
  initialPage = 1,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
    }
  };

  const firstPage = () => {
    setCurrentPage(1);
  };

  const lastPage = () => {
    setCurrentPage(totalPages);
  };

  return {
    currentPage,
    totalPages,
    pageSize,
    paginatedData,
    totalItems: data.length,
    startIndex: startIndex + 1, // 1-based index for display
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    canGoNext: currentPage < totalPages,
    canGoPrevious: currentPage > 1,
  };
}

