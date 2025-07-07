import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Activity, Database, Key, Globe, AlertTriangle, Server } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';

const EnterpriseIntegrationDashboard: React.FC = () => {
  return (
    <PageTemplate 
      title="Enterprise Integration & Scalability" 
      icon={<Server className="h-8 w-8" />}
      description="Enterprise-grade integration, security, and multi-tenant management platform."
    >
      <div className="space-y-6">
        {/* Enterprise Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Gateway</CardTitle>
              <Key className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">Active API keys</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Multi-Tenant</CardTitle>
              <Globe className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Active tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">Security compliance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">145ms</div>
              <p className="text-xs text-muted-foreground">Avg response time</p>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Gateway
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Enterprise-grade API management with rate limiting, authentication, and comprehensive logging.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Calls Today</span>
                  <span className="font-medium">12,847</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rate Limit Usage</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Endpoints</span>
                  <span className="font-medium">24</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Multi-Tenant Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Scalable multi-tenant infrastructure with isolated data and customizable branding.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Users</span>
                  <span className="font-medium">2,456</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Storage Used</span>
                  <span className="font-medium">145 GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>White-Label Tenants</span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Advanced Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Enterprise security framework with audit logging, IP whitelisting, and threat detection.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Audit Events Today</span>
                  <span className="font-medium">892</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Sessions</span>
                  <span className="font-medium">127</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Security Alerts</span>
                  <span className="font-medium text-red-600">2</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Advanced analytics and business intelligence across all tenants and integrations.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Data Points</span>
                  <span className="font-medium">1.2M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reports Generated</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Real-time Feeds</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Real-time monitoring and performance optimization with auto-scaling capabilities.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uptime</span>
                  <span className="font-medium text-green-600">99.98%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span className="font-medium">34%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span className="font-medium">67%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Third-party integrations and webhook endpoints with health monitoring.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Integrations</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Webhook Events</span>
                  <span className="font-medium">3,456</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Failed Requests</span>
                  <span className="font-medium text-orange-600">7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
};

export default EnterpriseIntegrationDashboard;