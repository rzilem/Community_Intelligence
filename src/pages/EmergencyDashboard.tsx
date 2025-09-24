import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EmergencyDashboard() {
  const navigate = useNavigate();

  const handleReset = () => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Force reload to clear any cached state
    window.location.href = '/';
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">🚨 Emergency Dashboard Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You've accessed the emergency dashboard bypass. This usually means there was an authentication issue.
            </p>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Quick Actions:</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={goToDashboard}
                  variant="default"
                >
                  Try Normal Dashboard
                </Button>
                <Button 
                  onClick={handleReset}
                  variant="destructive"
                >
                  Reset Everything & Restart
                </Button>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Current URL: {window.location.href}</li>
                <li>• Local Storage Keys: {Object.keys(localStorage).length}</li>
                <li>• Session Storage Keys: {Object.keys(sessionStorage).length}</li>
                <li>• Emergency Bypass: {localStorage.getItem('emergency_bypass') ? 'Active' : 'Inactive'}</li>
              </ul>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Emergency dashboard activated to bypass authentication loops.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}