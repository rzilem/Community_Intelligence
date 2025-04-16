
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

// Chart container component
interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      {children}
    </div>
  );
};

// Chart tooltip component
interface ChartTooltipProps {
  children: React.ReactNode;
  visible?: boolean;
  className?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  children,
  visible = false,
  className = '',
}) => {
  if (!visible) return null;
  
  return (
    <div className={`absolute z-50 p-2 bg-white rounded-md shadow-md border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Chart tooltip content component
interface ChartTooltipContentProps {
  label?: string;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
  }>;
  formatter?: (value: number | string) => string;
  className?: string;
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({
  label,
  payload = [],
  formatter = (value) => `${value}`,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <div className="font-medium">{label}</div>}
      {payload.map((entry, index) => (
        <div key={`tooltip-item-${index}`} className="flex items-center gap-2">
          {entry.color && (
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
          )}
          <span>{entry.name}: {formatter(entry.value || 0)}</span>
        </div>
      ))}
    </div>
  );
};

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
