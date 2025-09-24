export type EventStatus = 'active' | 'cancelled' | 'completed' | 'draft';
export type EventType = 'meeting' | 'social' | 'maintenance' | 'emergency' | 'other';

export interface Event {
  id: string;
  association_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  location?: string;
  max_attendees?: number;
  current_attendees?: number;
  event_status: EventStatus;
  registration_required?: boolean;
  registration_deadline?: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
}