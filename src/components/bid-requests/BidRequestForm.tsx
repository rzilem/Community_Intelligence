
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Send, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BidRequestFormData } from '@/types/bid-request-types';
import { createBidRequest } from '@/services/bid-requests/bid-request-api';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const BidRequestForm = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BidRequestFormData>>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
    special_requirements: '',
    budget_range_min: undefined,
    budget_range_max: undefined,
    preferred_start_date: '',
    required_completion_date: '',
    bid_deadline: '',
    status: 'draft'
  });

  const [bidDeadline, setBidDeadline] = useState<Date>();
  const [startDate, setStartDate] = useState<Date>();
  const [completionDate, setCompletionDate] = useState<Date>();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!profile?.association_id || !user?.id) {
      toast.error('Missing association or user information');
      return;
    }

    if (!formData.title?.trim()) {
      toast.error('Please enter a title for your bid request');
      return;
    }

    setLoading(true);
    try {
      const bidRequestData: Partial<any> = {
        title: formData.title,
        description: formData.description || '',
        category: formData.category || '',
        priority: formData.priority || 'medium',
        location: formData.location || '',
        special_requirements: formData.special_requirements || '',
        budget_range_min: formData.budget_range_min,
        budget_range_max: formData.budget_range_max,
        preferred_start_date: startDate?.toISOString().split('T')[0],
        required_completion_date: completionDate?.toISOString().split('T')[0],
        bid_deadline: bidDeadline?.toISOString(),
        status: isDraft ? 'draft' : 'published',
        association_id: profile.association_id,
        hoa_id: profile.association_id,
        created_by: user.id,
        visibility: 'private',
        attachments: []
      };

      await createBidRequest(bidRequestData);
      
      toast.success(isDraft ? 'Draft saved successfully' : 'Bid request created successfully');
      navigate('/community-management/bid-requests');
    } catch (error) {
      console.error('Error creating bid request:', error);
      toast.error('Failed to create bid request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide the essential details for your bid request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Parking Lot Resurfacing"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscaping">Landscaping</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="roofing">Roofing</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Building A Parking Lot"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the work that needs to be done..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              id="special_requirements"
              placeholder="Any special requirements, materials, or considerations..."
              value={formData.special_requirements}
              onChange={(e) => handleInputChange('special_requirements', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget & Timeline</CardTitle>
          <CardDescription>
            Set your budget range and project timeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_min">Minimum Budget ($)</Label>
              <Input
                id="budget_min"
                type="number"
                placeholder="0"
                value={formData.budget_range_min || ''}
                onChange={(e) => handleInputChange('budget_range_min', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_max">Maximum Budget ($)</Label>
              <Input
                id="budget_max"
                type="number"
                placeholder="0"
                value={formData.budget_range_max || ''}
                onChange={(e) => handleInputChange('budget_range_max', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Bid Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !bidDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bidDeadline ? format(bidDeadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={bidDeadline}
                    onSelect={setBidDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Preferred Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Required Completion</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !completionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {completionDate ? format(completionDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={completionDate}
                    onSelect={setCompletionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => handleSubmit(true)}
          disabled={loading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={loading}
        >
          <Send className="h-4 w-4 mr-2" />
          Publish Request
        </Button>
      </div>
    </div>
  );
};

export default BidRequestForm;
