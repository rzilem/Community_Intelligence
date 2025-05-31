
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

const HealthCheck: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const runHealthCheck = async () => {
    setIsChecking(true);
    const checks: HealthStatus[] = [];

    // Check Supabase connection
    try {
      const { data, error } = await supabase.auth.getSession();
      checks.push({
        component: 'Supabase Auth',
        status: error ? 'error' : 'healthy',
        message: error ? `Error: ${error.message}` : 'Connected successfully',
        details: { hasSession: !!data.session }
      });
    } catch (error: any) {
      checks.push({
        component: 'Supabase Auth',
        status: 'error',
        message: `Connection failed: ${error.message}`,
        details: error
      });
    }

    // Check localStorage
    try {
      localStorage.setItem('health_check_test', 'test');
      const testValue = localStorage.getItem('health_check_test');
      localStorage.removeItem('health_check_test');
      
      checks.push({
        component: 'Local Storage',
        status: testValue === 'test' ? 'healthy' : 'warning',
        message: testValue === 'test' ? 'Working correctly' : 'May have issues'
      });
    } catch (error: any) {
      checks.push({
        component: 'Local Storage',
        status: 'error',
        message: `Error: ${error.message}`
      });
    }

    // Check React Context
    try {
      const reactVersion = React.version;
      checks.push({
        component: 'React',
        status: 'healthy',
        message: `React ${reactVersion} loaded`,
        details: { version: reactVersion }
      });
    } catch (error: any) {
      checks.push({
        component: 'React',
        status: 'error',
        message: `React error: ${error.message}`
      });
    }

    // Check network connectivity
    try {
      const response = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      checks.push({
        component: 'Network',
        status: response.ok ? 'healthy' : 'warning',
        message: response.ok ? 'Internet connection working' : 'Network issues detected'
      });
    } catch (error: any) {
      checks.push({
        component: 'Network',
        status: 'error',
        message: `Network error: ${error.message}`
      });
    }

    setHealthStatus(checks);
    setIsChecking(false);
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Health Check</CardTitle>
          <Button 
            onClick={runHealthCheck} 
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthStatus.map((check, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded">
              {getStatusIcon(check.status)}
              <div className="flex-1">
                <div className="font-medium">{check.component}</div>
                <div className="text-sm text-muted-foreground">{check.message}</div>
                {check.details && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">Details</summary>
                    <pre className="text-xs mt-1 bg-gray-100 p-2 rounded">
                      {JSON.stringify(check.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthCheck;
