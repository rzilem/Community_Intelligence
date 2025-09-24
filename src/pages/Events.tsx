import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Calendar, Plus, Edit, Trash2, MapPin, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useEvents, Event } from '@/hooks/events/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const Events: React.FC = () => {
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEvents();
  const { currentAssociation } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'community',
    start_date: '',
    end_date: '',
    location: '',
    max_attendees: '',
    requires_rsvp: false,
    rsvp_deadline: '',
    event_status: 'scheduled'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'community',
      start_date: '',
      end_date: '',
      location: '',
      max_attendees: '',
      requires_rsvp: false,
      rsvp_deadline: '',
      event_status: 'scheduled'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAssociation?.id) return;

    const eventData = {
      association_id: currentAssociation.id,
      title: formData.title,
      description: formData.description || undefined,
      event_type: formData.event_type,
      start_date: formData.start_date,
      end_date: formData.end_date || undefined,
      location: formData.location || undefined,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
      requires_rsvp: formData.requires_rsvp,
      rsvp_deadline: formData.rsvp_deadline || undefined,
      event_status: formData.event_status
    };

    try {
      if (editingEvent) {
        await updateEvent();
        setEditingEvent(null);
      } else {
        await createEvent();
        setIsCreateOpen(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_date: event.start_date.slice(0, 16), // Format for datetime-local input
      end_date: event.end_date?.slice(0, 16) || '',
      location: event.location || '',
      max_attendees: event.max_attendees?.toString() || '',
      requires_rsvp: event.requires_rsvp || false,
      rsvp_deadline: event.rsvp_deadline?.slice(0, 16) || '',
      event_status: event.event_status
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent();
    }
  };

  const EventForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date & Time</Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date & Time</Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="max_attendees">Max Attendees</Label>
        <Input
          id="max_attendees"
          type="number"
          value={formData.max_attendees}
          onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="requires_rsvp"
          checked={formData.requires_rsvp}
          onCheckedChange={(checked) => setFormData({ ...formData, requires_rsvp: checked })}
        />
        <Label htmlFor="requires_rsvp">Requires RSVP</Label>
      </div>
      {formData.requires_rsvp && (
        <div>
          <Label htmlFor="rsvp_deadline">RSVP Deadline</Label>
          <Input
            id="rsvp_deadline"
            type="datetime-local"
            value={formData.rsvp_deadline}
            onChange={(e) => setFormData({ ...formData, rsvp_deadline: e.target.value })}
          />
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsCreateOpen(false);
            setEditingEvent(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {editingEvent ? 'Update' : 'Create'} Event
        </Button>
      </div>
    </form>
  );

  return (
    <AppLayout>
      <PageTemplate
        title="Events"
        icon={<Calendar className="h-8 w-8" />}
        description="Manage community events and activities"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <EventForm />
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first community event to get started.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Event
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        {event.description && (
                          <CardDescription className="mt-1">{event.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(event.start_date), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.max_attendees && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.current_attendees}/{event.max_attendees} attendees</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground capitalize">{event.event_type}</span>
                         <span className={`px-2 py-1 rounded-full text-xs ${
                           event.event_status === 'active' ? 'bg-blue-100 text-blue-800' :
                           event.event_status === 'completed' ? 'bg-green-100 text-green-800' :
                           'bg-gray-100 text-gray-800'
                         }`}>
                          {event.event_status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {editingEvent && (
            <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Event</DialogTitle>
                </DialogHeader>
                <EventForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default Events;