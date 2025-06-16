
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

interface PerformanceChartsProps {
  performanceData: any[];
  jobStatusData: any[];
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ 
  performanceData, 
  jobStatusData 
}) => {
  return (
    <>
      {performanceData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#10b981" 
                  name="Completion Rate %" 
                />
                <Line 
                  type="monotone" 
                  dataKey="onTimeRate" 
                  stroke="#3b82f6" 
                  name="On-Time Rate %" 
                />
                <Line 
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="#f59e0b" 
                  name="Customer Satisfaction" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Job Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={jobStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {jobStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default PerformanceCharts;
