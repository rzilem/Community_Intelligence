
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/types/vendor-types";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import PhoneLink from "@/components/ui/phone-link";

interface VendorTableProps {
  vendors: Vendor[];
  visibleColumnIds: string[];
}

const VendorTable: React.FC<VendorTableProps> = ({ vendors, visibleColumnIds }) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {visibleColumnIds.includes('name') && <TableHead className="font-semibold text-gray-900">Vendor Name</TableHead>}
            {visibleColumnIds.includes('contact_person') && <TableHead className="font-semibold text-gray-900">Contact Person</TableHead>}
            {visibleColumnIds.includes('email') && <TableHead className="font-semibold text-gray-900">Email</TableHead>}
            {visibleColumnIds.includes('phone') && <TableHead className="font-semibold text-gray-900">Phone</TableHead>}
            {visibleColumnIds.includes('specialties') && <TableHead className="font-semibold text-gray-900">Specialties</TableHead>}
            {visibleColumnIds.includes('is_active') && <TableHead className="font-semibold text-gray-900">Status</TableHead>}
            {visibleColumnIds.includes('total_jobs') && <TableHead className="font-semibold text-gray-900">Total Jobs</TableHead>}
            {visibleColumnIds.includes('rating') && <TableHead className="font-semibold text-gray-900">Rating</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id} className="hover:bg-gray-50 transition-colors">
              {visibleColumnIds.includes('name') && (
                <TableCell className="font-medium py-4">
                  <Link 
                    to={`/operations/vendors/${vendor.id}`} 
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-semibold transition-colors"
                  >
                    {vendor.name}
                  </Link>
                </TableCell>
              )}
              {visibleColumnIds.includes('contact_person') && (
                <TableCell className="text-gray-700 py-4">
                  {vendor.contact_person || <span className="text-gray-400">—</span>}
                </TableCell>
              )}
              {visibleColumnIds.includes('email') && (
                <TableCell className="text-gray-700 py-4">
                  {vendor.email || <span className="text-gray-400">—</span>}
                </TableCell>
              )}
              {visibleColumnIds.includes('phone') && (
                <TableCell className="py-4">
                  {vendor.phone ? (
                    <PhoneLink phone={vendor.phone} />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
              )}
              {visibleColumnIds.includes('specialties') && (
                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-1">
                    {vendor.specialties?.slice(0, 2).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {specialty}
                      </Badge>
                    ))}
                    {vendor.specialties?.length > 2 && (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                        +{vendor.specialties.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
              )}
              {visibleColumnIds.includes('is_active') && (
                <TableCell className="py-4">
                  <Badge 
                    variant={vendor.is_active ? "default" : "secondary"}
                    className={vendor.is_active 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-gray-100 text-gray-800 border-gray-200"}
                  >
                    {vendor.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              )}
              {visibleColumnIds.includes('total_jobs') && (
                <TableCell className="text-gray-700 py-4 font-medium">
                  {vendor.total_jobs || 0}
                </TableCell>
              )}
              {visibleColumnIds.includes('rating') && (
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    {vendor.rating != null ? (
                      <>
                        <span className="font-medium text-gray-900">{vendor.rating.toFixed(1)}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={i < Math.floor(vendor.rating || 0) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300"} 
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400">No rating</span>
                    )}
                  </div>
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
