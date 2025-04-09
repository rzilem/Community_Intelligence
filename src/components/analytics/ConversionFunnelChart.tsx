
import React from 'react';
import { ConversionRateData } from '@/types/analytics-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConversionFunnelChartProps {
  data: ConversionRateData[];
  className?: string;
}

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ 
  data,
  className
}) => {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for display
  const formattedData = data.map(item => ({
    stage: item.stage,
    rate: parseFloat(item.rate.toFixed(1)),
    count: item.count
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="stage" 
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{ value: 'Count', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'Conversion Rate') return [`${value}%`, name];
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="rate" name="Conversion Rate" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="count" name="Count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnelChart;
