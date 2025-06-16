
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorWorkflowService } from "@/services/vendor-workflow-service";
import { useAuth } from "@/contexts/auth";
import { Plus, X, Settings } from "lucide-react";

interface WorkflowAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkflowAutomationDialog: React.FC<WorkflowAutomationDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentAssociation } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'contract_expiry' as const,
    trigger_conditions: {} as Record<string, any>,
    actions: [] as Array<{ type: string; config: Record<string, any> }>,
    is_active: true
  });

  const [newAction, setNewAction] = useState({
    type: 'send_notification',
    config: {}
  });

  const createMutation = useMutation({
    mutationFn: vendorWorkflowService.createWorkflowAutomation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automations'] });
      onOpenChange(false);
      toast({ title: "Workflow automation created successfully" });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Error creating workflow", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: 'contract_expiry',
      trigger_conditions: {},
      actions: [],
      is_active: true
    });
    setNewAction({ type: 'send_notification', config: {} });
  };

  const handleAddAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { ...newAction }]
    }));
    setNewAction({ type: 'send_notification', config: {} });
  };

  const handleRemoveAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAssociation?.id) {
      toast({ 
        title: "Error", 
        description: "No association selected",
        variant: "destructive" 
      });
      return;
    }

    createMutation.mutate({
      ...formData,
      association_id: currentAssociation.id
    });
  };

  const getTriggerConditionFields = () => {
    switch (formData.trigger_type) {
      case 'contract_expiry':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="days_before_expiry">Days Before Expiry</Label>
              <Input
                id="days_before_expiry"
                type="number"
                value={formData.trigger_conditions.days_before_expiry || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  trigger_conditions: {
                    ...prev.trigger_conditions,
                    days_before_expiry: parseInt(e.target.value) || 0
                  }
                }))}
                placeholder="30"
              />
            </div>
          </div>
        );
      case 'performance_threshold':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="min_rating">Minimum Rating</Label>
              <Input
                id="min_rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.trigger_conditions.min_rating || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  trigger_conditions: {
                    ...prev.trigger_conditions,
                    min_rating: parseFloat(e.target.value) || 0
                  }
                }))}
                placeholder="3.0"
              />
            </div>
          </div>
        );
      case 'compliance_due':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="days_before_due">Days Before Due</Label>
              <Input
                id="days_before_due"
                type="number"
                value={formData.trigger_conditions.days_before_due || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  trigger_conditions: {
                    ...prev.trigger_conditions,
                    days_before_due: parseInt(e.target.value) || 0
                  }
                }))}
                placeholder="7"
              />
            </div>
          </div>
        );
      case 'payment_overdue':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="overdue_days">Days Overdue</Label>
              <Input
                id="overdue_days"
                type="number"
                value={formData.trigger_conditions.overdue_days || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  trigger_conditions: {
                    ...prev.trigger_conditions,
                    overdue_days: parseInt(e.target.value) || 0
                  }
                }))}
                placeholder="30"
              />
            </div>
          </div>
        );
      case 'custom':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom_condition">Custom Condition (JSON)</Label>
              <Textarea
                id="custom_condition"
                value={JSON.stringify(formData.trigger_conditions, null, 2)}
                onChange={(e) => {
                  try {
                    const conditions = JSON.parse(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      trigger_conditions: conditions
                    }));
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{"key": "value"}'
                rows={4}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workflow Automation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contract Expiry Reminder"
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Automatically notify when vendor contracts are about to expire"
                rows={3}
              />
            </div>
          </div>

          {/* Trigger Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Trigger Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trigger_type">Trigger Type</Label>
                <Select 
                  value={formData.trigger_type} 
                  onValueChange={(value: any) => setFormData(prev => ({ 
                    ...prev, 
                    trigger_type: value,
                    trigger_conditions: {}
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract_expiry">Contract Expiry</SelectItem>
                    <SelectItem value="performance_threshold">Performance Threshold</SelectItem>
                    <SelectItem value="compliance_due">Compliance Due</SelectItem>
                    <SelectItem value="payment_overdue">Payment Overdue</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {getTriggerConditionFields()}
            </CardContent>
          </Card>

          {/* Actions Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Actions */}
              {formData.actions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Badge variant="outline">{action.type.replace('_', ' ')}</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveAction(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Add New Action */}
              <div className="border-2 border-dashed rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    value={newAction.type} 
                    onValueChange={(value) => setNewAction(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_notification">Send Notification</SelectItem>
                      <SelectItem value="create_maintenance_request">Create Maintenance Request</SelectItem>
                      <SelectItem value="update_vendor_status">Update Vendor Status</SelectItem>
                      <SelectItem value="send_email">Send Email</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button type="button" onClick={handleAddAction} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Settings */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Activate workflow immediately</Label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Workflow'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowAutomationDialog;
