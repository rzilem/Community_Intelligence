
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Workflow, 
  Plus, 
  Save, 
  Play, 
  Settings,
  TrendingUp,
  Lightbulb,
  Zap
} from 'lucide-react';
import { WorkflowTemplate } from '@/types/ai-workflow-types';
import { intelligentWorkflowEngine } from '@/services/ai-workflow/intelligent-workflow-engine';
import { toast } from 'sonner';

interface IntelligentWorkflowDesignerProps {
  associationId: string;
  onWorkflowCreated?: (workflow: WorkflowTemplate) => void;
}

const IntelligentWorkflowDesigner: React.FC<IntelligentWorkflowDesignerProps> = ({
  associationId,
  onWorkflowCreated
}) => {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowCategory, setWorkflowCategory] = useState('');
  const [workflowType, setWorkflowType] = useState('');
  const [steps, setSteps] = useState<any[]>([]);
  const [recommendedTemplates, setRecommendedTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecommendedTemplates();
  }, [associationId]);

  const loadRecommendedTemplates = async () => {
    try {
      const templates = await intelligentWorkflowEngine.getAIRecommendedTemplates(associationId);
      setRecommendedTemplates(templates);
    } catch (error) {
      console.error('Failed to load recommended templates:', error);
    }
  };

  const addStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      name: `Step ${steps.length + 1}`,
      type: 'notification',
      config: {}
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId: string, updates: any) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    setSaving(true);
    try {
      const workflowTemplate: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'> = {
        name: workflowName,
        description: workflowDescription,
        category: workflowCategory,
        workflow_type: workflowType,
        template_data: {
          steps,
          version: '1.0',
          created_with: 'intelligent_designer'
        },
        ai_optimization_score: 0,
        usage_count: 0,
        is_ai_recommended: false,
        association_id: associationId
      };

      const created = await intelligentWorkflowEngine.createWorkflowTemplate(workflowTemplate);
      
      toast.success('Workflow created successfully');
      onWorkflowCreated?.(created);
      
      // Reset form
      setWorkflowName('');
      setWorkflowDescription('');
      setWorkflowCategory('');
      setWorkflowType('');
      setSteps([]);
      
    } catch (error: any) {
      toast.error(`Failed to create workflow: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const testWorkflow = async () => {
    if (steps.length === 0) {
      toast.error('Please add at least one step to test the workflow');
      return;
    }

    setLoading(true);
    try {
      // Create a temporary workflow for testing
      const testTemplate: Omit<WorkflowTemplate, 'id'> = {
        name: `Test: ${workflowName || 'Untitled'}`,
        description: 'Test execution',
        category: workflowCategory || 'test',
        workflow_type: workflowType || 'test',
        template_data: { steps },
        ai_optimization_score: 0,
        usage_count: 0,
        is_ai_recommended: false,
        association_id: associationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const created = await intelligentWorkflowEngine.createWorkflowTemplate(testTemplate);
      const execution = await intelligentWorkflowEngine.executeWorkflow(
        created.id,
        associationId,
        { test_mode: true }
      );
      
      toast.success('Workflow test started successfully');
    } catch (error: any) {
      toast.error(`Failed to test workflow: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const useRecommendedTemplate = (template: WorkflowTemplate) => {
    setWorkflowName(`${template.name} (Copy)`);
    setWorkflowDescription(template.description || '');
    setWorkflowCategory(template.category);
    setWorkflowType(template.workflow_type);
    setSteps(template.template_data.steps || []);
    toast.info('Template loaded successfully');
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-500" />
          Intelligent Workflow Designer
        </CardTitle>
        <CardDescription>
          Create and optimize workflows with AI-powered recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="designer" className="space-y-4">
          <TabsList>
            <TabsTrigger value="designer">
              <Workflow className="h-4 w-4 mr-2" />
              Designer
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Lightbulb className="h-4 w-4 mr-2" />
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger value="insights">
              <TrendingUp className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="designer" className="space-y-6">
            {/* Workflow Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflow-category">Category</Label>
                <Select value={workflowCategory} onValueChange={setWorkflowCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-type">Workflow Type</Label>
                <Select value={workflowType} onValueChange={setWorkflowType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automated">Automated</SelectItem>
                    <SelectItem value="semi_automated">Semi-Automated</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="event_driven">Event-Driven</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe what this workflow does"
                  rows={3}
                />
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Workflow Steps</h3>
                <Button onClick={addStep} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <Card key={step.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">Step {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(step.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Step Name</Label>
                          <Input
                            value={step.name}
                            onChange={(e) => updateStep(step.id, { name: e.target.value })}
                            placeholder="Enter step name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Step Type</Label>
                          <Select 
                            value={step.type} 
                            onValueChange={(value) => updateStep(step.id, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="notification">Send Notification</SelectItem>
                              <SelectItem value="api_call">API Call</SelectItem>
                              <SelectItem value="data_transformation">Data Transformation</SelectItem>
                              <SelectItem value="conditional">Conditional Logic</SelectItem>
                              <SelectItem value="delay">Delay/Wait</SelectItem>
                              <SelectItem value="email">Send Email</SelectItem>
                              <SelectItem value="database">Database Operation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Step Configuration */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <Label className="text-sm font-medium">Configuration</Label>
                        <Textarea
                          value={JSON.stringify(step.config, null, 2)}
                          onChange={(e) => {
                            try {
                              const config = JSON.parse(e.target.value);
                              updateStep(step.id, { config });
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="Enter step configuration (JSON format)"
                          rows={3}
                          className="mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {steps.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No steps added yet. Click "Add Step" to get started.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={saveWorkflow} 
                disabled={saving || !workflowName.trim()}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Workflow'}
              </Button>
              <Button 
                variant="outline" 
                onClick={testWorkflow}
                disabled={loading || steps.length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Testing...' : 'Test Workflow'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">AI-Recommended Templates</h3>
            </div>

            {recommendedTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No AI recommendations available yet.</p>
                <p className="text-sm">Create more workflows to get personalized recommendations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedTemplates.map((template) => (
                  <Card key={template.id} className="border border-yellow-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Zap className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Optimization Score:</span>{' '}
                          {template.ai_optimization_score}%
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => useRecommendedTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Workflow Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">87%</div>
                    <p className="text-sm text-gray-600">Average Success Rate</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">4.2s</div>
                    <p className="text-sm text-gray-600">Avg Processing Time</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">23</div>
                    <p className="text-sm text-gray-600">Active Workflows</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Optimization Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Parallelize Independent Steps</p>
                      <p className="text-sm text-gray-600">
                        Steps that don't depend on each other can run simultaneously to reduce processing time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Add Error Handling</p>
                      <p className="text-sm text-gray-600">
                        Include conditional steps to handle failures and retry logic for critical operations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Cache Frequently Used Data</p>
                      <p className="text-sm text-gray-600">
                        Store commonly accessed information to improve workflow performance.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default IntelligentWorkflowDesigner;
