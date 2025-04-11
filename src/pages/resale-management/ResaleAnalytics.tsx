
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart, Calendar, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResaleAnalytics } from '@/hooks/resale/useResaleAnalytics';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Pie, PieChart, Cell } from 'recharts';
import StatCard from '@/components/dashboard/StatCard';

const ResaleAnalytics = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const { 
    transactionStats,
    timeSeriesData,
    sourceData,
    conversionData,
    requestedDocuments,
    isLoading
  } = useResaleAnalytics(timeRange);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Custom data visualization for source distribution
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <PageTemplate 
      title="Resale Analytics" 
      icon={<BarChart className="h-8 w-8" />}
      description="Track performance metrics and reports for resale operations."
      actions={
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatCard
          title="Total Transactions"
          value={transactionStats?.totalTransactions.toString() || "0"}
          icon={Calendar}
          trend={{ 
            value: 12, 
            direction: 'up'
          }}
          description="From previous period"
        />

        <StatCard
          title="Total Revenue"
          value={`$${transactionStats?.totalRevenue.toLocaleString() || "0"}`}
          icon={DollarSign}
          trend={{ 
            value: 8, 
            direction: 'up'
          }}
          description="From previous period"
          inverseTrend={true}
        />

        <StatCard
          title="Average Turnaround"
          value={`${transactionStats?.averageTime || "0"} days`}
          icon={Clock}
          trend={{ 
            value: 0.5, 
            direction: 'down'
          }}
          description="Faster than previous period"
          inverseTrend={true}
        />

        <StatCard
          title="Conversion Rate"
          value={`${transactionStats?.conversionRate || "0"}%`}
          icon={BarChart}
          trend={{ 
            value: 5, 
            direction: 'up'
          }}
          description="From previous period"
        />
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Source Distribution</TabsTrigger>
          <TabsTrigger value="documents">Requested Documents</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Resale Transactions Over Time</CardTitle>
              <CardDescription>Tracks new and converted resale requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={timeSeriesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="new_leads" fill="#8884d8" name="New Requests" />
                    <Bar dataKey="converted_leads" fill="#82ca9d" name="Completed" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Source Distribution</CardTitle>
              <CardDescription>Where resale requests originate from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="source"
                    >
                      {sourceData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Requested Documents</CardTitle>
              <CardDescription>Documents most frequently included in resale packages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={requestedDocuments}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 120,
                      bottom: 5,
                    }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="document" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" name="Request Count" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Tracking of resale request progression through stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={conversionData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Count" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default ResaleAnalytics;
