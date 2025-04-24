
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayIcon, Code } from 'lucide-react';
import { FormWorkflow } from '@/types/form-workflow-types';

interface WorkflowTestPanelProps {
  workflow: FormWorkflow;
}

const WorkflowTestPanel: React.FC<WorkflowTestPanelProps> = ({
  workflow
}) => {
  const handleTestWorkflow = () => {
    console.log('Test workflow with ID:', workflow.id);
    // In a real implementation, this would run a test execution of the workflow
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Test your workflow with sample data to verify it works as expected.
          </p>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleTestWorkflow}
              disabled={workflow.steps.length === 0 || !workflow.isEnabled}
              className="w-full sm:w-auto"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Run Test
            </Button>

            <div className="p-4 border rounded-md bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4" />
                <span className="font-medium">Test Results</span>
              </div>
              {workflow.steps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No steps to test. Add workflow steps first.</p>
              ) : !workflow.isEnabled ? (
                <p className="text-sm text-muted-foreground">Workflow is disabled. Enable it to run tests.</p>
              ) : (
                <p className="text-sm text-muted-foreground">Click "Run Test" to see workflow execution details.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowTestPanel;
