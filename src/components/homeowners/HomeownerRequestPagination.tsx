
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
  // Calculate page info
  const start = Math.min((currentPage - 1) * pageSize + 1, totalRequests);
  const end = Math.min(currentPage * pageSize, totalRequests);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-4 gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Showing {start} - {end} of {totalRequests}
        </span>
        <span className="text-sm text-muted-foreground mr-2">rows per page:</span>
        <Select 
          value={pageSize.toString()} 
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
        >
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
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
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {totalPages <= 5 ? (
            // Show all pages if 5 or fewer
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))
          ) : (
            // Show a subset of pages with ellipsis
            <>
              {/* Always show page 1 */}
              <PaginationItem>
                <PaginationLink
                  isActive={currentPage === 1}
                  onClick={() => onPageChange(1)}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>
              
              {/* Show ellipsis if not near the start */}
              {currentPage > 3 && (
                <PaginationItem>
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                </PaginationItem>
              )}
              
              {/* Show current page and adjacent pages */}
              {Array.from(
                { length: 3 },
                (_, i) => currentPage - 1 + i
              )
                .filter(page => page > 1 && page < totalPages)
                .map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => onPageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              
              {/* Show ellipsis if not near the end */}
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                </PaginationItem>
              )}
              
              {/* Always show last page */}
              <PaginationItem>
                <PaginationLink
                  isActive={currentPage === totalPages}
                  onClick={() => onPageChange(totalPages)}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default HomeownerRequestPagination;
