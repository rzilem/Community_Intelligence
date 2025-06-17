
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Pencil, Check, X } from 'lucide-react';
import { Association } from '@/types/association-types';

interface PropertyTypeSectionProps {
  association: Association;
  isEditing: boolean;
  editingValue: string;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onValueChange: (value: string) => void;
  isUpdating: boolean;
}

const PROPERTY_TYPE_OPTIONS = [
  'Condominium',
  'HOA',
  'Community Association',
  'Townhome Association',
  'Cooperative',
  'Master Association',
  'Sub-Association'
];

const PropertyTypeSection: React.FC<PropertyTypeSectionProps> = ({
  association,
  isEditing,
  editingValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onValueChange,
  isUpdating
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Property Type Configuration
        </CardTitle>
        <CardDescription>
          Set the default property type for this association to enable smart data import mapping.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Property Type</label>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <Select value={editingValue} onValueChange={onValueChange}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={onSaveEdit} disabled={isUpdating || !editingValue}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelEdit} disabled={isUpdating}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                {association.property_type ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {association.property_type}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                    Not Configured
                  </Badge>
                )}
                <Button size="sm" variant="ghost" onClick={onStartEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {!association.property_type && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-700">
              <strong>Note:</strong> Setting a property type will automatically apply it to all 
              imported properties, eliminating the need to map the "Property Type" column during data imports.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyTypeSection;
