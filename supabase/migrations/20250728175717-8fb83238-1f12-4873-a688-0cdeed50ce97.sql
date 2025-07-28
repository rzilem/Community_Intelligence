-- Create amenities table
CREATE TABLE IF NOT EXISTS public.amenities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  booking_fee DECIMAL(10,2) DEFAULT 0,
  requires_approval BOOLEAN DEFAULT false,
  available_start_time TIME,
  available_end_time TIME,
  advance_booking_days INTEGER DEFAULT 30,
  max_booking_duration_hours INTEGER DEFAULT 8,
  amenity_type TEXT DEFAULT 'general',
  location TEXT,
  amenity_rules JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table  
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'community',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  requires_rsvp BOOLEAN DEFAULT false,
  rsvp_deadline TIMESTAMP WITH TIME ZONE,
  event_status TEXT DEFAULT 'scheduled',
  created_by UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create amenity bookings table
CREATE TABLE IF NOT EXISTS public.amenity_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id),
  booked_by UUID REFERENCES auth.users(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  total_fee DECIMAL(10,2) DEFAULT 0,
  special_requests TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event attendees table
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  attendee_id UUID NOT NULL REFERENCES auth.users(id),
  property_id UUID REFERENCES public.properties(id),
  rsvp_status TEXT DEFAULT 'pending',
  guest_count INTEGER DEFAULT 0,
  special_requests TEXT,
  rsvp_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, attendee_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_amenities_association_id ON public.amenities(association_id);
CREATE INDEX IF NOT EXISTS idx_events_association_id ON public.events(association_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_amenity_bookings_amenity_id ON public.amenity_bookings(amenity_id);
CREATE INDEX IF NOT EXISTS idx_amenity_bookings_booking_date ON public.amenity_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);

-- Add RLS policies for amenities
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view amenities in their association" ON public.amenities
  FOR SELECT USING (
    association_id IN (
      SELECT association_id FROM public.association_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Association admins can manage amenities" ON public.amenities
  FOR ALL USING (
    association_id IN (
      SELECT association_id FROM public.association_users 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events in their association" ON public.events
  FOR SELECT USING (
    association_id IN (
      SELECT association_id FROM public.association_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Association members can create events" ON public.events
  FOR INSERT WITH CHECK (
    association_id IN (
      SELECT association_id FROM public.association_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators and admins can update events" ON public.events
  FOR UPDATE USING (
    created_by = auth.uid() OR
    association_id IN (
      SELECT association_id FROM public.association_users 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policies for amenity bookings
ALTER TABLE public.amenity_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bookings for amenities in their association" ON public.amenity_bookings
  FOR SELECT USING (
    amenity_id IN (
      SELECT id FROM public.amenities 
      WHERE association_id IN (
        SELECT association_id FROM public.association_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create bookings for amenities in their association" ON public.amenity_bookings
  FOR INSERT WITH CHECK (
    booked_by = auth.uid() AND
    amenity_id IN (
      SELECT id FROM public.amenities 
      WHERE association_id IN (
        SELECT association_id FROM public.association_users WHERE user_id = auth.uid()
      )
    )
  );

-- Add RLS policies for event attendees
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attendees for events in their association" ON public.event_attendees
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM public.events 
      WHERE association_id IN (
        SELECT association_id FROM public.association_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage their own event attendance" ON public.event_attendees
  FOR ALL USING (attendee_id = auth.uid());

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_amenities_updated_at
  BEFORE UPDATE ON public.amenities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_amenity_bookings_updated_at
  BEFORE UPDATE ON public.amenity_bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_event_attendees_updated_at
  BEFORE UPDATE ON public.event_attendees
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();