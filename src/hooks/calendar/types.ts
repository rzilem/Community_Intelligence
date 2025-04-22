
export interface CalendarEventUI {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event' | 'scheduled_message' | 'scheduled_campaign';
  amenityId: string;
  color: string;
}

export interface NewCalendarEvent {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event' | 'scheduled_message' | 'scheduled_campaign';
  amenityId?: string;
  color?: string;
}
