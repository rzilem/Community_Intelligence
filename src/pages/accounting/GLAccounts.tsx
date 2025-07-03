import { useState } from "react";
import { Plus, Settings, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import GLAccountsTable from "@/components/accounting/GLAccountsTable";
import GLAccountDialog from "@/components/accounting/GLAccountDialog";
import ChartOfAccountsTree from "@/components/accounting/ChartOfAccountsTree";
import type { Database } from "@/integrations/supabase/types";

type GLAccount = Database['public']['Tables']['gl_accounts_enhanced']['Row'];

const GLAccounts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountType, setAccountType] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("table");
  const [editingAccount, setEditingAccount] = useState<GLAccount | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // TODO: Get from user's association - for now using placeholder
  const associationId = "placeholder-association-id";

  const handleEditAccount = (account: GLAccount) => {
    setEditingAccount(account);
    setShowDialog(true);
  };

  const handleCreateAccount = () => {
    setEditingAccount(undefined);
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setEditingAccount(undefined);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground">
            Manage your general ledger accounts and chart of accounts structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        <Button onClick={handleCreateAccount}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search accounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={accountType} onValueChange={setAccountType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Account Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="asset">Assets</SelectItem>
            <SelectItem value="liability">Liabilities</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="table">Account List</TabsTrigger>
          <TabsTrigger value="tree">Chart Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Ledger Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <GLAccountsTable 
                key={refreshKey}
                searchTerm={searchTerm}
                accountType={accountType}
                associationId={associationId}
                onEditAccount={handleEditAccount}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tree" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartOfAccountsTree 
                associationId={associationId}
                refreshKey={refreshKey}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <GLAccountDialog 
        open={showDialog}
        onOpenChange={handleDialogClose}
        account={editingAccount}
        associationId={associationId}
        onSave={handleRefresh}
      />
    </div>
  );
};

export default GLAccounts;