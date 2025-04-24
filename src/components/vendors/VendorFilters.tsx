
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { VendorCategory, VENDOR_CATEGORIES } from '@/types/vendor-types';

interface VendorFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  selectedCategory: string;
  selectedStatus: string;
}

const VendorFilters: React.FC<VendorFiltersProps> = ({
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  selectedCategory,
  selectedStatus
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search vendors..."
          className="pl-8"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories</SelectItem>
          {VENDOR_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default VendorFilters;
