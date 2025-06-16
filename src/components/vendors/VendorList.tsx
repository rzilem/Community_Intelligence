import React, { useMemo, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/types/vendor-types";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import ColumnSelector from "@/components/table/ColumnSelector";
import { useUserColumns } from "@/hooks/useUserColumns";
import VendorCardView from "./VendorCardView";
import VendorQuickFilters from "./VendorQuickFilters";
import VendorViewToggle from "./VendorViewToggle";
import PhoneLink from "@/components/ui/phone-link";

interface VendorListProps {
  vendors: Vendor[];
}

type ColumnKey = 'name' | 'contact_person' | 'email' | 'phone' | 'specialties' | 'is_active' | 'total_jobs' | 'rating';

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
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all_specialties');

  const { 
    visibleColumnIds, 
    updateVisibleColumns,
    loading,
    error
  } = useUserColumns(COLUMN_OPTIONS, 'vendor-list');

  // Filter vendors based on current filters
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = searchTerm === '' || 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && vendor.is_active) ||
        (statusFilter === 'inactive' && !vendor.is_active);

      const matchesSpecialty = specialtyFilter === 'all_specialties' ||
        vendor.specialties?.some(specialty => 
          specialty.toLowerCase().replace(' ', '_') === specialtyFilter
        );

      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [vendors, searchTerm, statusFilter, specialtyFilter]);

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || specialtyFilter !== 'all_specialties';

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSpecialtyFilter('all_specialties');
  };

  if (error) {
    console.warn('Column preferences error:', error);
  }

  return (
    <div className="space-y-3">
      {/* Header with filters and view toggle */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Vendors ({filteredVendors.length})
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your vendor relationships and services
          </p>
        </div>
        <VendorViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Quick Filters */}
      <VendorQuickFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        specialtyFilter={specialtyFilter}
        onSpecialtyFilterChange={setSpecialtyFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results count and column selector for table view */}
      {view === 'table' && (
        <div className="flex justify-between items-center py-2">
          <div className="text-sm text-muted-foreground">
            {hasActiveFilters ? `${filteredVendors.length} of ${vendors.length} vendors` : 'All vendors'}
          </div>
          <ColumnSelector 
            columns={COLUMN_OPTIONS} 
            selectedColumns={visibleColumnIds} 
            onChange={updateVisibleColumns} 
          />
        </div>
      )}

      {/* Vendor List Content */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No vendors found</p>
          {hasActiveFilters && (
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters or clearing them to see more results
            </p>
          )}
        </div>
      ) : view === 'cards' ? (
        <VendorCardView vendors={filteredVendors} />
      ) : (
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
              {filteredVendors.map((vendor) => (
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
      )}
    </div>
  );
};

export default React.memo(VendorList);
