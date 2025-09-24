import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus, Search, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Assessments() {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    property_id: '',
    assessment_type: 'regular',
    description: '',
    amount: '',
    due_date: '',
    payment_status: 'pending'
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setAssessments([
        {
          id: '1',
          property: { unit_number: '101', street_address: '123 Main St' },
          assessment_type: 'regular',
          description: 'October 2025 HOA Dues',
          amount: 250.00,
          due_date: '2025-10-01',
          payment_status: 'paid',
          paid_date: '2025-09-25'
        },
        {
          id: '2',
          property: { unit_number: '102', street_address: '125 Main St' },
          assessment_type: 'regular',
          description: 'October 2025 HOA Dues',
          amount: 250.00,
          due_date: '2025-10-01',
          payment_status: 'pending'
        },
        {
          id: '3',
          property: { unit_number: '103', street_address: '127 Main St' },
          assessment_type: 'special',
          description: 'Roof Repair Assessment',
          amount: 500.00,
          due_date: '2025-09-20',
          payment_status: 'overdue'
        }
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch assessments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create assessment logic here
      toast({ title: 'Success', description: 'Assessment created successfully' });
      setDialogOpen(false);
      resetForm();
      fetchAssessments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create assessment',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      property_id: '',
      assessment_type: 'regular',
      description: '',
      amount: '',
      due_date: '',
      payment_status: 'pending'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { variant: 'default', className: 'bg-green-100 text-green-800' },
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      overdue: { variant: 'destructive', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredAssessments = assessments.filter(assessment =>
    assessment.property.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOverdue = assessments
    .filter(a => a.payment_status === 'overdue')
    .reduce((sum, a) => sum + a.amount, 0);

  const totalPending = assessments
    .filter(a => a.payment_status === 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardList className="h-8 w-8" />
          Assessments
        </h1>
        <p className="text-muted-foreground">Manage HOA assessments and track payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assessment_type">Assessment Type</Label>
                  <Select
                    value={formData.assessment_type}
                    onValueChange={(value) => setFormData({...formData, assessment_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular Assessment</SelectItem>
                      <SelectItem value="special">Special Assessment</SelectItem>
                      <SelectItem value="late_fee">Late Fee</SelectItem>
                      <SelectItem value="fine">Fine</SelectItem>
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
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g., October 2025 HOA Dues"
                  required
                />
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Assessment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading assessments...</div>
          ) : filteredAssessments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'No assessments found matching your search' : 'No assessments found. Create your first assessment to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">
                      {assessment.property.unit_number} - {assessment.property.street_address}
                    </TableCell>
                    <TableCell className="capitalize">{assessment.assessment_type.replace('_', ' ')}</TableCell>
                    <TableCell>{assessment.description}</TableCell>
                    <TableCell className="font-medium">${assessment.amount.toFixed(2)}</TableCell>
                    <TableCell>{assessment.due_date}</TableCell>
                    <TableCell>{getStatusBadge(assessment.payment_status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}