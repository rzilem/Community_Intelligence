
import React, { useState } from 'react';
import { FormWorkflow } from '@/types/form-workflow-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  PlayCircle, 
  X, 
  Check, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface WorkflowTestPanelProps {
  workflow: FormWorkflow;
  formId: string;
}

type TestResult = {
  stepId: string;
  actionId: string;
  success: boolean;
  message: string;
  details?: any;
};

const WorkflowTestPanel: React.FC<WorkflowTestPanelProps> = ({
  workflow,
  formId
}) => {
  const [testFormData, setTestFormData] = useState('{\n  "title": "Test Request",\n  "description": "This is a test submission",\n  "type": "general",\n  "priority": "medium"\n}');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const handleTest = async () => {
    if (!workflow.steps.length) {
      setError('This workflow has no steps to test.');
      return;
    }
    
    setIsTesting(true);
    setError(null);
    setTestResults([]);
    
    try {
      // Parse the form data
      const formData = JSON.parse(testFormData);
      
      // Simulating workflow execution with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate results for each step and action
      const simulatedResults: TestResult[] = [];
      
      for (const step of workflow.steps) {
        // Skip disabled steps
        if (!step.isEnabled) continue;
        
        // Check conditions
        let conditionsMet = true;
        if (step.conditions.length > 0) {
          // Simulate condition checking
          conditionsMet = step.conditions.every(condition => {
            // Simple condition check simulation
            const fieldValue = formData[condition.field] || '';
            if (condition.operator === 'equals') {
              return String(fieldValue) === String(condition.value);
            }
            return true; // Default to true for simulation
          });
        }
        
        if (!conditionsMet) {
          simulatedResults.push({
            stepId: step.id,
            actionId: 'conditions',
            success: false,
            message: 'Conditions not met, step skipped'
          });
          continue;
        }
        
        // Process actions
        for (const action of step.actions) {
          // Simulate success/failure (80% success rate)
          const success = Math.random() > 0.2;
          
          simulatedResults.push({
            stepId: step.id,
            actionId: action.id,
            success,
            message: success 
              ? `Successfully executed ${action.name}` 
              : `Failed to execute ${action.name}`,
            details: {
              actionType: action.type,
              config: action.config
            }
          });
          
          // Add small delay between results
          await new Promise(resolve => setTimeout(resolve, 300));
          setTestResults(prev => [...prev, simulatedResults[simulatedResults.length - 1]]);
        }
      }
      
      if (simulatedResults.length === 0) {
        setError('No actions were executed. Check your workflow configuration.');
      }
      
    } catch (err) {
      console.error('Error testing workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to test workflow');
    } finally {
      setIsTesting(false);
    }
  };
  
  const formatJsonString = () => {
    try {
      const parsed = JSON.parse(testFormData);
      setTestFormData(JSON.stringify(parsed, null, 2));
    } catch (err) {
      // Ignore parsing errors while editing
    }
  };
  
  const resetTest = () => {
    setTestResults([]);
    setError(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-data">Form Submission Data (JSON)</Label>
              <Textarea
                id="test-data"
                value={testFormData}
                onChange={(e) => setTestFormData(e.target.value)}
                onBlur={formatJsonString}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Enter test form data as JSON"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              {testResults.length > 0 && (
                <Button variant="outline" onClick={resetTest}>
                  Reset Test
                </Button>
              )}
              <Button 
                onClick={handleTest} 
                disabled={isTesting}
                className="flex items-center gap-2"
              >
                {isTesting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                {isTesting ? 'Testing...' : 'Run Test'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {testResults.length === 0 && !isTesting && !error ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/20">
                <p>Run the test to see results here</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {testResults.map((result, index) => {
                  const step = workflow.steps.find(s => s.id === result.stepId);
                  const action = result.actionId === 'conditions' 
                    ? null 
                    : step?.actions.find(a => a.id === result.actionId);
                  
                  return (
                    <div 
                      key={index}
                      className="p-3 border rounded-md flex items-start gap-3"
                    >
                      {result.success ? (
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="space-y-1 flex-grow">
                        <div className="font-medium">
                          {step?.name || 'Unknown Step'} 
                          {action && ` › ${action.name}`}
                          {result.actionId === 'conditions' && ' › Conditions'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.message}
                        </div>
                        {result.details && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Action type: {result.details.actionType}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {isTesting && (
                  <div className="p-3 border rounded-md flex items-center gap-3 bg-muted/20">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                    <div className="text-muted-foreground">
                      Testing workflow...
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowTestPanel;
