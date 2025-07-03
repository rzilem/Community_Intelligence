import React from 'react';
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AccountNode {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  current_balance: number;
  children?: AccountNode[];
  isExpanded?: boolean;
}

const ChartOfAccountsTree: React.FC = () => {
  // Mock hierarchical data
  const accountTree: AccountNode[] = [
    {
      id: '1',
      account_code: '1000',
      account_name: 'Assets',
      account_type: 'asset',
      current_balance: 500000,
      isExpanded: true,
      children: [
        {
          id: '2',
          account_code: '1100',
          account_name: 'Current Assets',
          account_type: 'asset',
          current_balance: 200000,
          isExpanded: true,
          children: [
            {
              id: '3',
              account_code: '1110',
              account_name: 'Cash - Operating',
              account_type: 'asset',
              current_balance: 125430.25
            },
            {
              id: '4',
              account_code: '1120',
              account_name: 'Cash - Reserve',
              account_type: 'asset',
              current_balance: 75000.00
            },
            {
              id: '5',
              account_code: '1130',
              account_name: 'Accounts Receivable',
              account_type: 'asset',
              current_balance: 45672.80
            }
          ]
        },
        {
          id: '6',
          account_code: '1200',
          account_name: 'Fixed Assets',
          account_type: 'asset',
          current_balance: 300000,
          children: [
            {
              id: '7',
              account_code: '1210',
              account_name: 'Equipment',
              account_type: 'asset',
              current_balance: 150000
            },
            {
              id: '8',
              account_code: '1220',
              account_name: 'Accumulated Depreciation',
              account_type: 'asset',
              current_balance: -50000
            }
          ]
        }
      ]
    },
    {
      id: '9',
      account_code: '2000',
      account_name: 'Liabilities',
      account_type: 'liability',
      current_balance: -50000,
      isExpanded: true,
      children: [
        {
          id: '10',
          account_code: '2100',
          account_name: 'Current Liabilities',
          account_type: 'liability',
          current_balance: -30000,
          children: [
            {
              id: '11',
              account_code: '2110',
              account_name: 'Accounts Payable',
              account_type: 'liability',
              current_balance: -18945.50
            },
            {
              id: '12',
              account_code: '2120',
              account_name: 'Accrued Expenses',
              account_type: 'liability',
              current_balance: -11054.50
            }
          ]
        }
      ]
    }
  ];

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(balance));
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-purple-100 text-purple-800';
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAccountNode = (account: AccountNode, level: number = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const indent = level * 24;

    return (
      <div key={account.id}>
        <div 
          className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md"
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {account.isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}
            
            {hasChildren ? (
              <Folder className="h-4 w-4 text-muted-foreground" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
            
            <span className="font-mono text-sm text-muted-foreground">
              {account.account_code}
            </span>
            <span className="font-medium">{account.account_name}</span>
            
            <Badge className={getAccountTypeColor(account.account_type)} variant="outline">
              {account.account_type}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`font-mono text-sm ${account.current_balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatBalance(account.current_balance)}
            </span>
          </div>
        </div>
        
        {hasChildren && account.isExpanded && (
          <div>
            {account.children?.map(child => renderAccountNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground mb-4">
        Click on folders to expand/collapse account groups
      </div>
      
      {accountTree.map(account => renderAccountNode(account))}
    </div>
  );
};

export default ChartOfAccountsTree;