
import React, { useRef, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Vendor } from "@/types/vendor-types";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import PhoneLink from "@/components/ui/phone-link";

interface VendorTableProps {
  vendors: Vendor[];
  visibleColumnIds: string[];
  selectedVendorIds?: string[];
  onVendorSelect?: (vendorId: string) => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  showSelection?: boolean;
}

const VendorTable: React.FC<VendorTableProps> = ({ 
  vendors, 
  visibleColumnIds,
  selectedVendorIds = [],
  onVendorSelect,
  onSelectAll,
  isAllSelected = false,
  isIndeterminate = false,
  showSelection = false
}) => {
  const selectAllRef = useRef<HTMLButtonElement>(null);

  // Set indeterminate state on the select all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const parseEmails = (email: string | undefined): string[] => {
    if (!email) return [];
    return email.split(',').map(e => e.trim()).filter(e => e.length > 0);
  };

  const renderEmails = (emails: string[]) => {
    if (emails.length === 0) return <span className="text-gray-400">—</span>;
    
    return (
      <div className="space-y-1">
        {emails.map((email, index) => (
          <div key={index} className="text-sm">
            <a 
              href={`mailto:${email}`} 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {email}
            </a>
          </div>
        ))}
      </div>
    );
  };

  const renderCompactRating = (rating: number | null) => {
    if (rating == null) {
      return <span className="text-gray-400 text-sm">No rating</span>;
    }

    return (
      <div className="flex items-center gap-1">
        <span className="font-medium text-sm">{rating.toFixed(1)}</span>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              className={i < Math.floor(rating) 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"} 
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {showSelection && (
              <TableHead className="w-[40px]">
                <Checkbox
                  ref={selectAllRef}
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all vendors"
                />
              </TableHead>
            )}
            {visibleColumnIds.includes('name') && <TableHead className="font-semibold text-gray-900 w-[200px]">Vendor Name</TableHead>}
            {visibleColumnIds.includes('contact_person') && <TableHead className="font-semibold text-gray-900 w-[140px]">Contact Person</TableHead>}
            {visibleColumnIds.includes('email') && <TableHead className="font-semibold text-gray-900 w-[180px]">Email</TableHead>}
            {visibleColumnIds.includes('phone') && <TableHead className="font-semibold text-gray-900 w-[130px]">Phone</TableHead>}
            {visibleColumnIds.includes('specialties') && <TableHead className="font-semibold text-gray-900 w-[200px]">Specialties</TableHead>}
            {visibleColumnIds.includes('is_active') && <TableHead className="font-semibold text-gray-900 w-[80px]">Status</TableHead>}
            {visibleColumnIds.includes('total_jobs') && <TableHead className="font-semibold text-gray-900 w-[80px]">Jobs</TableHead>}
            {visibleColumnIds.includes('rating') && <TableHead className="font-semibold text-gray-900 w-[120px]">Rating</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow 
              key={vendor.id} 
              className={`hover:bg-gray-50 transition-colors ${
                selectedVendorIds.includes(vendor.id) ? 'bg-blue-50' : ''
              }`}
            >
              {showSelection && (
                <TableCell className="py-3">
                  <Checkbox
                    checked={selectedVendorIds.includes(vendor.id)}
                    onCheckedChange={() => onVendorSelect?.(vendor.id)}
                    aria-label={`Select ${vendor.name}`}
                  />
                </TableCell>
              )}
              {visibleColumnIds.includes('name') && (
                <TableCell className="font-medium py-3">
                  <Link 
                    to={`/operations/vendors/${vendor.id}`} 
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-semibold transition-colors"
                  >
                    {vendor.name}
                  </Link>
                </TableCell>
              )}
              {visibleColumnIds.includes('contact_person') && (
                <TableCell className="text-gray-700 py-3 text-sm">
                  {vendor.contact_person || <span className="text-gray-400">—</span>}
                </TableCell>
              )}
              {visibleColumnIds.includes('email') && (
                <TableCell className="py-3">
                  {renderEmails(parseEmails(vendor.email))}
                </TableCell>
              )}
              {visibleColumnIds.includes('phone') && (
                <TableCell className="py-3 whitespace-nowrap">
                  {vendor.phone ? (
                    <PhoneLink phone={vendor.phone} />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
              )}
              {visibleColumnIds.includes('specialties') && (
                <TableCell className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {vendor.specialties?.slice(0, 3).map((specialty, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {specialty}
                      </Badge>
                    ))}
                    {vendor.specialties?.length > 3 && (
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
                      >
                        +{vendor.specialties.length - 3}
                      </Badge>
                    )}
                    {(!vendor.specialties || vendor.specialties.length === 0) && (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </div>
                </TableCell>
              )}
              {visibleColumnIds.includes('is_active') && (
                <TableCell className="py-3">
                  <Badge 
                    variant={vendor.is_active ? "default" : "secondary"}
                    className={vendor.is_active 
                      ? "bg-green-100 text-green-800 border-green-200 text-xs" 
                      : "bg-gray-100 text-gray-800 border-gray-200 text-xs"}
                  >
                    {vendor.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              )}
              {visibleColumnIds.includes('total_jobs') && (
                <TableCell className="text-gray-700 py-3 font-medium text-sm">
                  {vendor.total_jobs || 0}
                </TableCell>
              )}
              {visibleColumnIds.includes('rating') && (
                <TableCell className="py-3">
                  {renderCompactRating(vendor.rating)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VendorTable;
