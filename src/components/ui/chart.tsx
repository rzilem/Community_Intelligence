
import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line
} from 'recharts';

// Bar Chart Component
interface BarChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  categories,
  index,
  colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'],
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        {showXAxis && <XAxis dataKey={index} angle={-45} textAnchor="end" height={70} />}
        {showYAxis && <YAxis />}
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <Tooltip formatter={valueFormatter} />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Bar 
            key={category} 
            dataKey={category} 
            fill={colors[i % colors.length]} 
            barSize={30}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// Line Chart Component
interface LineChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  categories,
  index,
  colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'],
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        {showXAxis && <XAxis dataKey={index} angle={-45} textAnchor="end" height={70} />}
        {showYAxis && <YAxis />}
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <Tooltip formatter={valueFormatter} />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Line 
            key={category} 
            type="monotone" 
            dataKey={category}
            stroke={colors[i % colors.length]} 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

// Pie Chart Component
interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  category,
  index,
  colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'],
  valueFormatter = (value) => `${value}`,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, value }) => `${name}: ${valueFormatter(value)}`}
          outerRadius={80}
          dataKey={category}
          nameKey={index}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={valueFormatter} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
