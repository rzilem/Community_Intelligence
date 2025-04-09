
import Associations from './Associations';

// For backward compatibility with existing imports
export type Property = {
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
};

export default Associations;
