
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/date-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ResidentTableProps {
  loading: boolean;
  residents: any[];
  totalCount: number;
}

const ResidentTable: React.FC<ResidentTableProps> = ({ 
  loading, 
  residents,
  totalCount
}) => {
  const navigate = useNavigate();
  
  // Handle click to view resident details
  const handleViewResident = (id: string) => {
    navigate(`/residents/${id}`);
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Association</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[160px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[140px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Association</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {residents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No residents found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            residents.map((resident) => (
              <TableRow 
                key={resident.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewResident(resident.id)}
              >
                <TableCell className="font-medium">
                  {resident.name}
                </TableCell>
                <TableCell>{resident.email}</TableCell>
                <TableCell>{resident.propertyAddress}</TableCell>
                <TableCell>
                  {resident.hasValidAssociation ? (
                    resident.associationName
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-amber-600">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            {resident.associationName}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This owner has an invalid association assignment</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={resident.status === 'active' ? 'default' : 'outline'} 
                    className={resident.status === 'inactive' ? 'bg-gray-100 text-gray-800' : ''}
                  >
                    {resident.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {resident.type === 'owner' ? 'Owner' : 
                     resident.type === 'tenant' ? 'Tenant' : 
                     resident.type === 'family' ? 'Family Member' : 
                     resident.type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <div className="py-4 px-6 flex items-center justify-between text-sm text-muted-foreground border-t">
        <div>
          Showing {residents.length} of {totalCount} owners
        </div>
      </div>
    </div>
  );
};

export default ResidentTable;
