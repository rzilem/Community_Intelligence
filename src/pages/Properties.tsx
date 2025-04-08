
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PropertyTable from '@/components/properties/PropertyTable';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertyActionButtons from '@/components/properties/PropertyActionButtons';
import PropertyPagination from '@/components/properties/PropertyPagination';
import { mockProperties } from '@/components/properties/PropertyData';

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: 'single-family' | 'townhouse' | 'condo' | 'apartment';
  bedrooms: number;
  bathrooms: number;
  sqFt: number;
  association: string;
  associationId: string;
  status: 'occupied' | 'vacant' | 'pending' | 'delinquent';
  ownerName?: string;
}

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssociation, setFilterAssociation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = 
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
      property.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.ownerName && property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesAssociation = filterAssociation === 'all' || property.association === filterAssociation;
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    
    return matchesSearch && matchesAssociation && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Management</CardTitle>
            <CardDescription>View and manage all properties across your community associations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <PropertyFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterAssociation={filterAssociation}
                setFilterAssociation={setFilterAssociation}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
              />
              <PropertyActionButtons />
            </div>
            
            <PropertyTable properties={filteredProperties} />
            
            <PropertyPagination 
              filteredCount={filteredProperties.length}
              totalCount={mockProperties.length}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Properties;
