
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { VENDOR_CATEGORIES } from '@/types/vendor-types';

export interface AdvancedFilters {
  minRating: number;
  maxRating: number;
  minJobs: number;
  maxJobs: number;
  hasEmail: boolean | null;
  hasPhone: boolean | null;
  selectedSpecialties: string[];
}

interface VendorAdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearAdvanced: () => void;
  hasActiveAdvancedFilters: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VendorAdvancedFilters: React.FC<VendorAdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearAdvanced,
  hasActiveAdvancedFilters,
  open,
  onOpenChange
}) => {
  const updateFilter = <K extends keyof AdvancedFilters>(key: K, value: AdvancedFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSpecialty = (specialty: string) => {
    const current = filters.selectedSpecialties;
    const updated = current.includes(specialty)
      ? current.filter(s => s !== specialty)
      : [...current, specialty];
    updateFilter('selectedSpecialties', updated);
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        onClick={() => onOpenChange(true)}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Advanced Filters
        {hasActiveAdvancedFilters && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
            Active
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Advanced Filters</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveAdvancedFilters && (
              <Button variant="outline" size="sm" onClick={onClearAdvanced}>
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Rating Range</Label>
          <div className="px-2">
            <Slider
              value={[filters.minRating, filters.maxRating]}
              onValueChange={([min, max]) => {
                updateFilter('minRating', min);
                updateFilter('maxRating', max);
              }}
              min={0}
              max={5}
              step={0.5}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{filters.minRating} stars</span>
              <span>{filters.maxRating} stars</span>
            </div>
          </div>
        </div>

        {/* Jobs Count Filter */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Min Jobs</Label>
            <Input
              type="number"
              value={filters.minJobs}
              onChange={(e) => updateFilter('minJobs', Number(e.target.value) || 0)}
              min={0}
              placeholder="0"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Max Jobs</Label>
            <Input
              type="number"
              value={filters.maxJobs || ''}
              onChange={(e) => updateFilter('maxJobs', Number(e.target.value) || 999)}
              min={0}
              placeholder="No limit"
            />
          </div>
        </div>

        {/* Contact Info Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Email Status</Label>
            <Select
              value={filters.hasEmail === null ? 'all' : filters.hasEmail ? 'yes' : 'no'}
              onValueChange={(value) => 
                updateFilter('hasEmail', value === 'all' ? null : value === 'yes')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Has Email</SelectItem>
                <SelectItem value="no">No Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Phone Status</Label>
            <Select
              value={filters.hasPhone === null ? 'all' : filters.hasPhone ? 'yes' : 'no'}
              onValueChange={(value) => 
                updateFilter('hasPhone', value === 'all' ? null : value === 'yes')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Has Phone</SelectItem>
                <SelectItem value="no">No Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Specialties Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Specialties ({filters.selectedSpecialties.length} selected)
          </Label>
          <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
            {VENDOR_CATEGORIES.map((specialty) => (
              <div key={specialty} className="flex items-center space-x-2">
                <Checkbox
                  id={`specialty-${specialty}`}
                  checked={filters.selectedSpecialties.includes(specialty)}
                  onCheckedChange={() => toggleSpecialty(specialty)}
                />
                <Label htmlFor={`specialty-${specialty}`} className="text-sm cursor-pointer">
                  {specialty}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorAdvancedFilters;
