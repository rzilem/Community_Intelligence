import { useState } from "react";
import { Plus, Download, Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BankReconciliationList from "@/components/accounting/BankReconciliationList";
import BankReconciliationWorksheet from "@/components/accounting/BankReconciliationWorksheet";
import BankStatementUpload from "@/components/accounting/BankStatementUpload";

const BankReconciliation = () => {
  const [selectedAccount, setSelectedAccount] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedReconciliation, setSelectedReconciliation] = useState(null);

  const handleStartReconciliation = () => {
    if (selectedAccount) {
      setActiveTab("worksheet");
    }
  };

  const handleEditReconciliation = (reconciliation: any) => {
    setSelectedReconciliation(reconciliation);
    setActiveTab("worksheet");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
          <p className="text-muted-foreground">
            Reconcile bank statements with general ledger transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Statement
          </Button>
          <Button onClick={handleStartReconciliation} disabled={!selectedAccount}>
            <Plus className="h-4 w-4 mr-2" />
            New Reconciliation
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Bank Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking-001">Operating Checking - *001</SelectItem>
            <SelectItem value="savings-002">Reserve Savings - *002</SelectItem>
            <SelectItem value="money-market-003">Money Market - *003</SelectItem>
          </SelectContent>
        </Select>

        {selectedAccount && (
          <div className="flex items-center gap-4">
            <Badge variant="outline">Last Reconciled: Dec 31, 2024</Badge>
            <Badge variant="outline">Balance: $125,430.25</Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Reconciliation History</TabsTrigger>
          <TabsTrigger value="worksheet" disabled={!selectedAccount}>
            Reconciliation Worksheet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Reconciliations completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Reconciliation in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Differences</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">Outstanding differences</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reconciliation History</CardTitle>
            </CardHeader>
            <CardContent>
              <BankReconciliationList 
                selectedAccount={selectedAccount}
                onEditReconciliation={handleEditReconciliation}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="worksheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Reconciliation Worksheet</CardTitle>
            </CardHeader>
            <CardContent>
              <BankReconciliationWorksheet 
                selectedAccount={selectedAccount}
                reconciliation={selectedReconciliation}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BankStatementUpload 
        open={showUpload}
        onOpenChange={setShowUpload}
        selectedAccount={selectedAccount}
      />
    </div>
  );
};

export default BankReconciliation;