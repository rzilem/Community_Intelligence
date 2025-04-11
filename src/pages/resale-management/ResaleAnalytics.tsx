
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart, Calendar, DollarSign, Clock, FileText, ClipboardList, Search, Receipt, FileCode, ListOrdered } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResaleAnalytics } from '@/hooks/resale/useResaleAnalytics';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Pie, PieChart, Cell, Line, LineChart } from 'recharts';
import StatCard from '@/components/dashboard/StatCard';
import LeadTimeSeriesChart from '@/components/analytics/LeadTimeSeriesChart';
import ConversionFunnelChart from '@/components/analytics/ConversionFunnelChart';

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

  // Mock data for additional reports
  const monthlyTrendData = [
    { month: 'Jan', certificates: 12, questionnaires: 8, inspections: 5 },
    { month: 'Feb', certificates: 15, questionnaires: 10, inspections: 7 },
    { month: 'Mar', certificates: 18, questionnaires: 12, inspections: 9 },
    { month: 'Apr', certificates: 22, questionnaires: 15, inspections: 12 },
    { month: 'May', certificates: 28, questionnaires: 18, inspections: 14 },
    { month: 'Jun', certificates: 32, questionnaires: 22, inspections: 16 },
  ];

  const paymentData = [
    { month: 'Jan', collected: 3500, pending: 1200 },
    { month: 'Feb', collected: 4200, pending: 1500 },
    { month: 'Mar', collected: 4800, pending: 1800 },
    { month: 'Apr', collected: 5500, pending: 2100 },
    { month: 'May', collected: 6300, pending: 1700 },
    { month: 'Jun', collected: 7200, pending: 2300 },
  ];

  const communityData = [
    { name: 'Oakwood Heights', certificates: 28, questionnaires: 22 },
    { name: 'Riverdale Gardens', certificates: 22, questionnaires: 18 },
    { name: 'Highland Park', certificates: 18, questionnaires: 14 },
    { name: 'Meadowbrook', certificates: 15, questionnaires: 12 },
    { name: 'Sunset Ridge', certificates: 12, questionnaires: 10 },
  ];

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
            isPositive: true
          }}
          description="From previous period"
        />

        <StatCard
          title="Total Revenue"
          value={`$${transactionStats?.totalRevenue.toLocaleString() || "0"}`}
          icon={DollarSign}
          trend={{ 
            value: 8, 
            isPositive: true
          }}
          description="From previous period"
        />

        <StatCard
          title="Average Turnaround"
          value={`${transactionStats?.averageTime || "0"} days`}
          icon={Clock}
          trend={{ 
            value: 0.5, 
            isPositive: false
          }}
          description="Faster than previous period"
        />

        <StatCard
          title="Conversion Rate"
          value={`${transactionStats?.conversionRate || "0"}%`}
          icon={BarChart}
          trend={{ 
            value: 5, 
            isPositive: true
          }}
          description="From previous period"
        />
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="w-full border-b pb-0 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Certificates
          </TabsTrigger>
          <TabsTrigger value="questionnaires" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Questionnaires
          </TabsTrigger>
          <TabsTrigger value="inspections" className="flex items-center gap-2">
            <Search className="h-4 w-4" /> Inspections
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Statements
          </TabsTrigger>
          <TabsTrigger value="trecforms" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" /> TREC Forms
          </TabsTrigger>
          <TabsTrigger value="orderqueue" className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4" /> Order Queue
          </TabsTrigger>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

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

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Request Trends</CardTitle>
              <CardDescription>Monthly analysis of certificate requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyTrendData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="certificates" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Average Completion Time</CardTitle>
                <CardDescription>Days to complete by certificate type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { type: 'Standard', days: 4.2 },
                        { type: 'Rush', days: 1.8 },
                        { type: 'Priority', days: 0.9 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="days" fill="#8884d8" name="Days to Complete" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificate Requests by Community</CardTitle>
                <CardDescription>Distribution across HOAs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={communityData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="certificates" fill="#8884d8" name="Certificates" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questionnaires" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Questionnaire Request Trends</CardTitle>
              <CardDescription>Monthly analysis of questionnaire requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyTrendData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="questionnaires" stroke="#00C49F" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Questionnaire Types</CardTitle>
                <CardDescription>Distribution by questionnaire type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { type: 'Condo', value: 45 },
                          { type: 'FHA', value: 30 },
                          { type: 'VA', value: 15 },
                          { type: 'Custom', value: 10 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="type"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questionnaire Requests by Community</CardTitle>
                <CardDescription>Distribution across HOAs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={communityData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="questionnaires" fill="#00C49F" name="Questionnaires" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Trends</CardTitle>
              <CardDescription>Monthly analysis of property inspections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyTrendData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="inspections" stroke="#FFBB28" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Results</CardTitle>
                <CardDescription>Pass/Fail Distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { result: 'Pass', count: 75 },
                          { result: 'Fail', count: 18 },
                          { result: 'Conditional', count: 7 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="result"
                      >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#ff0000" />
                        <Cell fill="#ffbb28" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Inspection Issues</CardTitle>
                <CardDescription>Most frequent property issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { issue: 'Exterior Paint', count: 32 },
                        { issue: 'Landscaping', count: 28 },
                        { issue: 'Roof Damage', count: 15 },
                        { issue: 'Fencing', count: 12 },
                        { issue: 'Structural', count: 8 },
                      ]}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 80,
                        bottom: 5,
                      }}
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="issue" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FFBB28" name="Issue Count" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statement Request Trend</CardTitle>
              <CardDescription>Monthly analysis of statement requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: 'Jan', count: 28 },
                      { month: 'Feb', count: 32 },
                      { month: 'Mar', count: 36 },
                      { month: 'Apr', count: 42 },
                      { month: 'May', count: 48 },
                      { month: 'Jun', count: 52 },
                    ]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Statement Requests" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Statement Types</CardTitle>
                <CardDescription>Distribution by statement type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { type: 'Dues Statement', value: 65 },
                          { type: 'Special Assessment', value: 20 },
                          { type: 'Late Fee', value: 10 },
                          { type: 'Other', value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="type"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Status of payments for statement requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={paymentData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Line type="monotone" dataKey="collected" stroke="#82ca9d" name="Collected" />
                      <Line type="monotone" dataKey="pending" stroke="#ff7300" name="Pending" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trecforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>TREC Forms Usage</CardTitle>
              <CardDescription>Monthly analysis of TREC form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: 'Jan', count: 15 },
                      { month: 'Feb', count: 18 },
                      { month: 'Mar', count: 22 },
                      { month: 'Apr', count: 28 },
                      { month: 'May', count: 32 },
                      { month: 'Jun', count: 38 },
                    ]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="TREC Forms" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Used TREC Forms</CardTitle>
                <CardDescription>Distribution by form type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { form: 'Form 1506', count: 48 },
                        { form: 'Form 1414', count: 35 },
                        { form: 'Form 1205', count: 28 },
                        { form: 'Form 1601', count: 22 },
                        { form: 'Other Forms', count: 15 },
                      ]}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 80,
                        bottom: 5,
                      }}
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="form" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" name="Usage Count" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Time</CardTitle>
                <CardDescription>Average days to process by form type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { form: 'Form 1506', days: 3.2 },
                        { form: 'Form 1414', days: 2.8 },
                        { form: 'Form 1205', days: 3.5 },
                        { form: 'Form 1601', days: 2.5 },
                        { form: 'Other Forms', days: 4.2 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 80,
                        bottom: 5,
                      }}
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="form" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="days" fill="#00C49F" name="Days to Process" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orderqueue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Queue Status</CardTitle>
              <CardDescription>Overview of current orders in queue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { status: 'Pending', count: 18 },
                        { status: 'In Progress', count: 24 },
                        { status: 'Ready for Review', count: 12 },
                        { status: 'Completed', count: 42 },
                        { status: 'On Hold', count: 6 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                    >
                      <Cell fill="#FFB44D" /> {/* Pending */}
                      <Cell fill="#6199FF" /> {/* In Progress */}
                      <Cell fill="#9381FF" /> {/* Ready for Review */}
                      <Cell fill="#4CAF50" /> {/* Completed */}
                      <Cell fill="#F44336" /> {/* On Hold */}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Backlog Trend</CardTitle>
                <CardDescription>Monthly analysis of order backlog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: 'Jan', backlog: 12 },
                        { month: 'Feb', backlog: 15 },
                        { month: 'Mar', backlog: 10 },
                        { month: 'Apr', backlog: 18 },
                        { month: 'May', backlog: 14 },
                        { month: 'Jun', backlog: 8 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="backlog" stroke="#FF8042" activeDot={{ r: 8 }} name="Order Backlog" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Types in Queue</CardTitle>
                <CardDescription>Distribution by document type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { type: 'Certificates', count: 35 },
                        { type: 'Questionnaires', count: 28 },
                        { type: 'Inspections', count: 15 },
                        { type: 'Statements', count: 22 },
                        { type: 'TREC Forms', count: 12 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" name="Count" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default ResaleAnalytics;
