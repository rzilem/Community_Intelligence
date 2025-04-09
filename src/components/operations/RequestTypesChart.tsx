
import React from 'react';
import { RequestTypeData } from '@/types/operations-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RequestTypesChartProps {
  data: RequestTypeData[];
  className?: string;
}

const RequestTypesChart: React.FC<RequestTypesChartProps> = ({ data, className }) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Request Types</CardTitle>
        <p className="text-muted-foreground text-sm">Breakdown by category</p>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="percentage"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  const item = data.find(d => d.type === props.payload.type);
                  return [`${item?.count} (${value}%)`, name];
                }}
                labelFormatter={(name) => `Type: ${name}`}
              />
              <Legend formatter={(value) => <span style={{ color: '#666', fontSize: 14 }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestTypesChart;
