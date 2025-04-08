
// Calendar related types
export type CalendarEvent = {
  id: string;
  hoa_id: string;
  amenity_id?: string;
  event_type: string;
  title: string;
  start_time: string;
  end_time: string;
  booked_by?: string;
  visibility: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
};
