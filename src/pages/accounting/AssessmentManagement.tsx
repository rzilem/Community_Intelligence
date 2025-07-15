import React, { useState, useEffect } from 'react';
import { AssessmentService } from '@/services/accounting/assessment-service';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Receipt, Plus, Calendar, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AssociationSelector from '@/components/associations/AssociationSelector';

const AssessmentManagement = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>();
  const [agingData, setAgingData] = useState<any>(null);

  useEffect(() => {
    if (selectedAssociationId) {
      loadAgingData();
    }
  }, [selectedAssociationId]);

  const loadAgingData = async () => {
    if (!selectedAssociationId) return;
    try {
      const aging = await AssessmentService.getAgingReport(selectedAssociationId);
      setAgingData(aging);
    } catch (error) {
      console.error('Error loading aging data:', error);
    }
  };

  const mockAssessments = [
    {
      id: '1',
      type: 'Monthly HOA Fee',
      amount: 250.00,
      dueDate: '2024-01-01',
      status: 'active',
      propertiesCount: 150,
      collectedAmount: 35000,
      pendingAmount: 2500
    },
    {
      id: '2', 
      type: 'Special Assessment - Pool Repair',
      amount: 500.00,
      dueDate: '2024-02-15',
      status: 'pending',
      propertiesCount: 150,
      collectedAmount: 45000,
      pendingAmount: 30000
    }
  ];

  const mockCollections = [
    {
      id: '1',
      propertyAddress: '123 Main St',
      ownerName: 'John Smith',
      totalDue: 1250.00,
      daysPastDue: 45,
      stage: 'legal',
      lastAction: 'Lien filed',
      priority: 'high'
    },
    {
      id: '2',
      propertyAddress: '456 Oak Ave',
      ownerName: 'Jane Doe',
      totalDue: 750.00,
      daysPastDue: 15,
      stage: 'notice',
      lastAction: 'Notice sent',
      priority: 'normal'
    }
  ];

  return (
    <AppLayout>
      <PageTemplate 
        title="Assessment Management" 
        icon={<Receipt className="h-8 w-8" />}
        description="Manage assessments, collections, and accounts receivable"
      >
      <div className="space-y-6">
        {/* Header with Association Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AssociationSelector onAssociationChange={setSelectedAssociationId} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => {}}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
            <Button variant="outline" onClick={() => {}}>
              <Calendar className="h-4 w-4 mr-2" />
              Generate Bills
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold">$32,500</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                  <p className="text-2xl font-bold">92.3%</p>
                </div>
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delinquent Units</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Days Late</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="assessments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assessments">Active Assessments</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="aging">Aging Report</TabsTrigger>
            <TabsTrigger value="payment-plans">Payment Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Types</CardTitle>
                <CardDescription>Manage assessment types and their collection status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{assessment.type}</h3>
                          <Badge variant={assessment.status === 'active' ? 'success' : 'warning'}>
                            {assessment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(assessment.dueDate).toLocaleDateString()} | 
                          Amount: ${assessment.amount.toFixed(2)} | 
                          Properties: {assessment.propertiesCount}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">
                          Collected: ${assessment.collectedAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pending: ${assessment.pendingAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Collections Cases</CardTitle>
                <CardDescription>Active collection cases requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCollections.map((collection) => (
                    <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{collection.propertyAddress}</h3>
                          <Badge variant={collection.priority === 'high' ? 'destructive' : 'secondary'}>
                            {collection.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Owner: {collection.ownerName} | 
                          {collection.daysPastDue} days past due
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stage: {collection.stage} | Last Action: {collection.lastAction}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium">${collection.totalDue.toFixed(2)}</p>
                        <Button size="sm" variant="outline">
                          Take Action
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aging" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accounts Receivable Aging</CardTitle>
                <CardDescription>Breakdown of outstanding balances by age</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Current</p>
                    <p className="text-2xl font-bold text-green-600">$15,200</p>
                    <p className="text-xs text-muted-foreground">68 units</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">31-60 Days</p>
                    <p className="text-2xl font-bold text-yellow-600">$8,300</p>
                    <p className="text-xs text-muted-foreground">22 units</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">61-90 Days</p>
                    <p className="text-2xl font-bold text-orange-600">$5,600</p>
                    <p className="text-xs text-muted-foreground">12 units</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">91-120 Days</p>
                    <p className="text-2xl font-bold text-red-600">$2,100</p>
                    <p className="text-xs text-muted-foreground">6 units</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Over 120 Days</p>
                    <p className="text-2xl font-bold text-red-800">$1,300</p>
                    <p className="text-xs text-muted-foreground">4 units</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-plans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Plans</CardTitle>
                <CardDescription>Active payment arrangements with residents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Payment plan management coming soon</p>
                  <Button className="mt-4" onClick={() => {}}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Payment Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default AssessmentManagement;