
export interface Amenity {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  capacity?: number;
  booking_fee?: number;
  requires_approval?: boolean;
  availability_hours?: string;
  image_url?: string;
  location?: string;
  amenity_type: 'pool' | 'gym' | 'clubhouse' | 'tennis_court' | 'playground' | 'other';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AmenityBooking {
  id: string;
  amenity_id: string;
  property_id: string;
  resident_id?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  guests_count?: number;
  special_requests?: string;
  total_fee?: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  check_in_code?: string;
  created_at: string;
  updated_at: string;
  amenity?: Amenity;
}

export interface AmenityAvailability {
  amenity_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface BookingConflict {
  conflict_type: 'overlap' | 'capacity' | 'maintenance' | 'blocked';
  conflicting_booking_id?: string;
  suggested_times?: string[];
  message: string;
}
