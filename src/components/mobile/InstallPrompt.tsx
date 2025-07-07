import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Wifi, Zap } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

interface InstallPromptProps {
  onDismiss: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onDismiss }) => {
  const { canInstall, install, isOnline } = usePWA();
  const { toast } = useToast();

  const handleInstall = async () => {
    try {
      await install();
      toast({
        title: "App Installed",
        description: "Community Intelligence has been added to your home screen!"
      });
      onDismiss();
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: "Unable to install the app. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!canInstall) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-between">
            <span>Install App</span>
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Smartphone className="h-16 w-16 mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              Install Community Intelligence for a better mobile experience
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-green-600" />
              <span className="text-sm">Faster loading times</span>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-blue-600" />
              <span className="text-sm">Works offline</span>
            </div>
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-purple-600" />
              <span className="text-sm">Push notifications</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onDismiss} className="flex-1">
              Not Now
            </Button>
            <Button onClick={handleInstall} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          </div>

          {!isOnline && (
            <div className="text-center text-sm text-amber-600">
              ⚠️ You're currently offline
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;