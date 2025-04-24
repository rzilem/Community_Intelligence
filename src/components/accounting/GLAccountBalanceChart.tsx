
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GLAccount } from '@/types/accounting-types';

interface GLAccountBalanceChartProps {
  accounts: GLAccount[];
  title?: string;
  description?: string;
  limit?: number;
  type?: string;
}

const GLAccountBalanceChart: React.FC<GLAccountBalanceChartProps> = ({
  accounts,
  title = "GL Account Balances",
  description = "Top account balances by category",
  limit = 10,
  type
}) => {
  const chartData = useMemo(() => {
    // Filter by type if specified
    const filteredAccounts = type
      ? accounts.filter(account => account.type === type)
      : accounts;
    
    // Sort by balance descending
    const sortedAccounts = [...filteredAccounts].sort((a, b) => 
      (b.balance || 0) - (a.balance || 0)
    );
    
    // Take the top N accounts
    return sortedAccounts.slice(0, limit).map(account => ({
      name: account.name,
      code: account.code,
      value: account.balance || 0,
      type: account.type,
    }));
  }, [accounts, type, limit]);

  const colors = {
    Asset: '#4ade80',
    Liability: '#f87171',
    Equity: '#60a5fa',
    Revenue: '#a78bfa',
    Expense: '#fbbf24'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="code" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value) => [`$${(value as number).toLocaleString()}`, "Balance"]}
                labelFormatter={(label) => {
                  const item = chartData.find(item => item.code === label);
                  return item ? `${item.code} - ${item.name}` : label;
                }}
              />
              <Bar dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[entry.type as keyof typeof colors] || '#cbd5e1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {Object.entries(colors).map(([key, color]) => (
            <div key={key} className="flex items-center">
              <div 
                className="w-3 h-3 mr-1 rounded-sm" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs">{key}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GLAccountBalanceChart;
