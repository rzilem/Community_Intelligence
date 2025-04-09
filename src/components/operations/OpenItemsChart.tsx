
import React from 'react';
import { OperationsTimeSeriesData } from '@/types/operations-types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OpenItemsChartProps {
  data: OperationsTimeSeriesData[];
  className?: string;
}

const OpenItemsChart: React.FC<OpenItemsChartProps> = ({ data, className }) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Open Items by Category</CardTitle>
        <p className="text-muted-foreground text-sm">All active requests across associations</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 25,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              <Line 
                type="monotone" 
                dataKey="invoices" 
                name="Invoices" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="arcRequests" 
                name="ARC Requests" 
                stroke="#82ca9d" 
              />
              <Line 
                type="monotone" 
                dataKey="gateRequests" 
                name="Gate Requests" 
                stroke="#ffc658" 
              />
              <Line 
                type="monotone" 
                dataKey="poolRequests" 
                name="Pool Requests" 
                stroke="#ff8042" 
              />
              <Line 
                type="monotone" 
                dataKey="generalInquiries" 
                name="General Inquiries" 
                stroke="#0088fe" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenItemsChart;
