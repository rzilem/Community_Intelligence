
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Association } from '@/types/association-types';
import { PropertyUI } from '@/types/property-types';
import { ResaleOrder, ResalePriority, ResaleOrderStatus, ResaleOrderType } from '@/types/resale-order-types';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';
import { mockProperties } from '@/components/properties/PropertyData';

export const useResaleOrders = () => {
  const [orders, setOrders] = useState<ResaleOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: associations = [] } = useSupabaseQuery<Association[]>(
    'associations',
    { select: 'id, name' }
  );

  // Generate a random order number with MOH prefix
  const generateOrderNumber = (): string => {
    return `MOH-${Math.floor(400000 + Math.random() * 99999)}`;
  };

  // Generate a random date within the next 14 days
  const generateScheduledDate = (): string => {
    const today = new Date();
    const randomDays = Math.floor(Math.random() * 14);
    const scheduledDate = new Date();
    scheduledDate.setDate(today.getDate() + randomDays);
    return format(scheduledDate, 'MM/dd/yy');
  };

  // Select a random item from an array
  const getRandomItem = <T,>(items: T[]): T => {
    return items[Math.floor(Math.random() * items.length)];
  };

  // Generate mock resale orders based on real associations and properties
  useEffect(() => {
    const generateMockOrders = () => {
      if (associations.length === 0) return;
      
      setIsLoading(true);
      
      try {
        // Use available real associations
        const mockOrders: ResaleOrder[] = [];
        
        // Sample statuses and priorities
        const statuses: ResaleOrderStatus[] = ['Scheduled', 'Completed', 'In Review', 'Past Due'];
        const priorities: ResalePriority[] = ['Urgent', 'Regular', 'Standard', 'Expedited'];
        const types: ResaleOrderType[] = [
          'Resale Certificate', 
          'Mortgage Questionnaire', 
          'Questionnaire', 
          'Compliance Questionnaire', 
          'Condo Questionnaire'
        ];
        
        // Generate owner names
        const ownerFirstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jennifer', 'Robert', 'Lisa', 'William', 'Mary', 'Richard', 'Linda', 'Charles', 'Barbara', 'Joseph', 'Susan'];
        const ownerLastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'];

        // Generate around 10-20 mock orders
        const numOrders = 10 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < numOrders; i++) {
          const association = getRandomItem(associations);
          const property = getRandomItem(mockProperties);
          const firstName = getRandomItem(ownerFirstNames);
          const lastName = getRandomItem(ownerLastNames);
          
          mockOrders.push({
            id: `order-${i + 1}`,
            orderNumber: generateOrderNumber(),
            address: property ? property.address : `${123 + i} Main Street, Austin, TX 78701`,
            ownerSeller: `${firstName} ${lastName}`,
            community: association.name,
            communityId: association.id,
            propertyId: property ? property.id : undefined,
            type: getRandomItem(types),
            priority: getRandomItem(priorities),
            scheduledDate: generateScheduledDate(),
            status: getRandomItem(statuses),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        setOrders(mockOrders);
        setError(null);
      } catch (err) {
        console.error('Error generating mock orders:', err);
        setError('Failed to generate mock orders');
      } finally {
        setIsLoading(false);
      }
    };

    generateMockOrders();
  }, [associations]);

  return {
    orders,
    isLoading,
    error,
    refreshOrders: () => {
      // Regenerate orders
      const now = new Date();
      setOrders(prevOrders => 
        prevOrders.map(order => ({
          ...order,
          updatedAt: now.toISOString()
        }))
      );
    }
  };
};
