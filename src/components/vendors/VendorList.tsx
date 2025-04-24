
import React from "react";
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/types/vendor-types";
import { Link } from "react-router-dom";
import { Star, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VendorListProps {
  vendors: Vendor[];
  onSort?: (column: string) => void;
  sortBy?: {
    column: string;
    ascending: boolean;
  };
}

const VendorList: React.FC<VendorListProps> = ({ 
  vendors,
  onSort,
  sortBy
}) => {
  const getSortIcon = (column: string) => {
    if (sortBy?.column !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortBy.ascending ? 
      <ArrowUpDown className="ml-2 h-4 w-4 text-blue-500" /> : 
      <ArrowUpDown className="ml-2 h-4 w-4 text-blue-500 transform rotate-180" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => onSort?.('name')}
                className="flex items-center p-0 hover:bg-transparent"
              >
                Vendor Name
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => onSort?.('category')}
                className="flex items-center p-0 hover:bg-transparent"
              >
                Category
                {getSortIcon('category')}
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Invoice</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => onSort?.('rating')}
                className="flex items-center p-0 hover:bg-transparent"
              >
                Rating
                {getSortIcon('rating')}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No vendors found.
              </TableCell>
            </TableRow>
          ) : (
            vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">
                  <Link to={`/operations/vendors/${vendor.id}`} className="hover:underline text-blue-600">
                    {vendor.name}
                  </Link>
                </TableCell>
                <TableCell>{vendor.contactPerson || "-"}</TableCell>
                <TableCell>{vendor.email || "-"}</TableCell>
                <TableCell>{vendor.phone || "-"}</TableCell>
                <TableCell>{vendor.category || "-"}</TableCell>
                <TableCell>
                  <Badge 
                    variant={vendor.status === "active" ? "default" : "secondary"}
                    className="bg-blue-500"
                  >
                    {vendor.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{vendor.lastInvoice || "N/A"}</TableCell>
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VendorList;
