import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedGLService } from '@/services/accounting/advanced-gl-service';
import type { GLAccountExtended } from '@/services/accounting/advanced-gl-service';

interface ChartOfAccountsTreeProps {
  associationId: string;
  refreshKey: number;
}

interface AccountNode extends GLAccountExtended {
  children: AccountNode[];
  level: number;
}

const ChartOfAccountsTree: React.FC<ChartOfAccountsTreeProps> = ({
  associationId,
  refreshKey
}) => {
  const [accounts, setAccounts] = useState<AccountNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAccounts();
  }, [associationId, refreshKey]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const accountData = await AdvancedGLService.getChartOfAccounts(associationId);
      const treeData = buildAccountTree(accountData);
      setAccounts(treeData);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildAccountTree = (accounts: GLAccountExtended[]): AccountNode[] => {
    const accountMap = new Map<string, AccountNode>();
    const rootNodes: AccountNode[] = [];

    // Sort accounts by code for proper hierarchy
    const sortedAccounts = [...accounts].sort((a, b) => a.code.localeCompare(b.code));

    // Create nodes
    sortedAccounts.forEach(account => {
      accountMap.set(account.id, {
        ...account,
        children: [],
        level: 0
      });
    });

    // Build tree structure based on account codes
    sortedAccounts.forEach(account => {
      const node = accountMap.get(account.id);
      if (!node) return;

      // Determine parent based on account code pattern
      const parentCode = findParentCode(account.code, sortedAccounts);
      if (parentCode) {
        const parent = Array.from(accountMap.values()).find(n => n.code === parentCode);
        if (parent) {
          node.level = parent.level + 1;
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const findParentCode = (code: string, accounts: GLAccountExtended[]): string | null => {
    // Find potential parent by matching shorter code patterns
    for (let i = code.length - 1; i > 0; i--) {
      const potentialParent = code.substring(0, i);
      if (accounts.some(acc => acc.code === potentialParent)) {
        return potentialParent;
      }
    }
    return null;
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance);
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (balance < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: 'bg-blue-100 text-blue-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-purple-100 text-purple-800',
      revenue: 'bg-green-100 text-green-800',
      expense: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderAccountNode = (node: AccountNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer`}
          style={{ paddingLeft: `${node.level * 24 + 8}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
          
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">{node.code}</span>
              <span className="font-medium">{node.name}</span>
              <Badge variant="secondary" className={getAccountTypeColor(node.type)}>
                {node.type}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {getBalanceIcon(node.balance)}
              <span className="font-mono">
                {formatBalance(node.balance)}
              </span>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map(renderAccountNode)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-1">
          {accounts.map(renderAccountNode)}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartOfAccountsTree;