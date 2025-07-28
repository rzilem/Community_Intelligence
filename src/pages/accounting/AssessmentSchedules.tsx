import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Calendar, Plus, Edit, Trash2, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TooltipButton from '@/components/ui/tooltip-button';

// Mock data for assessment schedules
const mockSchedules = [
  {
    id: '1',
    name: 'Monthly HOA Fees',
    type: 'Monthly',
    amount: 350,
    nextDue: '2025-02-01',
    status: 'active',
    lastGenerated: '2025-01-01',
    properties: 120
  },
  {
    id: '2',
    name: 'Quarterly Pool Maintenance',
    type: 'Quarterly',
    amount: 75,
    nextDue: '2025-04-01',
    status: 'active',
    lastGenerated: '2025-01-01',
    properties: 120
  },
  {
    id: '3',
    name: 'Annual Reserve Fund',
    type: 'Annual',
    amount: 500,
    nextDue: '2025-12-01',
    status: 'active',
    lastGenerated: '2024-12-01',
    properties: 120
  },
  {
    id: '4',
    name: 'Special Roof Repair',
    type: 'One-time',
    amount: 1200,
    nextDue: '2025-03-15',
    status: 'pending',
    lastGenerated: null,
    properties: 120
  }
];

const AssessmentSchedules = () => {
  const [schedules] = useState(mockSchedules);

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
          <TooltipButton
            tooltip="Create a new assessment schedule"
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Schedule
          </TooltipButton>
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
                <div className="text-2xl font-bold">3</div>
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
                <div className="text-2xl font-bold">Feb 1</div>
                <p className="text-xs text-muted-foreground">Monthly assessments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">120</div>
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
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>{schedule.type}</TableCell>
                      <TableCell>{formatCurrency(schedule.amount)}</TableCell>
                      <TableCell>{schedule.nextDue}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(schedule.status)}>
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{schedule.lastGenerated || 'Never'}</TableCell>
                      <TableCell>{schedule.properties}</TableCell>
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
                            tooltip={schedule.status === 'active' ? 'Pause schedule' : 'Resume schedule'}
                            variant="ghost"
                            size="sm"
                          >
                            {schedule.status === 'active' ? 
                              <Pause className="h-4 w-4" /> : 
                              <Play className="h-4 w-4" />
                            }
                          </TooltipButton>
                          <TooltipButton
                            tooltip="Delete schedule"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
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