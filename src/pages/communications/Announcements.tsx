
import React, { useState, useEffect } from 'react';
import { Bell, Plus, Search, Filter, Edit, Trash, Calendar, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { communicationService } from '@/services/communication-service';
import { Announcement } from '@/types/communication-types';
import RecipientSelector from '@/components/communications/RecipientSelector';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [associations, setAssociations] = useState<any[]>([]);
  const [selectedAssociation, setSelectedAssociation] = useState<string>('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [selectedRecipientGroups, setSelectedRecipientGroups] = useState<string[]>([]);

  useEffect(() => {
    fetchAssociations();
  }, []);

  useEffect(() => {
    if (selectedAssociation) {
      fetchAnnouncements(selectedAssociation);
    }
  }, [selectedAssociation]);

  const fetchAssociations = async () => {
    try {
      setIsLoading(true);
      const data = await communicationService.getAllAssociations();
      setAssociations(data);
      if (data.length > 0) {
        setSelectedAssociation(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching associations:', error);
      toast.error('Failed to load associations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async (associationId: string) => {
    try {
      setIsLoading(true);
      const data = await communicationService.getAnnouncements(associationId);
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setTitle('');
    setContent('');
    setPriority('normal');
    setSelectedRecipientGroups([]);
    setIsDialogOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setPriority(announcement.priority as 'low' | 'normal' | 'high' | 'urgent' || 'normal');
    setIsDialogOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!title || !content) {
      toast.error('Please fill out all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const announcementData: Partial<Announcement> = {
        title,
        content,
        priority,
        association_id: selectedAssociation,
        is_published: true,
        publish_date: new Date().toISOString()
      };

      if (editingAnnouncement) {
        // Update existing announcement
        await communicationService.updateAnnouncement(editingAnnouncement.id, announcementData);
        toast.success('Announcement updated successfully');
      } else {
        // Create new announcement
        await communicationService.createAnnouncement(announcementData);
        toast.success('Announcement created successfully');
      }

      // Refresh the list
      fetchAnnouncements(selectedAssociation);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setIsLoading(true);
      await communicationService.deleteAnnouncement(id);
      toast.success('Announcement deleted successfully');
      
      // Refresh the list
      fetchAnnouncements(selectedAssociation);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => 
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">High</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            className="pl-9 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {associations.length > 0 && (
            <Select value={selectedAssociation} onValueChange={setSelectedAssociation}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Association" />
              </SelectTrigger>
              <SelectContent>
                {associations.map((assoc: any) => (
                  <SelectItem key={assoc.id} value={assoc.id}>{assoc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button className="flex-1 sm:flex-none gap-2" onClick={handleCreateAnnouncement}>
            <Plus className="h-4 w-4" />
            New Announcement
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <p>Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-10">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Announcements</h3>
              <p className="text-muted-foreground">
                No announcements have been created for this association yet.
              </p>
              <Button className="mt-4" onClick={handleCreateAnnouncement}>
                Create First Announcement
              </Button>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-10">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Results</h3>
              <p className="text-muted-foreground">
                No announcements found for your search term.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>{getPriorityBadge(announcement.priority)}</TableCell>
                    <TableCell>
                      {announcement.publish_date ? format(new Date(announcement.publish_date), 'MMM d, yyyy') : 'Not published'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditAnnouncement(announcement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </DialogTitle>
            <DialogDescription>
              Fill out the form below to {editingAnnouncement ? 'update the' : 'create a new'} announcement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                placeholder="Enter announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea
                id="content"
                placeholder="Enter announcement content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAnnouncement} disabled={!title || !content || isLoading}>
              {isLoading ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Announcements;
