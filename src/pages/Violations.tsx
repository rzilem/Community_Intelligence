import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Search, Calendar, MapPin, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Violations() {
  const { toast } = useToast();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    property_id: '',
    violation_type: 'landscaping',
    description: '',
    severity: 'minor',
    reported_date: new Date().toISOString().split('T')[0],
    cure_by_date: ''
  });

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setViolations([
        {
          id: '1',
          property: { unit_number: '101', street_address: '123 Main St' },
          violation_type: 'landscaping',
          description: 'Overgrown grass exceeding 6 inches in height',
          severity: 'minor',
          status: 'warning_sent',
          reported_date: '2025-09-15',
          cure_by_date: '2025-09-30'
        },
        {
          id: '2',
          property: { unit_number: '205', street_address: '205 Oak Ave' },
          violation_type: 'parking',
          description: 'Commercial vehicle parked in driveway overnight',
          severity: 'moderate',
          status: 'notice_sent',
          reported_date: '2025-09-18',
          cure_by_date: '2025-10-02'
        },
        {
          id: '3',
          property: { unit_number: '310', street_address: '310 Pine St' },
          violation_type: 'architectural',
          description: 'Unapproved shed installation in backyard',
          severity: 'major',
          status: 'escalated',
          reported_date: '2025-09-10',
          cure_by_date: '2025-09-25'
        }
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch violations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create violation logic here
      toast({ title: 'Success', description: 'Violation reported successfully' });
      setDialogOpen(false);
      resetForm();
      fetchViolations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to report violation',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      property_id: '',
      violation_type: 'landscaping',
      description: '',
      severity: 'minor',
      reported_date: new Date().toISOString().split('T')[0],
      cure_by_date: ''
    });
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      minor: { className: 'bg-yellow-100 text-yellow-800' },
      moderate: { className: 'bg-orange-100 text-orange-800' },
      major: { className: 'bg-red-100 text-red-800' }
    };
    
    const config = severityConfig[severity] || severityConfig.minor;
    return (
      <Badge className={config.className}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      reported: { className: 'bg-blue-100 text-blue-800' },
      warning_sent: { className: 'bg-yellow-100 text-yellow-800' },
      notice_sent: { className: 'bg-orange-100 text-orange-800' },
      escalated: { className: 'bg-red-100 text-red-800' },
      resolved: { className: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[status] || statusConfig.reported;
    return (
      <Badge className={config.className}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredViolations = violations.filter(violation =>
    violation.property.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    violation.violation_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    violation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const violationStats = {
    total: violations.length,
    open: violations.filter(v => v.status !== 'resolved').length,
    escalated: violations.filter(v => v.status === 'escalated').length
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          Violations
        </h1>
        <p className="text-muted-foreground">Track and manage HOA violations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{violationStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{violationStats.open}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{violationStats.escalated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search violations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Report Violation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report New Violation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="violation_type">Violation Type</Label>
                  <Select
                    value={formData.violation_type}
                    onValueChange={(value) => setFormData({...formData, violation_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landscaping">Landscaping</SelectItem>
                      <SelectItem value="parking">Parking</SelectItem>
                      <SelectItem value="architectural">Architectural</SelectItem>
                      <SelectItem value="noise">Noise</SelectItem>
                      <SelectItem value="pets">Pets</SelectItem>
                      <SelectItem value="trash">Trash/Sanitation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData({...formData, severity: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the violation in detail..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reported_date">Reported Date</Label>
                  <Input
                    id="reported_date"
                    type="date"
                    value={formData.reported_date}
                    onChange={(e) => setFormData({...formData, reported_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cure_by_date">Cure By Date</Label>
                  <Input
                    id="cure_by_date"
                    type="date"
                    value={formData.cure_by_date}
                    onChange={(e) => setFormData({...formData, cure_by_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Report Violation</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Violations Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading violations...</div>
          ) : filteredViolations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'No violations found matching your search' : 'No violations reported yet.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Cure By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViolations.map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell className="font-medium">
                      {violation.property.unit_number} - {violation.property.street_address}
                    </TableCell>
                    <TableCell className="capitalize">{violation.violation_type}</TableCell>
                    <TableCell className="max-w-xs truncate">{violation.description}</TableCell>
                    <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                    <TableCell>{getStatusBadge(violation.status)}</TableCell>
                    <TableCell>{violation.reported_date}</TableCell>
                    <TableCell>{violation.cure_by_date}</TableCell>
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