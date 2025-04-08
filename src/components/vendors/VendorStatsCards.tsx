
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VendorStats } from "@/types/vendor-types";
import { Building2, CheckCircle, AlertTriangle, BarChart2, ClipboardList, Shield } from "lucide-react";

interface VendorStatsCardsProps {
  stats: VendorStats;
}

const VendorStatsCards: React.FC<VendorStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Vendors</p>
              <h3 className="text-2xl font-bold">{stats.totalVendors}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Vendors</p>
              <h3 className="text-2xl font-bold">{stats.activeVendors}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Inactive Vendors</p>
              <h3 className="text-2xl font-bold">{stats.inactiveVendors}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <BarChart2 className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Top Category</p>
              <h3 className="text-2xl font-bold">{stats.topCategory || "None"}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <ClipboardList className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Service Categories</p>
              <h3 className="text-2xl font-bold">{stats.serviceCategories}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-muted-foreground">With Insurance</p>
              <h3 className="text-2xl font-bold">{stats.withInsurance}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorStatsCards;
