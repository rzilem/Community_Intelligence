
import React from 'react';
import { Resident } from './resident-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TooltipButton from '@/components/ui/tooltip-button';
import { useNavigate } from 'react-router-dom';
import { getStatusBadge, getResidentTypeBadge } from './resident-utils';

interface ResidentTableProps {
  residents: Resident[];
}

const ResidentTable: React.FC<ResidentTableProps> = ({ residents }) => {
  const navigate = useNavigate();

  const handleViewResident = (id: string) => {
    navigate(`/residents/${id}`);
  };

  if (residents.length === 0) {
    return (
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-3 px-4 text-left font-medium">ID</th>
              <th className="py-3 px-4 text-left font-medium">Name</th>
              <th className="py-3 px-4 text-left font-medium">Type</th>
              <th className="py-3 px-4 text-left font-medium">Email</th>
              <th className="py-3 px-4 text-left font-medium">Property</th>
              <th className="py-3 px-4 text-left font-medium">Association</th>
              <th className="py-3 px-4 text-left font-medium">Status</th>
              <th className="py-3 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="py-6 text-center text-muted-foreground">
                No residents found matching your search.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="py-3 px-4 text-left font-medium">ID</th>
            <th className="py-3 px-4 text-left font-medium">Name</th>
            <th className="py-3 px-4 text-left font-medium">Type</th>
            <th className="py-3 px-4 text-left font-medium">Email</th>
            <th className="py-3 px-4 text-left font-medium">Property</th>
            <th className="py-3 px-4 text-left font-medium">Association</th>
            <th className="py-3 px-4 text-left font-medium">Status</th>
            <th className="py-3 px-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {residents.map(resident => (
            <tr key={resident.id} className="border-b hover:bg-muted/20">
              <td className="py-3 px-4 font-medium">{resident.id}</td>
              <td className="py-3 px-4">
                <div 
                  className="flex items-center cursor-pointer hover:text-primary"
                  onClick={() => handleViewResident(resident.id)}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={resident.avatarUrl} />
                    <AvatarFallback>
                      {resident.name.split(' ').map(part => part[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {resident.name}
                </div>
              </td>
              <td className="py-3 px-4">{getResidentTypeBadge(resident.type)}</td>
              <td className="py-3 px-4">{resident.email}</td>
              <td className="py-3 px-4">{resident.propertyAddress}</td>
              <td className="py-3 px-4">{resident.association}</td>
              <td className="py-3 px-4">{getStatusBadge(resident.status)}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <TooltipButton 
                    size="sm" 
                    variant="ghost" 
                    tooltip="View resident details"
                    onClick={() => handleViewResident(resident.id)}
                  >
                    View
                  </TooltipButton>
                  <TooltipButton size="sm" variant="outline" tooltip="Edit resident information">
                    Edit
                  </TooltipButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResidentTable;
