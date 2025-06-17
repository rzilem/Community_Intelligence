
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Check, X } from 'lucide-react';
import { Association } from '@/types/association-types';
import { toast } from 'sonner';

interface PropertyTypeManagerProps {
  associations: Association[];
  onUpdatePropertyType: (id: string, propertyType: string) => void;
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

const PropertyTypeManager: React.FC<PropertyTypeManagerProps> = ({
  associations,
  onUpdatePropertyType,
  isUpdating
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const handleStartEdit = (association: Association) => {
    setEditingId(association.id);
    setEditingValue(association.property_type || '');
  };

  const handleSaveEdit = () => {
    if (editingId && editingValue.trim()) {
      onUpdatePropertyType(editingId, editingValue.trim());
      setEditingId(null);
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const associationsWithoutPropertyType = associations.filter(a => !a.property_type);
  const associationsWithPropertyType = associations.filter(a => a.property_type);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Type Management</CardTitle>
          <CardDescription>
            Configure property types for associations to enable smart data import mapping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {associationsWithoutPropertyType.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-amber-600">
                Associations Missing Property Type ({associationsWithoutPropertyType.length})
              </h3>
              <div className="space-y-2">
                {associationsWithoutPropertyType.map((association) => (
                  <div key={association.id} className="flex items-center justify-between p-3 border border-amber-200 rounded-lg bg-amber-50">
                    <div>
                      <p className="font-medium">{association.name}</p>
                      <p className="text-sm text-gray-600">{association.city}, {association.state}</p>
                    </div>
                    {editingId === association.id ? (
                      <div className="flex items-center gap-2">
                        <Select value={editingValue} onValueChange={setEditingValue}>
                          <SelectTrigger className="w-48">
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
                        <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating || !editingValue}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isUpdating}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => handleStartEdit(association)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Set Type
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {associationsWithPropertyType.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-green-600">
                Configured Associations ({associationsWithPropertyType.length})
              </h3>
              <div className="space-y-2">
                {associationsWithPropertyType.map((association) => (
                  <div key={association.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
                    <div>
                      <p className="font-medium">{association.name}</p>
                      <p className="text-sm text-gray-600">{association.city}, {association.state}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId === association.id ? (
                        <>
                          <Select value={editingValue} onValueChange={setEditingValue}>
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PROPERTY_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isUpdating}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {association.property_type}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => handleStartEdit(association)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyTypeManager;
