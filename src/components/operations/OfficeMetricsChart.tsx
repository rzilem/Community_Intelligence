
import React from 'react';
import { OfficeMetricsData } from '@/types/operations-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OfficeMetricsChartProps {
  data: OfficeMetricsData[];
  className?: string;
}

const OfficeMetricsChart: React.FC<OfficeMetricsChartProps> = ({ data, className }) => {
  const [timeRange, setTimeRange] = React.useState('This Month');
  const [metric, setMetric] = React.useState('Open Requests');

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-xl font-bold">Office Metrics</CardTitle>
          <p className="text-muted-foreground text-sm">Comparing Austin vs Round Rock performance</p>
        </div>
        <div className="flex space-x-2 mt-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="This Month">This Month</SelectItem>
              <SelectItem value="Last Month">Last Month</SelectItem>
              <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
              <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open Requests">Open Requests</SelectItem>
              <SelectItem value="Close Rate">Close Rate</SelectItem>
              <SelectItem value="Response Time">Response Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="office" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="openRequests" name="Open Requests" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeMetricsChart;
