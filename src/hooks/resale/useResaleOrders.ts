
import { useState, useEffect } from 'react';
import { ResaleOrder } from '@/types/resale-order-types';
import { useAuth } from '@/contexts/auth';

// Mock data for example orders
const mockOrders: ResaleOrder[] = [
  {
    id: "ord-1",
    orderNumber: "RSL-2025-0042",
    type: "Resale Certificate",
    address: "123 Main Street, Apt 4B, Anytown, TX 75001",
    ownerSeller: "John Davis",
    community: "Oakwood Heights HOA",
    communityId: "comm-1",
    priority: "Regular",
    scheduledDate: "2025-04-25",
    status: "Scheduled",
    createdAt: "2025-04-15T14:32:00Z",
    updatedAt: "2025-04-15T14:35:00Z"
  },
  {
    id: "ord-2",
    orderNumber: "RSL-2025-0039",
    type: "Condo Questionnaire",
    address: "456 Oak Avenue, Unit 12, Anytown, TX 75001",
    ownerSeller: "Sarah Johnson",
    community: "Park Place Condominiums",
    communityId: "comm-2",
    priority: "Urgent",
    scheduledDate: "2025-04-18",
    status: "In Review",
    createdAt: "2025-04-12T10:15:00Z",
    updatedAt: "2025-04-12T10:20:00Z"
  },
  {
    id: "ord-3",
    orderNumber: "RSL-2025-0035",
    type: "Mortgage Questionnaire",
    address: "789 Elm Boulevard, Anytown, TX 75001",
    ownerSeller: "Michael Brown",
    community: "Riverside Estates",
    communityId: "comm-3",
    propertyId: "prop-3",
    priority: "Standard",
    scheduledDate: "2025-04-10",
    status: "Completed",
    createdAt: "2025-04-05T09:45:00Z",
    updatedAt: "2025-04-10T15:30:00Z"
  },
  {
    id: "ord-4",
    orderNumber: "RSL-2025-0031",
    type: "Disclosure Packet",
    address: "321 Pine Street, Unit 7C, Anytown, TX 75001",
    ownerSeller: "Robert Wilson",
    community: "Maple Grove HOA",
    communityId: "comm-4",
    propertyId: "prop-4",
    priority: "Expedited",
    scheduledDate: "2025-04-05",
    status: "Past Due",
    createdAt: "2025-03-30T11:20:00Z",
    updatedAt: "2025-03-30T11:25:00Z"
  }
];

export function useResaleOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ResaleOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call to fetch orders
        // associated with the current user
        
        // Simulate API call with timeout
        setTimeout(() => {
          setOrders(mockOrders);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching resale orders:', err);
        setError('Failed to load orders. Please try again.');
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setIsLoading(false);
    }
  }, [user]);

  const refreshOrders = () => {
    setIsLoading(true);
    // Simulate refreshing data
    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  };

  return {
    orders,
    isLoading,
    error,
    refreshOrders
  };
}
