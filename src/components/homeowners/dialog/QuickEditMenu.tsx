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
  return <>
      

      

      
    </>;
};
export default QuickEditMenu;