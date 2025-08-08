
export type CalendarEvent = {
  id: string;
  association_id: string;
  hoa_id?: string; // legacy compatibility
  title: string;
  description?: string;
  event_type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
  start_time: string;
  end_time: string;
  amenity_id?: string;
  location?: string;
  booked_by?: string;
  visibility: 'private' | 'public';
  color?: string;
  created_at: string;
  updated_at: string;
};
