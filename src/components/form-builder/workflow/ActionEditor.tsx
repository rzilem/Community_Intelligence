
import React from 'react';
import { FormWorkflowAction } from '@/types/form-workflow-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  Bell,
  ClipboardList,
  Home,
  User,
  CheckCircle,
  Globe
} from 'lucide-react';

interface ActionEditorProps {
  action: FormWorkflowAction;
  onChange: (action: FormWorkflowAction) => void;
  onDelete: () => void;
}

const ActionEditor: React.FC<ActionEditorProps> = ({ action, onChange, onDelete }) => {
  const updateAction = (updates: Partial<FormWorkflowAction>) => {
    onChange({
      ...action,
      ...updates
    });
  };

  const updateConfig = (key: string, value: any) => {
    onChange({
      ...action,
      config: {
        ...action.config,
        [key]: value
      }
    });
  };

  // Render appropriate config fields based on action type
  const renderConfigFields = () => {
    switch (action.type) {
      case 'send_email':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="email-to">Recipient</Label>
              <Input
                id="email-to"
                placeholder="Enter recipient email"
                value={action.config.to || ''}
                onChange={(e) => updateConfig('to', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use <code>{`{{user.email}}`}</code> for the form submitter's email
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                placeholder="Email subject"
                value={action.config.subject || ''}
                onChange={(e) => updateConfig('subject', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Email Body</Label>
              <Textarea
                id="email-body"
                placeholder="Email content"
                className="min-h-[120px]"
                value={action.config.body || ''}
                onChange={(e) => updateConfig('body', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use form field values with <code>{`{{field.name}}`}</code>
              </p>
            </div>
          </>
        );

      case 'send_notification':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="notification-role">Recipient Role</Label>
              <Select
                value={action.config.role || ''}
                onValueChange={(value) => updateConfig('role', value)}
              >
                <SelectTrigger id="notification-role">
                  <SelectValue placeholder="Select recipient role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="manager">Managers</SelectItem>
                  <SelectItem value="board">Board Members</SelectItem>
                  <SelectItem value="submitter">Form Submitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-message">Notification Message</Label>
              <Textarea
                id="notification-message"
                placeholder="Enter notification message"
                value={action.config.message || ''}
                onChange={(e) => updateConfig('message', e.target.value)}
              />
            </div>
          </>
        );

      case 'create_request':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="request-type">Request Type</Label>
              <Select
                value={action.config.requestType || ''}
                onValueChange={(value) => updateConfig('requestType', value)}
              >
                <SelectTrigger id="request-type">
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="homeowner">Homeowner Request</SelectItem>
                  <SelectItem value="architectural">Architectural</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-title">Request Title</Label>
              <Input
                id="request-title"
                placeholder="Enter request title"
                value={action.config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use <code>{`{{form.title}}`}</code> to use the form submission title
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-description">Description</Label>
              <Textarea
                id="request-description"
                placeholder="Enter request description"
                value={action.config.description || ''}
                onChange={(e) => updateConfig('description', e.target.value)}
              />
            </div>
          </>
        );

      case 'assign_task':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="assign-role">Assignee Role</Label>
              <Select
                value={action.config.assigneeRole || ''}
                onValueChange={(value) => updateConfig('assigneeRole', value)}
              >
                <SelectTrigger id="assign-role">
                  <SelectValue placeholder="Select assignee role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="maintenance">Maintenance Staff</SelectItem>
                  <SelectItem value="board_member">Board Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'update_status':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="status-value">New Status</Label>
              <Select
                value={action.config.status || ''}
                onValueChange={(value) => updateConfig('status', value)}
              >
                <SelectTrigger id="status-value">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'webhook':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://example.com/webhook"
                value={action.config.url || ''}
                onChange={(e) => updateConfig('url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-method">Request Method</Label>
              <Select
                value={action.config.method || 'POST'}
                onValueChange={(value) => updateConfig('method', value)}
              >
                <SelectTrigger id="webhook-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      default:
        return (
          <div className="text-center py-6 text-muted-foreground">
            Select an action type to configure
          </div>
        );
    }
  };

  // Icons for action types
  const getActionIcon = () => {
    switch (action.type) {
      case 'send_email': return <Mail className="h-5 w-5" />;
      case 'send_notification': return <Bell className="h-5 w-5" />;
      case 'create_request': return <ClipboardList className="h-5 w-5" />;
      case 'update_property': return <Home className="h-5 w-5" />;
      case 'assign_task': return <User className="h-5 w-5" />;
      case 'update_status': return <CheckCircle className="h-5 w-5" />;
      case 'webhook': return <Globe className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getActionIcon()}
            <CardTitle className="text-lg">Action Configuration</CardTitle>
          </div>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Remove Action
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="action-name">Action Name</Label>
          <Input
            id="action-name"
            value={action.name}
            onChange={(e) => updateAction({ name: e.target.value })}
            placeholder="Enter action name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="action-type">Action Type</Label>
          <Select
            value={action.type}
            onValueChange={(value) => updateAction({ 
              type: value as any, 
              // Clear config when changing type to avoid stale values
              config: {} 
            })}
          >
            <SelectTrigger id="action-type">
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="send_email">Send Email</SelectItem>
              <SelectItem value="send_notification">Send Notification</SelectItem>
              <SelectItem value="create_request">Create Request</SelectItem>
              <SelectItem value="update_property">Update Property</SelectItem>
              <SelectItem value="assign_task">Assign Task</SelectItem>
              <SelectItem value="update_status">Update Status</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action-specific configuration fields */}
        <div className="mt-6 space-y-4">
          {renderConfigFields()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionEditor;
