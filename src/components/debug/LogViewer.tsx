
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = () => {
    setIsLoading(true);
    try {
      // Get logs from localStorage and console
      const errorLogs = JSON.parse(localStorage.getItem('error_boundary_log') || '[]');
      const authLogs = JSON.parse(localStorage.getItem('auth_logs') || '[]');
      
      const combinedLogs = [
        ...errorLogs.map((log: any) => ({ ...log, type: 'error' })),
        ...authLogs.map((log: any) => ({ ...log, type: 'auth' }))
      ].sort((a, b) => new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime());

      setLogs(combinedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Application Logs</CardTitle>
          <Button 
            onClick={fetchLogs} 
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No logs available</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="p-3 border rounded text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    log.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(log.timestamp || log.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="font-medium">{log.message || log.error || 'Unknown log entry'}</p>
                {log.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs">Stack trace</summary>
                    <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                      {log.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogViewer;
