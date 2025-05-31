
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  startTime: string;
  endTime: string;
  event_type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
  hoa_id: string;
  association_id: string;
  amenity_id?: string;
  location?: string;
  booked_by?: string;
  visibility: 'private' | 'public';
  color?: string;
  allDay: boolean;
  resourceId?: string;
  created_at: string;
  updated_at: string;
}

export interface NewCalendarEvent {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  event_type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
  amenity_id?: string;
  location?: string;
  color?: string;
  allDay?: boolean;
}
