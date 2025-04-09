
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Printer, Mail, Truck } from 'lucide-react';

interface PrintSettingsProps {
  defaultPrinter: string;
  setDefaultPrinter: (printer: string) => void;
  doubleSided: boolean;
  setDoubleSided: (enabled: boolean) => void;
}

const PrintSettings: React.FC<PrintSettingsProps> = ({
  defaultPrinter,
  setDefaultPrinter,
  doubleSided,
  setDoubleSided
}) => {
  const printers = ['Main Office Printer', 'Reception Desk Printer', 'Executive Office Printer', 'Maintenance Office Printer'];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h.01" />
            <path d="M12 12h.01" />
            <path d="M16 12h.01" />
          </svg>
          Print Queue Settings
        </CardTitle>
        <p className="text-muted-foreground">Configure your printing and mailing preferences</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="printers">
          <TabsList>
            <TabsTrigger value="printers" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Printers
            </TabsTrigger>
            <TabsTrigger value="mailing" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Mailing
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping
            </TabsTrigger>
          </TabsList>
          <TabsContent value="printers" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-printer">Default Printer</Label>
              <Select value={defaultPrinter} onValueChange={setDefaultPrinter}>
                <SelectTrigger id="default-printer" className="w-full">
                  <SelectValue placeholder="Select a printer" />
                </SelectTrigger>
                <SelectContent>
                  {printers.map((printer) => (
                    <SelectItem key={printer} value={printer}>
                      {printer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="double-sided" className="flex flex-col gap-1">
                <span>Default to Double-sided Printing</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Print on both sides of the paper when possible
                </span>
              </Label>
              <Switch
                id="double-sided"
                checked={doubleSided}
                onCheckedChange={setDoubleSided}
              />
            </div>
          </TabsContent>
          <TabsContent value="mailing" className="pt-4">
            <div className="text-center text-muted-foreground py-8">
              Mailing settings will be displayed here.
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="pt-4">
            <div className="text-center text-muted-foreground py-8">
              Shipping settings will be displayed here.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PrintSettings;
