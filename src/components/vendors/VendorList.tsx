
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/types/vendor-types";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

interface VendorListProps {
  vendors: Vendor[];
}

const VendorList: React.FC<VendorListProps> = ({ vendors }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor Name</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Invoice</TableHead>
            <TableHead>Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VendorList;
