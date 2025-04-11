
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { CalendarEvent } from '@/types/calendar-types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSupabaseCreate, useSupabaseDelete } from '@/hooks/supabase';
import { format, parseISO } from 'date-fns';

interface UseResaleCalendarEventsProps {
  date: Date;
  filters: {
    resaleOrders: boolean;
    propertyInspections: boolean;
    documentExpirations: boolean;
    documentUpdates: boolean;
  };
}

interface ResaleEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  type: 'rush_order' | 'normal_order' | 'questionnaire' | 'inspection' | 'document_expiration' | 'document_update';
  startTime: string;
  endTime: string;
  date: Date;
  color?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  property?: string;
}

interface NewResaleEvent {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  property?: string;
  type: string;
  color: string;
}

export const useResaleCalendarEvents = ({ date, filters }: UseResaleCalendarEventsProps) => {
  const { currentAssociation, user } = useAuth();
  const [events, setEvents] = useState<ResaleEvent[]>([]);
  const [newEvent, setNewEvent] = useState<NewResaleEvent>({
    title: '',
    date: date,
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    type: 'normal_order',
    color: '#3b6aff' // Default blue color
  });

  // Mock data for resale events - in a real app, this would come from the database
  const mockResaleEvents: ResaleEvent[] = [
    {
      id: '1',
      title: 'Rush Resale Certificate - 123 Main St',
      description: 'Urgent resale certificate needed for closing',
      property: '123 Main St',
      type: 'rush_order',
      startTime: '09:00',
      endTime: '12:00',
      date: new Date(),
      color: '#EF4444',
      status: 'in_progress'
    },
    {
      id: '2',
      title: 'Resale Certificate - 456 Oak Ave',
      description: 'Standard resale certificate for property sale',
      property: '456 Oak Ave',
      type: 'normal_order',
      startTime: '13:00',
      endTime: '15:00',
      date: new Date(),
      color: '#3b6aff',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Condo Questionnaire - Riverdale Gardens',
      description: 'Comprehensive questionnaire for lender',
      property: 'Riverdale Gardens Unit 12B',
      type: 'questionnaire',
      startTime: '10:00',
      endTime: '11:30',
      date: new Date(date.getTime() + 86400000), // Tomorrow
      color: '#8B5CF6',
      status: 'pending'
    },
    {
      id: '4',
      title: 'Property Inspection - 789 Pine Ln',
      description: 'Pre-sale inspection of the property',
      property: '789 Pine Ln',
      type: 'inspection',
      startTime: '14:00',
      endTime: '15:30',
      date: new Date(date.getTime() + 86400000), // Tomorrow
      color: '#f97316',
      status: 'pending'
    },
    {
      id: '5',
      title: 'Document Expiration - Highland Park HOA',
      description: 'CC&Rs document needs renewal',
      property: 'Highland Park HOA',
      type: 'document_expiration',
      startTime: '09:00',
      endTime: '09:30',
      date: new Date(date.getTime() + 172800000), // Day after tomorrow
      color: '#F59E0B',
      status: 'pending'
    },
    {
      id: '6',
      title: 'Document Update - Bylaws',
      description: 'Update bylaws with new amendments',
      property: 'Oakwood Heights',
      type: 'document_update',
      startTime: '11:00',
      endTime: '12:00',
      date: new Date(date.getTime() + 172800000), // Day after tomorrow
      color: '#10B981',
      status: 'completed'
    }
  ];

  // Query for calendar events
  const { data: calendarEvents, isLoading: eventsLoading, refetch } = useSupabaseQuery<CalendarEvent[]>(
    'calendar_events',
    {
      select: '*',
      filter: currentAssociation ? [{ column: 'hoa_id', value: currentAssociation.id }] : [],
    },
    !!currentAssociation
  );

  // Create event mutation
  const { mutate: createEvent, isPending: isCreating } = useSupabaseCreate('calendar_events', {
    showSuccessToast: true,
    invalidateQueries: [['calendar_events']]
  });

  // Delete event mutation
  const { mutate: deleteEvent, isPending: isDeleting } = useSupabaseDelete('calendar_events', {
    showSuccessToast: true,
    invalidateQueries: [['calendar_events']]
  });

  // Use effect to filter events based on mock data and filters
  useEffect(() => {
    // In a real implementation, we would fetch from the API and filter based on the filters
    let filteredEvents = [...mockResaleEvents];
    
    if (!filters.resaleOrders) {
      filteredEvents = filteredEvents.filter(event => 
        event.type !== 'rush_order' && event.type !== 'normal_order');
    }
    
    if (!filters.propertyInspections) {
      filteredEvents = filteredEvents.filter(event => 
        event.type !== 'inspection');
    }
    
    if (!filters.documentExpirations) {
      filteredEvents = filteredEvents.filter(event => 
        event.type !== 'document_expiration');
    }
    
    if (!filters.documentUpdates) {
      filteredEvents = filteredEvents.filter(event => 
        event.type !== 'document_update');
    }
    
    setEvents(filteredEvents);
  }, [filters]);

  // Reset form helper function
  const resetForm = () => {
    setNewEvent({
      title: '',
      date: date,
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      type: 'normal_order',
      color: '#3b6aff' // Reset to default blue color
    });
  };

  // Handler to create event
  const handleCreateEvent = (): boolean => {
    if (!currentAssociation) {
      toast.error("Please select an association first");
      return false;
    }

    if (!newEvent.title) {
      toast.error("Please enter a title for the event");
      return false;
    }

    // Create start and end time Date objects
    const startDate = new Date(newEvent.date);
    const [startHours, startMinutes] = newEvent.startTime.split(':');
    startDate.setHours(parseInt(startHours), parseInt(startMinutes));

    const endDate = new Date(newEvent.date);
    const [endHours, endMinutes] = newEvent.endTime.split(':');
    endDate.setHours(parseInt(endHours), parseInt(endMinutes));

    if (endDate <= startDate) {
      toast.error("End time must be after start time");
      return false;
    }

    // In a real implementation, we would save to the database here
    // For now, just simulate adding to our local state
    const newId = (events.length + 1).toString();
    const eventToAdd: ResaleEvent = {
      id: newId,
      title: newEvent.title,
      description: newEvent.description,
      property: newEvent.property,
      type: newEvent.type as any,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      date: newEvent.date,
      color: newEvent.color,
      status: 'pending'
    };
    
    setEvents(prev => [...prev, eventToAdd]);
    resetForm();
    toast.success("Event created successfully!");
    
    return true;
  };

  // Handler to delete event
  const handleDeleteEvent = (eventId: string) => {
    if (isDeleting) return;

    // Confirm before deleting
    if (confirm("Are you sure you want to delete this event?")) {
      // In a real implementation, we would delete from the database here
      // For now, just simulate removing from our local state
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success("Event deleted successfully");
    }
  };

  return {
    events,
    newEvent,
    setNewEvent,
    eventsLoading: false, // Mock loading state
    isCreating: false,    // Mock creating state
    isDeleting: false,    // Mock deleting state
    handleCreateEvent,
    handleDeleteEvent,
    hasAssociation: !!currentAssociation
  };
};
