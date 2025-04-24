import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/types/vendor-types";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import ColumnSelector from "@/components/table/ColumnSelector";
import { useUserColumns } from "@/hooks/useUserColumns";
import { usePagination } from "@/pages/residents/hooks/usePagination";
import HomeownerRequestPagination from "@/components/homeowners/HomeownerRequestPagination";

interface VendorListProps {
  vendors: Vendor[];
}

const VendorList: React.FC<VendorListProps> = ({ vendors }) => {
  const columnOptions = [
    { id: 'name', label: 'Vendor Name' },
    { id: 'contactPerson', label: 'Contact Person' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'category', label: 'Category' },
    { id: 'status', label: 'Status' },
    { id: 'lastInvoice', label: 'Last Invoice' },
    { id: 'rating', label: 'Rating' }
  ];

  const { 
    visibleColumnIds, 
    updateVisibleColumns,
    loading
  } = useUserColumns(columnOptions, 'vendor-list');

  const {
    currentPage,
    pageSize,
    totalPages,
    paginateItems,
    setCurrentPage,
    changePageSize
  } = usePagination({
    totalItems: vendors.length,
    defaultPageSize: 10,
    defaultCurrentPage: 1
  });

  const paginatedVendors = paginateItems(vendors);

  return (
    <>
      <div className="flex justify-end mb-4">
        <ColumnSelector 
          columns={columnOptions} 
          selectedColumns={visibleColumnIds} 
          onChange={updateVisibleColumns} 
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumnIds.includes('name') && <TableHead>Vendor Name</TableHead>}
              {visibleColumnIds.includes('contactPerson') && <TableHead>Contact Person</TableHead>}
              {visibleColumnIds.includes('email') && <TableHead>Email</TableHead>}
              {visibleColumnIds.includes('phone') && <TableHead>Phone</TableHead>}
              {visibleColumnIds.includes('category') && <TableHead>Category</TableHead>}
              {visibleColumnIds.includes('status') && <TableHead>Status</TableHead>}
              {visibleColumnIds.includes('lastInvoice') && <TableHead>Last Invoice</TableHead>}
              {visibleColumnIds.includes('rating') && <TableHead>Rating</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnIds.length} className="h-24 text-center">
                  No vendors found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  {visibleColumnIds.includes('name') && (
                    <TableCell className="font-medium">
                      <Link to={`/operations/vendors/${vendor.id}`} className="hover:underline text-blue-600">
                        {vendor.name}
                      </Link>
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('contactPerson') && <TableCell>{vendor.contactPerson || "-"}</TableCell>}
                  {visibleColumnIds.includes('email') && <TableCell>{vendor.email || "-"}</TableCell>}
                  {visibleColumnIds.includes('phone') && <TableCell>{vendor.phone || "-"}</TableCell>}
                  {visibleColumnIds.includes('category') && <TableCell>{vendor.category || "-"}</TableCell>}
                  {visibleColumnIds.includes('status') && (
                    <TableCell>
                      <Badge 
                        variant={vendor.status === "active" ? "default" : "secondary"}
                        className="bg-blue-500"
                      >
                        {vendor.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumnIds.includes('lastInvoice') && <TableCell>{vendor.lastInvoice || "N/A"}</TableCell>}
                  {visibleColumnIds.includes('rating') && (
                    <TableCell>
                      <div className="flex items-center">
                        {vendor.rating !== undefined ? (
                          <>
                            <span className="mr-1">{vendor.rating.toFixed(1)}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={16} 
                                  className={i < Math.floor(vendor.rating || 0) 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-gray-300"} 
                                />
                              ))}
                            </div>
                          </>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <HomeownerRequestPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalRequests={vendors.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={changePageSize}
      />
    </>
  );
};

export default VendorList;
