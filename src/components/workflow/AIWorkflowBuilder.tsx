
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Save, Eye } from 'lucide-react';
import { WorkflowType, WorkflowStep } from '@/types/workflow-types';
import { workflowService } from '@/services/workflow-service';
import { toast } from 'sonner';

interface AIWorkflowBuilderProps {
  onWorkflowCreated?: (workflowId: string) => void;
}

const WORKFLOW_TYPES: WorkflowType[] = [
  'Financial',
  'Maintenance', 
  'Compliance',
  'Resident Management',
  'Communication',
  'Governance'
];

const AIWorkflowBuilder: React.FC<AIWorkflowBuilderProps> = ({ onWorkflowCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<WorkflowType>('Financial');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateSteps = async () => {
    if (!name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    try {
      setIsGenerating(true);
      const result = await workflowService.generateWorkflowSteps(name, type, description);
      setSteps(result.steps || []);
      toast.success('AI generated workflow steps successfully!');
    } catch (error) {
      console.error('Error generating steps:', error);
      toast.error('Failed to generate workflow steps');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeSteps = async () => {
    if (steps.length === 0) {
      toast.error('No steps to optimize');
      return;
    }

    try {
      setIsOptimizing(true);
      const result = await workflowService.optimizeWorkflowSteps(steps);
      setSteps(result.steps || []);
      
      if (result.improvements?.length > 0) {
        toast.success(`Optimized workflow with ${result.improvements.length} improvements`);
      } else {
        toast.success('Workflow steps optimized successfully!');
      }
    } catch (error) {
      console.error('Error optimizing steps:', error);
      toast.error('Failed to optimize workflow steps');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    if (steps.length === 0) {
      toast.error('Please generate workflow steps first');
      return;
    }

    try {
      setIsSaving(true);
      const workflow = await workflowService.createWorkflow({
        name: name.trim(),
        description: description.trim(),
        type,
        steps,
        status: 'active',
        isTemplate: false
      });

      toast.success('Workflow created successfully!');
      
      // Reset form
      setName('');
      setDescription('');
      setSteps([]);
      
      if (onWorkflowCreated) {
        onWorkflowCreated(workflow.id);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeColor = (type: WorkflowType) => {
    const colors = {
      'Financial': 'bg-emerald-100 text-emerald-800',
      'Maintenance': 'bg-orange-100 text-orange-800',
      'Compliance': 'bg-red-100 text-red-800',
      'Resident Management': 'bg-blue-100 text-blue-800',
      'Communication': 'bg-purple-100 text-purple-800',
      'Governance': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Workflow Builder
          </CardTitle>
          <CardDescription>
            Create custom workflows with AI-powered step generation and optimization
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow Name</label>
              <Input
                placeholder="e.g., Monthly Maintenance Review"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow Type</label>
              <Select value={type} onValueChange={(v) => setType(v as WorkflowType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKFLOW_TYPES.map(workflowType => (
                    <SelectItem key={workflowType} value={workflowType}>
                      {workflowType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Textarea
              placeholder="Provide additional context to help AI generate better steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateSteps}
              disabled={isGenerating || !name.trim()}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Steps'}
            </Button>
            
            {steps.length > 0 && (
              <Button
                variant="outline"
                onClick={handleOptimizeSteps}
                disabled={isOptimizing}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {isOptimizing ? 'Optimizing...' : 'Optimize'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Workflow Steps</span>
              <Badge className={getTypeColor(type)} variant="secondary">
                {type}
              </Badge>
            </CardTitle>
            <CardDescription>
              {steps.length} steps generated for "{name}"
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <Card key={step.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {step.order}</Badge>
                          <h4 className="font-medium">{step.name}</h4>
                          {step.autoExecute && (
                            <Badge className="bg-green-100 text-green-800">Auto</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        {step.notifyRoles && step.notifyRoles.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-2">
                            <span className="text-xs text-muted-foreground">Notify:</span>
                            {step.notifyRoles.map(role => (
                              <Badge key={role} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button
                onClick={handleSaveWorkflow}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Workflow'}
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIWorkflowBuilder;
