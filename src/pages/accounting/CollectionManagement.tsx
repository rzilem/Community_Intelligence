import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Clock, AlertTriangle, DollarSign, FileText, Phone, Mail, User } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { CollectionService } from '@/services/accounting/collection-service';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type CollectionCase = Database['public']['Tables']['collection_cases']['Row'];
type CollectionAction = Database['public']['Tables']['collection_actions']['Row'];

const CollectionManagement = () => {
  const [selectedAssociation, setSelectedAssociation] = useState<string>('');
  const [cases, setCases] = useState<CollectionCase[]>([]);
  const [actions, setActions] = useState<CollectionAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const { toast } = useToast();

  const [newCase, setNewCase] = useState({
    property_id: '',
    total_amount_owed: '',
    priority_level: 'medium',
    notes: ''
  });

  const [newAction, setNewAction] = useState({
    action_type: '',
    description: '',
    amount: '',
    outcome: 'pending'
  });

  useEffect(() => {
    if (selectedAssociation) {
      loadCollectionData();
    }
  }, [selectedAssociation]);

  const loadCollectionData = async () => {
    if (!selectedAssociation) return;
    
    setLoading(true);
    try {
      const [caseData, actionData] = await Promise.all([
        CollectionService.getCollectionCases(selectedAssociation),
        CollectionService.getCollectionActions(selectedAssociation)
      ]);
      setCases(caseData);
      setActions(actionData);
    } catch (error) {
      console.error('Error loading collection data:', error);
      toast({
        title: "Error",
        description: "Failed to load collection data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async () => {
    if (!selectedAssociation || !newCase.property_id || !newCase.total_amount_owed) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const caseData = await CollectionService.createCollectionCase({
        association_id: selectedAssociation,
        property_id: newCase.property_id,
        total_amount_owed: parseFloat(newCase.total_amount_owed),
        
        notes: newCase.notes
      });

      setCases(prev => [caseData, ...prev]);
      setIsCreateCaseOpen(false);
      setNewCase({ property_id: '', total_amount_owed: '', priority_level: 'medium', notes: '' });
      
      toast({
        title: "Success",
        description: "Collection case created successfully"
      });
    } catch (error) {
      console.error('Error creating collection case:', error);
      toast({
        title: "Error",
        description: "Failed to create collection case",
        variant: "destructive"
      });
    }
  };

  const handleAddAction = async () => {
    if (!selectedCase || !newAction.action_type || !newAction.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const action = await CollectionService.addCollectionAction({
        case_id: selectedCase,
        action_type: newAction.action_type,
        description: newAction.description,
        amount: newAction.amount ? parseFloat(newAction.amount) : undefined,
        outcome: newAction.outcome
      });

      setActions(prev => [action, ...prev]);
      setIsAddActionOpen(false);
      setNewAction({ action_type: '', description: '', amount: '', outcome: 'pending' });
      
      toast({
        title: "Success",
        description: "Collection action added successfully"
      });
    } catch (error) {
      console.error('Error adding collection action:', error);
      toast({
        title: "Error",
        description: "Failed to add collection action",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCaseStatus = async (caseId: string, status: string) => {
    try {
      await CollectionService.updateCaseStatus(caseId, status);
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, case_status: status } : c));
      toast({
        title: "Success",
        description: "Case status updated successfully"
      });
    } catch (error) {
      console.error('Error updating case status:', error);
      toast({
        title: "Error",
        description: "Failed to update case status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, icon: Clock },
      pending: { variant: 'secondary' as const, icon: Clock },
      resolved: { variant: 'default' as const, icon: Clock },
      closed: { variant: 'outline' as const, icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'outline' as const, icon: Clock },
      medium: { variant: 'secondary' as const, icon: Clock },
      high: { variant: 'destructive' as const, icon: AlertTriangle },
      urgent: { variant: 'destructive' as const, icon: AlertTriangle }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getActionIcon = (actionType: string) => {
    const iconMap = {
      notice: FileText,
      phone_call: Phone,
      email: Mail,
      letter: FileText,
      payment: DollarSign,
      meeting: User
    };
    return iconMap[actionType as keyof typeof iconMap] || FileText;
  };

  return (
    <PageTemplate
      title="Collection Management"
      description="Manage collection cases, track actions, and automate collection workflows"
      icon={<AlertTriangle className="h-8 w-8" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <AssociationSelector
            onAssociationChange={setSelectedAssociation}
            label="Select Association"
          />

          <div className="flex gap-2">
            <Dialog open={isCreateCaseOpen} onOpenChange={setIsCreateCaseOpen}>
              <DialogTrigger asChild>
                <Button disabled={!selectedAssociation}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Collection Case</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="property_id">Property</Label>
                    <Input
                      id="property_id"
                      placeholder="Enter property ID or search..."
                      value={newCase.property_id}
                      onChange={(e) => setNewCase(prev => ({ ...prev, property_id: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="total_amount_owed">Amount Owed</Label>
                    <Input
                      id="total_amount_owed"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newCase.total_amount_owed}
                      onChange={(e) => setNewCase(prev => ({ ...prev, total_amount_owed: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority_level">Priority Level</Label>
                    <Select value={newCase.priority_level} onValueChange={(value) => 
                      setNewCase(prev => ({ ...prev, priority_level: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Enter case notes..."
                      value={newCase.notes}
                      onChange={(e) => setNewCase(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <Button onClick={handleCreateCase} className="w-full">
                    Create Case
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddActionOpen} onOpenChange={setIsAddActionOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!selectedCase}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Collection Action</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="action_type">Action Type</Label>
                    <Select value={newAction.action_type} onValueChange={(value) => 
                      setNewAction(prev => ({ ...prev, action_type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notice">Notice Sent</SelectItem>
                        <SelectItem value="phone_call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                        <SelectItem value="payment">Payment Received</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter action description..."
                      value={newAction.description}
                      onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  {newAction.action_type === 'payment' && (
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newAction.amount}
                        onChange={(e) => setNewAction(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="outcome">Outcome</Label>
                    <Select value={newAction.outcome} onValueChange={(value) => 
                      setNewAction(prev => ({ ...prev, outcome: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="successful">Successful</SelectItem>
                        <SelectItem value="no_response">No Response</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddAction} className="w-full">
                    Add Action
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {selectedAssociation && (
          <Tabs defaultValue="cases" className="space-y-4">
            <TabsList>
              <TabsTrigger value="cases">Collection Cases</TabsTrigger>
              <TabsTrigger value="actions">Recent Actions</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Collection Cases</CardTitle>
                  <CardDescription>
                    Active and pending collection cases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Case Number</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Resident</TableHead>
                          <TableHead>Amount Owed</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Action</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cases.map((collectionCase) => (
                          <TableRow 
                            key={collectionCase.id}
                            className={selectedCase === collectionCase.id ? "bg-muted" : ""}
                            onClick={() => setSelectedCase(collectionCase.id)}
                          >
                             <TableCell className="font-medium">{collectionCase.case_number}</TableCell>
                             <TableCell>{collectionCase.property_id}</TableCell>
                             <TableCell>N/A</TableCell>
                             <TableCell>${collectionCase.total_amount_owed.toLocaleString()}</TableCell>
                             <TableCell>{getPriorityBadge(collectionCase.collection_stage || 'medium')}</TableCell>
                             <TableCell>{getStatusBadge(collectionCase.case_status)}</TableCell>
                             <TableCell>
                               {collectionCase.next_action_date 
                                 ? new Date(collectionCase.next_action_date).toLocaleDateString()
                                 : '-'
                               }
                             </TableCell>
                             <TableCell>
                               <div className="flex gap-2">
                                 {collectionCase.case_status === 'open' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateCaseStatus(collectionCase.id, 'resolved');
                                    }}
                                  >
                                    Mark Resolved
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Collection Actions</CardTitle>
                  <CardDescription>
                    Timeline of collection activities and communications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {actions.map((action) => {
                      const ActionIcon = getActionIcon(action.action_type);
                      return (
                        <div key={action.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="p-2 bg-muted rounded-lg">
                            <ActionIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium capitalize">
                                {action.action_type.replace('_', ' ')}
                              </h4>
                              <Badge variant="outline">
                                {action.outcome.charAt(0).toUpperCase() + action.outcome.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {action.description}
                            </p>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>
                                {new Date(action.action_date).toLocaleDateString()} - {action.performed_by}
                              </span>
                              {action.amount && (
                                <span className="font-medium">
                                  ${action.amount.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {cases.filter(c => c.case_status === 'open').length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cases currently in collection
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Total Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${cases.reduce((sum, c) => sum + c.total_amount_owed, 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Outstanding collection amount
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>High Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {cases.filter(c => ['urgent', 'high'].includes(c.collection_stage || '')).length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cases requiring immediate attention
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageTemplate>
  );
};

export default CollectionManagement;