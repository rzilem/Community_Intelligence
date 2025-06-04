
// Amenity related types
export type Amenity = {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  capacity?: number;
  booking_fee?: number;
  requires_approval?: boolean;
  created_at?: string;
  updated_at?: string;
};
