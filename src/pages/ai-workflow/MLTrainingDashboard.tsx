import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Play, 
  Pause, 
  BarChart3, 
  Database, 
  Settings, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Target,
  Layers,
  RefreshCw
} from 'lucide-react';
import { mlTrainingEngine, MLTrainingJob, MLModelPerformance, TrainingDataset } from '@/services/ml/training';
import { useToast } from '@/hooks/use-toast';

interface MLTrainingDashboardProps {
  associationId: string;
}

const MLTrainingDashboard: React.FC<MLTrainingDashboardProps> = ({ associationId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedModelType, setSelectedModelType] = useState<string>('invoice_processing');
  const [trainingDataSize, setTrainingDataSize] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState('jobs');

  // Fetch training jobs
  const { data: trainingJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['training-jobs', associationId],
    queryFn: () => mlTrainingEngine.getTrainingJobs(associationId),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch model performance
  const { data: modelPerformance = [], isLoading: performanceLoading } = useQuery({
    queryKey: ['model-performance'],
    queryFn: () => mlTrainingEngine.getModelPerformance(),
  });

  // Fetch training datasets
  const { data: datasets = [], isLoading: datasetsLoading } = useQuery({
    queryKey: ['training-datasets', associationId],
    queryFn: () => mlTrainingEngine.getTrainingDatasets(associationId),
  });

  // Create training job mutation
  const createJobMutation = useMutation({
    mutationFn: (params: { model_type: string; training_data_size: number }) =>
      mlTrainingEngine.createTrainingJob({
        association_id: associationId,
        model_type: params.model_type,
        training_data_size: params.training_data_size,
      }),
    onSuccess: () => {
      toast({
        title: "Training Job Created",
        description: "Your ML training job has been queued successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['training-jobs', associationId] });
    },
    onError: (error) => {
      toast({
        title: "Error Creating Job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateJob = () => {
    createJobMutation.mutate({
      model_type: selectedModelType,
      training_data_size: trainingDataSize,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const runningJobs = trainingJobs.filter(job => job.job_status === 'running');
  const completedJobs = trainingJobs.filter(job => job.job_status === 'completed');
  const failedJobs = trainingJobs.filter(job => job.job_status === 'failed');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            ML Training Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage machine learning model training jobs
          </p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          <Activity className="h-3 w-3 mr-1" />
          {runningJobs.length} Active
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Running Jobs</p>
                <p className="text-2xl font-bold text-blue-600">{runningJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Active Models</p>
                <p className="text-2xl font-bold text-purple-600">
                  {modelPerformance.filter(m => m.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jobs">
            <Activity className="h-4 w-4 mr-2" />
            Training Jobs
          </TabsTrigger>
          <TabsTrigger value="models">
            <Layers className="h-4 w-4 mr-2" />
            Model Performance
          </TabsTrigger>
          <TabsTrigger value="datasets">
            <Database className="h-4 w-4 mr-2" />
            Training Data
          </TabsTrigger>
          <TabsTrigger value="create">
            <Zap className="h-4 w-4 mr-2" />
            Create Job
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Jobs</CardTitle>
              <CardDescription>
                Monitor the status of all training jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : trainingJobs.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No training jobs found. Create your first training job to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {trainingJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.job_status)}
                          <h3 className="font-medium">{job.model_type}</h3>
                        </div>
                        <Badge className={getStatusColor(job.job_status)}>
                          {job.job_status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Training Data Size</p>
                          <p className="font-medium">{job.training_data_size.toLocaleString()} samples</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Started</p>
                          <p className="font-medium">
                            {job.started_at ? new Date(job.started_at).toLocaleString() : 'Not started'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium">
                            {job.completed_at && job.started_at
                              ? Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 60000) + ' min'
                              : job.started_at
                              ? Math.round((new Date().getTime() - new Date(job.started_at).getTime()) / 60000) + ' min'
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      {job.job_status === 'running' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-muted-foreground">Estimated 15 min remaining</span>
                          </div>
                          <Progress value={67} className="h-2" />
                        </div>
                      )}
                      
                      {job.accuracy_improvement && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>Accuracy improved by {(job.accuracy_improvement * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      
                      {job.error_message && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{job.error_message}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
              <CardDescription>
                View performance metrics for all trained models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : modelPerformance.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No model performance data available. Train some models to see their performance.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modelPerformance.map((model) => (
                    <div key={model.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{model.model_name}</h3>
                          <p className="text-sm text-muted-foreground">v{model.model_version}</p>
                        </div>
                        <Badge variant={model.is_active ? "default" : "secondary"}>
                          {model.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Accuracy Score</span>
                          <div className="flex items-center gap-2">
                            <Progress value={model.accuracy_score * 100} className="w-16 h-2" />
                            <span className="text-sm font-bold">{(model.accuracy_score * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span>Training Data Size</span>
                          <span className="font-medium">{model.training_data_size.toLocaleString()}</span>
                        </div>
                        
                        {model.last_trained && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Last Trained</span>
                            <span className="font-medium">{new Date(model.last_trained).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Datasets</CardTitle>
              <CardDescription>
                View and manage training datasets for different model types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {datasetsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {datasets.map((dataset) => (
                    <div key={dataset.name} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{dataset.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {dataset.type.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {dataset.size.toLocaleString()} samples
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Data Quality</span>
                          <div className="flex items-center gap-2">
                            <Progress value={dataset.quality_score * 100} className="w-16 h-2" />
                            <span className="text-sm font-bold">{(dataset.quality_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span>Last Updated</span>
                          <span className="font-medium">{new Date(dataset.last_updated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Training Job</CardTitle>
              <CardDescription>
                Configure and start a new ML model training job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="model-type">Model Type</Label>
                  <Select value={selectedModelType} onValueChange={setSelectedModelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice_processing">Invoice Processing</SelectItem>
                      <SelectItem value="maintenance_prediction">Maintenance Prediction</SelectItem>
                      <SelectItem value="resident_insights">Resident Insights</SelectItem>
                      <SelectItem value="financial_forecasting">Financial Forecasting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="training-size">Training Data Size</Label>
                  <Input
                    id="training-size"
                    type="number"
                    value={trainingDataSize}
                    onChange={(e) => setTrainingDataSize(Number(e.target.value))}
                    min="100"
                    max="10000"
                    step="100"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Number of samples to use for training (100-10,000)
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ready to start training?</p>
                  <p className="text-sm text-muted-foreground">
                    This will create a new training job with the selected parameters
                  </p>
                </div>
                <Button 
                  onClick={handleCreateJob}
                  disabled={createJobMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {createJobMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Training
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLTrainingDashboard;