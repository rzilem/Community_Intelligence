
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface CashFlowStatementProps {
  data: {
    statementName: string;
    periodStart: string;
    periodEnd: string;
    operating: {
      activities: Array<{id: string; name: string; code: string; balance: number, type: string}>;
      total: number;
    };
    investing: {
      activities: Array<{id: string; name: string; code: string; balance: number}>;
      total: number;
    };
    financing: {
      activities: Array<{id: string; name: string; code: string; balance: number}>;
      total: number;
    };
    netCashFlow: number;
    createdAt: string;
  };
}

const CashFlowStatementView: React.FC<CashFlowStatementProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-center">{data.statementName}</CardTitle>
        <p className="text-center text-muted-foreground">
          {format(new Date(data.periodStart), 'MMM d, yyyy')} to {format(new Date(data.periodEnd), 'MMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Operating Activities Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Operating Activities</h3>
            <div className="space-y-1">
              {data.operating.activities.map(activity => (
                <div key={activity.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {activity.name} ({activity.code})
                    {activity.type ? ` - ${activity.type}` : ''}
                  </span>
                  <span>{formatCurrency(activity.type === 'expense' ? -activity.balance : activity.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Net Cash from Operating Activities</span>
                <span className={data.operating.total >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(data.operating.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Investing Activities Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Investing Activities</h3>
            <div className="space-y-1">
              {data.investing.activities.length > 0 ? (
                data.investing.activities.map(activity => (
                  <div key={activity.id} className="flex justify-between">
                    <span className="text-muted-foreground">{activity.name} ({activity.code})</span>
                    <span>{formatCurrency(activity.balance)}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No investing activities recorded</div>
              )}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Net Cash from Investing Activities</span>
                <span className={data.investing.total >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(data.investing.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Financing Activities Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Financing Activities</h3>
            <div className="space-y-1">
              {data.financing.activities.length > 0 ? (
                data.financing.activities.map(activity => (
                  <div key={activity.id} className="flex justify-between">
                    <span className="text-muted-foreground">{activity.name} ({activity.code})</span>
                    <span>{formatCurrency(activity.balance)}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No financing activities recorded</div>
              )}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Net Cash from Financing Activities</span>
                <span className={data.financing.total >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(data.financing.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Net Cash Flow */}
          <div className="border-t border-t-2 pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Net Change in Cash</span>
              <span className={data.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}>
                {formatCurrency(data.netCashFlow)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowStatementView;
