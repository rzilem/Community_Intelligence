import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Announcement, MessageCategory } from '@/types/communication-types';
import { useAnnouncements } from '@/hooks/communications/useAnnouncements';
import { useAssociations } from '@/hooks/associations/useAssociations';
import { useUser } from '@/hooks/auth/useUser';
import {
  FileText,
  Plus,
  Calendar,
  ListChecks,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { addDays } from 'date-fns';
import { toast } from 'sonner';

const MESSAGE_CATEGORIES: { value: MessageCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'events', label: 'Events' },
  { value: 'financial', label: 'Financial' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'community', label: 'Community News' },
];

interface AnnouncementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    priority: Announcement['priority'];
    expiry_date: string;
    category: MessageCategory;
  }) => Promise<void>;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Announcement['priority']>('normal');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState<MessageCategory>('announcement');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ title, content, priority, expiry_date: expiryDate, category });
    setTitle('');
    setContent('');
    setPriority('normal');
    setExpiryDate('');
    setCategory('announcement');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter announcement content"
              rows={4}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as Announcement['priority'])}>
              <SelectTrigger>
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
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={value => setCategory(value as MessageCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {MESSAGE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              type="date"
              id="expiry_date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Announcement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Announcements = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<string | null>(null);
  const { announcements, isLoading, createAnnouncement } = useAnnouncements();
  const { associations } = useAssociations();
  const { user } = useUser();

  useEffect(() => {
    if (associations && associations.length > 0) {
      setSelectedAssociation(associations[0].id);
    }
  }, [associations]);

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    normal: 'bg-gray-100 text-gray-800',
    high: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-red-100 text-red-800',
  };

  return (
    <PageTemplate
      title="Announcements"
      icon={<FileText className="h-8 w-8" />}
      description="Create and manage announcements for associations."
      actions={
        <div className="flex space-x-2">
          {associations && associations.length > 0 && (
            <Select value={selectedAssociation || ''} onValueChange={setSelectedAssociation}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select an association" />
              </SelectTrigger>
              <SelectContent>
                {associations.map((association) => (
                  <SelectItem key={association.id} value={association.id}>
                    {association.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Announcement
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <p>Loading announcements...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    {announcement.priority === 'low' && <Info className="text-blue-500 h-5 w-5" />}
                    {announcement.priority === 'normal' && <ListChecks className="text-gray-500 h-5 w-5" />}
                    {announcement.priority === 'high' && <AlertTriangle className="text-yellow-500 h-5 w-5" />}
                    {announcement.priority === 'urgent' && <XCircle className="text-red-500 h-5 w-5" />}
                    <CardTitle>{announcement.title}</CardTitle>
                  </div>
                  <CardDescription>
                    Published on {new Date(announcement.publish_date).toLocaleDateString()} | Category: {MESSAGE_CATEGORIES.find(c => c.value === announcement.category)?.label || announcement.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{announcement.content}</p>
                  <div className={`mt-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityColors[announcement.priority]}`}>
                    {announcement.priority}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AnnouncementForm
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={async (data) => {
            try {
              if (!selectedAssociation) {
                toast.error('Please select an association');
                return;
              }

              const announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> = {
                title: data.title,
                content: data.content,
                priority: data.priority,
                category: data.category,
                association_id: selectedAssociation,
                author_id: user?.id || '',
                is_published: true,
                publish_date: new Date().toISOString(),
                expiry_date: data.expiry_date || addDays(new Date(), 30).toISOString()
              };

              await createAnnouncement(announcement);
              setIsDialogOpen(false);

            } catch (error: any) {
              console.error('Error saving announcement:', error);
              toast.error(`Failed to save announcement: ${error.message}`);
            }
          }}
        />
      </div>
    </PageTemplate>
  );
};

export default Announcements;
