
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HomeownerRequestPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRequests: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const HomeownerRequestPagination: React.FC<HomeownerRequestPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalRequests,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div className="flex items-center justify-between mt-4 px-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalRequests)} - {Math.min(currentPage * pageSize, totalRequests)} of {totalRequests}
        </span>
        <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>
              Page {currentPage} of {totalPages}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default HomeownerRequestPagination;
