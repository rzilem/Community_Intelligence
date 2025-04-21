
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const {
    data: users
  } = useSupabaseQuery('profiles', {
    select: 'id, first_name, last_name'
  });

  // Fetch associations
  const {
    data: associations
  } = useSupabaseQuery('associations', {
    select: 'id, name'
  });

  // Fetch properties
  const {
    data: properties
  } = useSupabaseQuery('properties', {
    select: 'id, address, unit_number',
    ...(associationId ? {
      filter: [{
        column: 'association_id',
        value: associationId
      }]
    } : {})
  }, !!associationId);

  // Filter users based on search
  const filteredUsers = React.useMemo(() => {
    return users?.filter(user => `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearch.toLowerCase()));
  }, [users, userSearch]);

  // Filter associations based on search
  const filteredAssociations = React.useMemo(() => {
    return associations?.filter(assoc => assoc.name.toLowerCase().includes(associationSearch.toLowerCase()));
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
    <div className="flex items-center border rounded-md bg-background">
      <div className={menuItemClass}>
        <User className="h-4 w-4 text-muted-foreground" />
        <Select
          value={assignedTo || ""}
          onValueChange={onAssignChange}
          onOpenChange={() => setUserSearch("")}
        >
          <SelectTrigger className="w-[140px] border-0 bg-transparent h-8">
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            <div className="py-2 px-2">
              <input
                className="w-full rounded-md border px-2 py-1 text-sm mb-2"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <SelectItem value="">Unassigned</SelectItem>
            {filteredUsers?.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={menuItemClass}>
        <Building className="h-4 w-4 text-muted-foreground" />
        <Select
          value={associationId || ""}
          onValueChange={onAssociationChange}
          onOpenChange={() => setAssociationSearch("")}
        >
          <SelectTrigger className="w-[160px] border-0 bg-transparent h-8">
            <SelectValue placeholder="Association..." />
          </SelectTrigger>
          <SelectContent>
            <div className="py-2 px-2">
              <input
                className="w-full rounded-md border px-2 py-1 text-sm mb-2"
                placeholder="Search associations..."
                value={associationSearch}
                onChange={(e) => setAssociationSearch(e.target.value)}
              />
            </div>
            <SelectItem value="">Unassigned</SelectItem>
            {filteredAssociations?.map(assoc => (
              <SelectItem key={assoc.id} value={assoc.id}>
                {assoc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={menuItemClass}>
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <Select
          value={propertyId || ""}
          onValueChange={onPropertyChange}
          onOpenChange={() => setPropertySearch("")}
          disabled={!associationId}
        >
          <SelectTrigger className="w-[180px] border-0 bg-transparent h-8">
            <SelectValue placeholder="Property..." />
          </SelectTrigger>
          <SelectContent>
            <div className="py-2 px-2">
              <input
                className="w-full rounded-md border px-2 py-1 text-sm mb-2"
                placeholder="Search properties..."
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                disabled={!associationId}
              />
            </div>
            <SelectItem value="">Unassigned</SelectItem>
            {filteredProperties?.map(property => (
              <SelectItem key={property.id} value={property.id}>
                {property.address} {property.unit_number ? `#${property.unit_number}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QuickEditMenu;
