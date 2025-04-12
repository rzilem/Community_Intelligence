
import React from 'react';
import { Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DefaultAssociationCardProps {
  defaultAssociationId: string | undefined;
  onChange: (value: string) => void;
}

const DefaultAssociationCard: React.FC<DefaultAssociationCardProps> = ({ 
  defaultAssociationId, 
  onChange 
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <CardTitle>Default Association</CardTitle>
        </div>
        <CardDescription>
          Select the default association to load on startup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select 
          value={defaultAssociationId || ''} 
          onValueChange={onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select default association" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assoc-1">Oakwood HOA</SelectItem>
            <SelectItem value="assoc-2">Pineview Community</SelectItem>
            <SelectItem value="assoc-3">Lakeshore Estates</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default DefaultAssociationCard;
