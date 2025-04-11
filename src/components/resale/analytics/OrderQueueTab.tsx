
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OrderQueueTabProps {}

const OrderQueueTab: React.FC<OrderQueueTabProps> = () => {
  return (
    <div className="space-y-4">
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
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
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
                <BarChart
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
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderQueueTab;
