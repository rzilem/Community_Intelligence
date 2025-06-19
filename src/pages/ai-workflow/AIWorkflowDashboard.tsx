
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Workflow, 
  TrendingUp, 
  MessageSquare, 
  Settings,
  FileText,
  Zap,
  BarChart3
} from 'lucide-react';
import IntelligentWorkflowDesigner from '@/components/ai-workflow/IntelligentWorkflowDesigner';
import PredictiveAnalyticsDashboard from '@/components/ai-workflow/PredictiveAnalyticsDashboard';
import DuplicateDetectionDashboard from '@/components/data-import/DuplicateDetectionDashboard';

interface AIWorkflowDashboardProps {
  associationId: string;
}

const AIWorkflowDashboard: React.FC<AIWorkflowDashboardProps> = ({ associationId }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            AI Workflow Automation & Intelligence
          </h1>
          <p className="text-gray-600 mt-2">
            Harness the power of AI to automate workflows, predict outcomes, and optimize operations
          </p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          <Zap className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workflow-designer">
            <Workflow className="h-4 w-4 mr-2" />
            Workflow Designer
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Predictive Analytics
          </TabsTrigger>
          <TabsTrigger value="document-processing">
            <FileText className="h-4 w-4 mr-2" />
            Document Intelligence
          </TabsTrigger>
          <TabsTrigger value="communication">
            <MessageSquare className="h-4 w-4 mr-2" />
            Communication Hub
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Settings className="h-4 w-4 mr-2" />
            Automation Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-blue-500" />
                  Active Workflows
                </CardTitle>
                <CardDescription>Currently running workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">23</div>
                <p className="text-sm text-gray-600">+3 from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Success Rate
                </CardTitle>
                <CardDescription>Workflow completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">87%</div>
                <p className="text-sm text-gray-600">+5% improvement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI Predictions
                </CardTitle>
                <CardDescription>Active predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">12</div>
                <p className="text-sm text-gray-600">High confidence</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Documents Processed
                </CardTitle>
                <CardDescription>Auto-processed this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">148</div>
                <p className="text-sm text-gray-600">92% accuracy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-pink-500" />
                  Messages Analyzed
                </CardTitle>
                <CardDescription>AI communication analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-600">256</div>
                <p className="text-sm text-gray-600">Auto-categorized</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  Automation Rules
                </CardTitle>
                <CardDescription>Active automation rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">15</div>
                <p className="text-sm text-gray-600">All functioning</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Insights</CardTitle>
                <CardDescription>Latest AI-generated insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-blue-500 mt-1" />
                      <div>
                        <p className="font-medium text-sm">Maintenance Cost Prediction</p>
                        <p className="text-sm text-gray-600">
                          Predicted 15% increase in winter maintenance costs. Consider preventive measures.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-l-4 border-l-green-500 bg-green-50">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="font-medium text-sm">Community Health Score</p>
                        <p className="text-sm text-gray-600">
                          Community health improved to 87%. Great resident satisfaction levels.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-yellow-500 mt-1" />
                      <div>
                        <p className="font-medium text-sm">Communication Pattern</p>
                        <p className="text-sm text-gray-600">
                          Increased maintenance requests detected. Auto-routing enabled.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>AI system performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Workflow Automation Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="text-sm font-bold">78%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Prediction Accuracy</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-bold">85%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Document Processing</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-sm font-bold">92%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Communication Analysis</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-pink-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                      </div>
                      <span className="text-sm font-bold">89%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflow-designer">
          <IntelligentWorkflowDesigner 
            associationId={associationId}
            onWorkflowCreated={(workflow) => {
              console.log('Workflow created:', workflow);
            }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <PredictiveAnalyticsDashboard associationId={associationId} />
        </TabsContent>

        <TabsContent value="document-processing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-orange-500" />
                  Smart Document Processing Pipeline
                </CardTitle>
                <CardDescription>
                  AI-powered document classification, data extraction, and workflow automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">148</div>
                    <p className="text-sm text-gray-600">Documents Processed</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <p className="text-sm text-gray-600">Classification Accuracy</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">34</div>
                    <p className="text-sm text-gray-600">Workflows Triggered</p>
                  </div>
                </div>
                
                <DuplicateDetectionDashboard 
                  files={[]}
                  autoProcess={false}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-pink-500" />
                AI-Powered Communication Hub
              </CardTitle>
              <CardDescription>
                Intelligent message categorization, sentiment analysis, and automated routing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">256</div>
                  <p className="text-sm text-gray-600">Messages Analyzed</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">89%</div>
                  <p className="text-sm text-gray-600">Auto-Categorization</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">4.2</div>
                  <p className="text-sm text-gray-600">Avg Sentiment Score</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">12</div>
                  <p className="text-sm text-gray-600">Urgent Messages</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Communication Intelligence</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">Maintenance Request</Badge>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      "Emergency plumbing issue in Unit 204. Water is leaking into the hallway."
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Sentiment: -0.3 (Concerned)</span>
                      <span>Confidence: 94%</span>
                      <span>Auto-routed to: Emergency Team</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">Community Feedback</Badge>
                      <Badge variant="default">Normal</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      "Thank you for organizing the community BBQ event. Everyone had a great time!"
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Sentiment: 0.8 (Positive)</span>
                      <span>Confidence: 91%</span>
                      <span>Auto-routed to: Community Relations</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-gray-500" />
                Advanced Automation Rules Engine
              </CardTitle>
              <CardDescription>
                Create and manage complex automation rules with machine learning capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">15</div>
                  <p className="text-sm text-gray-600">Active Rules</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">342</div>
                  <p className="text-sm text-gray-600">Executions This Month</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">96%</div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active Automation Rules</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">Emergency Maintenance Auto-Escalation</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Automatically escalates urgent maintenance requests to emergency team within 15 minutes
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Executions: 12</span>
                      <span>Success Rate: 100%</span>
                      <span>Learning: Enabled</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">Payment Reminder Automation</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Sends automated payment reminders based on account status and payment history
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Executions: 89</span>
                      <span>Success Rate: 94%</span>
                      <span>Learning: Enabled</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">Document Classification Workflow</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Automatically categorizes and routes uploaded documents to appropriate departments
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Executions: 241</span>
                      <span>Success Rate: 92%</span>
                      <span>Learning: Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIWorkflowDashboard;
