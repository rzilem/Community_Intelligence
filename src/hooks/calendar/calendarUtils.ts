export const getDefaultColorForType = (eventType: string): string => {
  switch (eventType) {
    case 'amenity_booking':
      return '#3B82F6'; // blue-500
    case 'hoa_meeting':
      return '#EF4444'; // red-500
    case 'maintenance':
      return '#F59E0B'; // amber-500
    case 'community_event':
      return '#10B981'; // emerald-500
    default:
      return '#6366F1'; // indigo-500
  }
};

export const getCalendarEventBackgroundClass = (eventType: string): string => {
  switch (eventType) {
    case 'amenity_booking':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'hoa_meeting':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'maintenance':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'community_event':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    default:
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
  }
};

export const formatTimeRange = (start: string, end: string): string => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  
  return `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const createCalendarEvent = (data: any) => {
  const {
    title,
    start_time,
    end_time,
    event_type,
    description,
    location,
    association_id,
    visibility
  } = data;
  
  // These would typically be API calls to create the event
  console.log('Creating calendar event:', data);
  
  return {
    id: `event-${Math.random().toString(36).substr(2, 9)}`,
    title,
    start_time,
    end_time,
    event_type: event_type || 'general',
    description,
    location,
    hoa_id: association_id,
    visibility: visibility || 'private',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const connectFormToCalendar = (formData: any, eventType: string = 'general') => {
  // This function would handle the logic to create a calendar event from form data
  const calendarEventData = {
    title: formData.title || 'Untitled Event',
    start_time: formData.start_date || new Date().toISOString(),
    end_time: formData.end_date || new Date(Date.now() + 3600000).toISOString(),
    event_type: eventType,
    description: formData.description || '',
    location: formData.location || '',
    association_id: formData.association_id,
    visibility: formData.visibility || 'private'
  };
  
  return createCalendarEvent(calendarEventData);
};
