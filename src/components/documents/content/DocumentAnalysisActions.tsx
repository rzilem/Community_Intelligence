
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, AlertCircle, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SuggestedAction {
  type: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  context: string;
  automated: boolean;
}

interface DocumentAnalysisActionsProps {
  analysis: {
    suggestedActions: SuggestedAction[];
    importantDates?: Array<{ date: string; description: string }>;
    notificationTargets?: string[];
  };
  documentName: string;
}

const DocumentAnalysisActions: React.FC<DocumentAnalysisActionsProps> = ({
  analysis,
  documentName
}) => {
  const handleManualAction = async (action: SuggestedAction) => {
    try {
      switch (action.type) {
        case 'create_request':
          await supabase.from('homeowner_requests').insert({
            title: `Manual creation from document: ${documentName}`,
            description: action.description,
            type: 'general',
            priority: action.priority,
            status: 'open'
          });
          toast.success('Request created successfully');
          break;

        case 'send_message':
          await supabase.from('scheduled_messages').insert({
            association_id: analysis.associationId, // Add association_id
            subject: `Action Required: ${action.description}`,
            content: `Based on document analysis of ${documentName}: ${action.context}`,
            type: 'email',
            recipient_groups: analysis.notificationTargets || [],
            category: 'general',
            scheduled_date: new Date().toISOString() // Add scheduled_date
          });
          toast.success('Message scheduled successfully');
          break;

        case 'schedule_meeting':
          if (analysis.importantDates?.[0]?.date) {
            await supabase.from('calendar_events').insert({
              hoa_id: analysis.associationId, // Add hoa_id
              title: action.description,
              description: action.context,
              start_time: analysis.importantDates[0].date,
              end_time: new Date(new Date(analysis.importantDates[0].date).getTime() + 60 * 60 * 1000).toISOString(),
              event_type: 'meeting'
            });
            toast.success('Meeting scheduled successfully');
          }
          break;
      }
    } catch (error) {
      console.error('Error executing action:', error);
      toast.error('Failed to execute action');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create_request':
        return <AlertCircle className="h-4 w-4" />;
      case 'send_message':
        return <MessageSquare className="h-4 w-4" />;
      case 'schedule_meeting':
        return <Calendar className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!analysis.suggestedActions?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No actions suggested for this document.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Actions</CardTitle>
        <CardDescription>
          Actions identified from document analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis.suggestedActions.map((action, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {getActionIcon(action.type)}
                <h4 className="font-medium">{action.description}</h4>
                <Badge className={getPriorityColor(action.priority)}>
                  {action.priority}
                </Badge>
                {action.automated && (
                  <Badge variant="outline">Automated</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{action.context}</p>
            </div>
            {!action.automated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleManualAction(action)}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Execute
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DocumentAnalysisActions;
