
import React, { useMemo } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/types/vendor-types";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import ColumnSelector from "@/components/table/ColumnSelector";
import { useUserColumns } from "@/hooks/useUserColumns";

interface VendorListProps {
  vendors: Vendor[];
}

type ColumnKey = 'name' | 'contact_person' | 'email' | 'phone' | 'specialties' | 'is_active' | 'total_jobs' | 'rating';

// Memoize column options to prevent recreation on every render
const COLUMN_OPTIONS = [
  { id: 'name', label: 'Vendor Name' },
  { id: 'contact_person', label: 'Contact Person' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'specialties', label: 'Specialties' },
  { id: 'is_active', label: 'Status' },
  { id: 'total_jobs', label: 'Total Jobs' },
  { id: 'rating', label: 'Rating' }
];

const VendorList: React.FC<VendorListProps> = ({ vendors }) => {
  const { 
    visibleColumnIds, 
    updateVisibleColumns,
    loading,
    error
  } = useUserColumns(COLUMN_OPTIONS, 'vendor-list');

  // Show error state if column preferences failed to load
  if (error) {
    console.warn('Column preferences error:', error);
    // Continue rendering with default columns rather than blocking the UI
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <ColumnSelector 
          columns={COLUMN_OPTIONS} 
          selectedColumns={visibleColumnIds} 
          onChange={updateVisibleColumns} 
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumnIds.includes('name') && <TableHead className="text-foreground">Vendor Name</TableHead>}
              {visibleColumnIds.includes('contact_person') && <TableHead className="text-foreground">Contact Person</TableHead>}
              {visibleColumnIds.includes('email') && <TableHead className="text-foreground">Email</TableHead>}
              {visibleColumnIds.includes('phone') && <TableHead className="text-foreground">Phone</TableHead>}
              {visibleColumnIds.includes('specialties') && <TableHead className="text-foreground">Specialties</TableHead>}
              {visibleColumnIds.includes('is_active') && <TableHead className="text-foreground">Status</TableHead>}
              {visibleColumnIds.includes('total_jobs') && <TableHead className="text-foreground">Total Jobs</TableHead>}
              {visibleColumnIds.includes('rating') && <TableHead className="text-foreground">Rating</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                {visibleColumnIds.includes('name') && (
                  <TableCell className="font-medium">
                    <Link 
                      to={`/operations/vendors/${vendor.id}`} 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium"
                    >
                      {vendor.name}
                    </Link>
                  </TableCell>
                )}
                {visibleColumnIds.includes('contact_person') && (
                  <TableCell className="text-foreground">
                    {vendor.contact_person || "-"}
                  </TableCell>
                )}
                {visibleColumnIds.includes('email') && (
                  <TableCell className="text-foreground">
                    {vendor.email || "-"}
                  </TableCell>
                )}
                {visibleColumnIds.includes('phone') && (
                  <TableCell className="text-foreground">
                    {vendor.phone || "-"}
                  </TableCell>
                )}
                {visibleColumnIds.includes('specialties') && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {vendor.specialties?.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {vendor.specialties?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{vendor.specialties.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                )}
                {visibleColumnIds.includes('is_active') && (
                  <TableCell>
                    <Badge 
                      variant={vendor.is_active ? "default" : "secondary"}
                      className={vendor.is_active ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                    >
                      {vendor.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumnIds.includes('total_jobs') && (
                  <TableCell className="text-foreground">
                    {vendor.total_jobs || 0}
                  </TableCell>
                )}
                {visibleColumnIds.includes('rating') && (
                  <TableCell>
                    <div className="flex items-center">
                      {vendor.rating != null ? (
                        <>
                          <span className="mr-1 text-foreground">{vendor.rating.toFixed(1)}</span>
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
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default React.memo(VendorList);
