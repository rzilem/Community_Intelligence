
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Building, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseQuery } from "@/hooks/supabase/use-supabase-query";

interface QuickEditMenuProps {
  assignedTo: string | null;
  associationId: string | null;
  propertyId: string | null;
  onAssignChange: (value: string) => void;
  onAssociationChange: (value: string) => void;
  onPropertyChange: (value: string) => void;
}

const QuickEditMenu: React.FC<QuickEditMenuProps> = ({
  assignedTo,
  associationId,
  propertyId,
  onAssignChange,
  onAssociationChange,
  onPropertyChange
}) => {
  // Fetch users for assignment
  const { data: users } = useSupabaseQuery(
    'profiles',
    {
      select: 'id, first_name, last_name',
    }
  );

  // Fetch associations
  const { data: associations } = useSupabaseQuery(
    'associations',
    {
      select: 'id, name',
    }
  );

  // Fetch properties
  const { data: properties } = useSupabaseQuery(
    'properties',
    {
      select: 'id, address, unit_number',
      ...(associationId ? { filter: [{ column: 'association_id', value: associationId }] } : {})
    },
    !!associationId
  );

  const menuItemClass = "flex items-center space-x-1 border-r last:border-r-0 px-3";

  return (
    <div className={cn(
      "flex justify-between items-center bg-gradient-to-r from-slate-100 to-slate-50",
      "px-2 py-1 rounded-md border shadow-sm",
      "dark:from-slate-800 dark:to-slate-900/90 dark:text-slate-200"
    )}>
      <div className="flex items-center text-xs">
        <div className={menuItemClass}>
          <User className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <Select value={assignedTo || "unassigned"} onValueChange={onAssignChange}>
            <SelectTrigger className="h-7 w-[130px] text-xs border-0 bg-transparent hover:bg-white/50 dark:hover:bg-black/20 rounded focus:ring-0">
              <SelectValue placeholder="Assign to..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {users?.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={menuItemClass}>
          <Building className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <Select value={associationId || "unassigned"} onValueChange={onAssociationChange}>
            <SelectTrigger className="h-7 w-[130px] text-xs border-0 bg-transparent hover:bg-white/50 dark:hover:bg-black/20 rounded focus:ring-0">
              <SelectValue placeholder="Association..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {associations?.map(assoc => (
                <SelectItem key={assoc.id} value={assoc.id}>
                  {assoc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={menuItemClass}>
          <MapPin className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <Select 
            value={propertyId || "unassigned"} 
            onValueChange={onPropertyChange}
            disabled={!associationId}
          >
            <SelectTrigger className="h-7 w-[130px] text-xs border-0 bg-transparent hover:bg-white/50 dark:hover:bg-black/20 rounded focus:ring-0">
              <SelectValue placeholder="Property..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {properties?.map(property => (
                <SelectItem key={property.id} value={property.id}>
                  {property.address} {property.unit_number ? `#${property.unit_number}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default QuickEditMenu;
