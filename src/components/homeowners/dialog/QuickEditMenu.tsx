
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
  // Track search inputs
  const [userSearch, setUserSearch] = React.useState("");
  const [associationSearch, setAssociationSearch] = React.useState("");
  const [propertySearch, setPropertySearch] = React.useState("");

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

  // Filter users based on search
  const filteredUsers = React.useMemo(() => {
    return users?.filter(user => 
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  // Filter associations based on search
  const filteredAssociations = React.useMemo(() => {
    return associations?.filter(assoc =>
      assoc.name.toLowerCase().includes(associationSearch.toLowerCase())
    );
  }, [associations, associationSearch]);

  // Filter properties based on search
  const filteredProperties = React.useMemo(() => {
    return properties?.filter(property => {
      const addressText = `${property.address} ${property.unit_number || ''}`;
      return addressText.toLowerCase().includes(propertySearch.toLowerCase());
    });
  }, [properties, propertySearch]);

  const menuItemClass = "flex items-center space-x-1 border-r last:border-r-0 px-3";

  return (
    <div className={cn(
      "flex justify-between items-center bg-gradient-to-r from-slate-100 to-slate-50",
      "px-2 py-1 rounded-md border shadow-sm transition-all duration-200",
      "hover:shadow-md hover:from-slate-50 hover:to-white",
      "dark:from-slate-800 dark:to-slate-900/90 dark:text-slate-200",
      "dark:hover:from-slate-800/90 dark:hover:to-slate-900/80"
    )}>
      <div className="flex items-center text-xs">
        <div className={menuItemClass}>
          <User className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <Select value={assignedTo || "unassigned"} onValueChange={onAssignChange}>
            <SelectTrigger className="h-7 w-[130px] text-xs border-0 bg-transparent hover:bg-white/50 dark:hover:bg-black/20 rounded focus:ring-0">
              <SelectValue placeholder="Assign to..." />
            </SelectTrigger>
            <SelectContent>
              <input
                className="px-2 py-1 text-xs w-full border-b mb-1"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {filteredUsers?.map(user => (
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
              <input
                className="px-2 py-1 text-xs w-full border-b mb-1"
                placeholder="Search associations..."
                value={associationSearch}
                onChange={(e) => setAssociationSearch(e.target.value)}
              />
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {filteredAssociations?.map(assoc => (
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
              <input
                className="px-2 py-1 text-xs w-full border-b mb-1"
                placeholder="Search properties..."
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
              />
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {filteredProperties?.map(property => (
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
