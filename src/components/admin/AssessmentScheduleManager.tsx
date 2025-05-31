
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSupabaseQuery, useSupabaseCreate, useSupabaseUpdate } from '@/hooks/supabase';
import { Calendar, DollarSign, RefreshCw, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AssessmentScheduleManagerProps {
  associationId: string;
}

const AssessmentScheduleManager: React.FC<AssessmentScheduleManagerProps> = ({ associationId }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assessmentTypeId: '',
    amount: '',
    scheduleType: 'monthly',
    recurrenceDay: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true
  });

  const { data: schedules = [], refetch: refetchSchedules } = useSupabaseQuery(
    'assessment_schedules',
    {
      select: `
        *,
        assessment_types(name)
      `,
      filter: [{ column: 'association_id', value: associationId }],
      order: { column: 'created_at', ascending: false }
    }
  );

  const { data: assessmentTypes = [] } = useSupabaseQuery(
    'assessment_types',
    {
      select: 'id, name',
      filter: [{ column: 'association_id', value: associationId }],
      order: { column: 'name', ascending: true }
    }
  );

  const createSchedule = useSupabaseCreate('assessment_schedules', {
    onSuccess: () => {
      toast.success('Assessment schedule created successfully');
      setFormData({
        name: '',
        description: '',
        assessmentTypeId: '',
        amount: '',
        scheduleType: 'monthly',
        recurrenceDay: '1',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true
      });
      setShowCreateForm(false);
      refetchSchedules();
    }
  });

  const updateSchedule = useSupabaseUpdate('assessment_schedules', {
    onSuccess: () => {
      toast.success('Schedule updated successfully');
      refetchSchedules();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduleData = {
      association_id: associationId,
      assessment_type_id: formData.assessmentTypeId,
      name: formData.name,
      description: formData.description,
      amount: parseFloat(formData.amount),
      schedule_type: formData.scheduleType,
      recurrence_day: parseInt(formData.recurrenceDay),
      start_date: formData.startDate,
      end_date: formData.endDate || null,
      is_active: formData.isActive,
      next_generation_date: formData.startDate
    };

    createSchedule.mutate(scheduleData);
  };

  const toggleScheduleActive = async (scheduleId: string, isActive: boolean) => {
    updateSchedule.mutate({
      id: scheduleId,
      data: { is_active: !isActive }
    });
  };

  const generateAssessments = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-assessments');
      
      if (error) throw error;
      
      toast.success(`Generated ${data.generatedCount} assessments`);
      refetchSchedules();
    } catch (error: any) {
      toast.error('Failed to generate assessments: ' + error.message);
    }
  };

  const getScheduleTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'bi_annual': return 'Bi-Annual';
      case 'annual': return 'Annual';
      case 'special': return 'Special';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assessment Schedules</h3>
        <div className="flex gap-2">
          <Button onClick={generateAssessments} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Due Assessments
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Assessment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Schedule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Monthly HOA Dues"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="assessmentType">Assessment Type</Label>
                  <Select
                    value={formData.assessmentTypeId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assessmentTypeId: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentTypes.map((type: any) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="150.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="scheduleType">Schedule Type</Label>
                  <Select
                    value={formData.scheduleType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, scheduleType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="bi_annual">Bi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="special">Special (One-time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recurrenceDay">Day of Month</Label>
                  <Input
                    id="recurrenceDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.recurrenceDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceDay: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Monthly association dues for common area maintenance..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSchedule.isPending}>
                  {createSchedule.isPending ? 'Creating...' : 'Create Schedule'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {schedules.map((schedule: any) => (
          <Card key={schedule.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{schedule.name}</h4>
                    <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {getScheduleTypeLabel(schedule.schedule_type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{schedule.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${schedule.amount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {schedule.assessment_types?.name}
                    </span>
                    {schedule.next_generation_date && (
                      <span>Next: {new Date(schedule.next_generation_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <Switch
                  checked={schedule.is_active}
                  onCheckedChange={() => toggleScheduleActive(schedule.id, schedule.is_active)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssessmentScheduleManager;
