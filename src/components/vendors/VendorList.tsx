
import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/types/vendor-types";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import ColumnSelector from "@/components/table/ColumnSelector";

interface VendorListProps {
  vendors: Vendor[];
}

type ColumnKey = 'name' | 'contactPerson' | 'email' | 'phone' | 'category' | 'status' | 'lastInvoice' | 'rating';

const VendorList: React.FC<VendorListProps> = ({ vendors }) => {
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([
    'name', 'contactPerson', 'email', 'phone', 'category', 'status', 'lastInvoice', 'rating'
  ]);

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

  const handleColumnChange = (selectedColumns: string[]) => {
    setVisibleColumns(selectedColumns as ColumnKey[]);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <ColumnSelector 
          columns={columnOptions} 
          selectedColumns={visibleColumns} 
          onChange={handleColumnChange} 
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('name') && <TableHead>Vendor Name</TableHead>}
              {visibleColumns.includes('contactPerson') && <TableHead>Contact Person</TableHead>}
              {visibleColumns.includes('email') && <TableHead>Email</TableHead>}
              {visibleColumns.includes('phone') && <TableHead>Phone</TableHead>}
              {visibleColumns.includes('category') && <TableHead>Category</TableHead>}
              {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
              {visibleColumns.includes('lastInvoice') && <TableHead>Last Invoice</TableHead>}
              {visibleColumns.includes('rating') && <TableHead>Rating</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                {visibleColumns.includes('name') && (
                  <TableCell className="font-medium">
                    <Link to={`/operations/vendors/${vendor.id}`} className="hover:underline text-blue-600">
                      {vendor.name}
                    </Link>
                  </TableCell>
                )}
                {visibleColumns.includes('contactPerson') && <TableCell>{vendor.contactPerson || "-"}</TableCell>}
                {visibleColumns.includes('email') && <TableCell>{vendor.email || "-"}</TableCell>}
                {visibleColumns.includes('phone') && <TableCell>{vendor.phone || "-"}</TableCell>}
                {visibleColumns.includes('category') && <TableCell>{vendor.category || "-"}</TableCell>}
                {visibleColumns.includes('status') && (
                  <TableCell>
                    <Badge 
                      variant={vendor.status === "active" ? "default" : "secondary"}
                      className="bg-blue-500"
                    >
                      {vendor.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('lastInvoice') && <TableCell>{vendor.lastInvoice || "N/A"}</TableCell>}
                {visibleColumns.includes('rating') && (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default VendorList;
