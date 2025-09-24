import React, { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Calendar, Plus, Edit, Trash2, Play, Pause, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TooltipButton from '@/components/ui/tooltip-button';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

const AssessmentSchedules = () => {
  const { currentAssociation } = useAuth();
  const associationId = currentAssociation?.id;

  // Mock data for assessment schedules
  const schedules = [
    {
      id: '1',
      name: 'Monthly HOA Fee',
      schedule_type: 'monthly',
      amount: 350,
      next_generation_date: '2024-01-01',
      last_generated_at: '2023-12-01',
      is_active: true,
      association_id: associationId
    },
    {
      id: '2',
      name: 'Quarterly Reserve Fund',
      schedule_type: 'quarterly',
      amount: 1200,
      next_generation_date: '2024-01-15',
      last_generated_at: '2023-10-15',
      is_active: true,
      association_id: associationId
    }
  ];

  // Mock properties data
  const properties = [
    { id: '1', association_id: associationId },
    { id: '2', association_id: associationId },
    { id: '3', association_id: associationId },
  ];

  const propertiesCount = properties?.length || 0;
  const activeCount = schedules.filter((s: any) => s.is_active).length;

  const handleGenerateNow = async () => {
    // Mock implementation
    toast.success(`Generated 3 assessments`);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    // Mock implementation
    toast.success(`Schedule ${!isActive ? 'activated' : 'paused'}`);
  };

  const handleDelete = async (id: string) => {
    // Mock implementation
    toast.success('Schedule deleted');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <AppLayout>
      <PageTemplate
        title="Assessment Schedules"
        icon={<Calendar className="h-8 w-8" />}
        description="Manage recurring assessment schedules and billing cycles."
        actions={
          <div className="flex items-center gap-2">
            <TooltipButton
              tooltip="Generate assessments for due schedules now"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleGenerateNow}
            >
              <Zap className="h-4 w-4" />
              Generate Now
            </TooltipButton>
            <TooltipButton
              tooltip="Create a new assessment schedule"
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Schedule
            </TooltipButton>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCount}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(42000)}</div>
                <p className="text-xs text-muted-foreground">From active schedules</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Next Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    try {
                      const dates = schedules
                        .filter((s: any) => s.next_generation_date)
                        .map((s: any) => new Date(s.next_generation_date).getTime());
                      if (!dates.length) return '—';
                      return new Date(Math.min(...dates)).toLocaleDateString();
                    } catch (_e) {
                      return '—';
                    }
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">Next scheduled</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{propertiesCount}</div>
                <p className="text-xs text-muted-foreground">Receiving assessments</p>
              </CardContent>
            </Card>
          </div>

          {/* Schedules Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule: any) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>{schedule.schedule_type}</TableCell>
                      <TableCell>{formatCurrency(Number(schedule.amount || 0))}</TableCell>
                      <TableCell>{schedule.next_generation_date ? new Date(schedule.next_generation_date).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(schedule.is_active ? 'active' : 'paused')}>
                          {schedule.is_active ? 'active' : 'paused'}
                        </Badge>
                      </TableCell>
                      <TableCell>{schedule.last_generated_at ? new Date(schedule.last_generated_at).toLocaleDateString() : 'Never'}</TableCell>
                      <TableCell>{propertiesCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TooltipButton
                            tooltip="Edit schedule"
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </TooltipButton>
                          <TooltipButton
                            tooltip={schedule.is_active ? 'Pause schedule' : 'Resume schedule'}
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(schedule.id, schedule.is_active)}
                          >
                            {schedule.is_active ? 
                              <Pause className="h-4 w-4" /> : 
                              <Play className="h-4 w-4" />
                            }
                          </TooltipButton>
                          <TooltipButton
                            tooltip="Delete schedule"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </TooltipButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default AssessmentSchedules;