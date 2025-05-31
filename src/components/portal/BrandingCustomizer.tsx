
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandingSettings } from '@/types/portal-types';
import { Upload, Palette, Type, Layout } from 'lucide-react';

interface BrandingCustomizerProps {
  branding: BrandingSettings;
  onBrandingChange: (updates: Partial<BrandingSettings>) => void;
}

export const BrandingCustomizer: React.FC<BrandingCustomizerProps> = ({
  branding,
  onBrandingChange
}) => {
  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Source Sans Pro'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Branding Customization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => onBrandingChange({ primaryColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.primaryColor}
                    onChange={(e) => onBrandingChange({ primaryColor: e.target.value })}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => onBrandingChange({ secondaryColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.secondaryColor}
                    onChange={(e) => onBrandingChange({ secondaryColor: e.target.value })}
                    placeholder="#6B7280"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => onBrandingChange({ accentColor: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={branding.accentColor}
                    onChange={(e) => onBrandingChange({ accentColor: e.target.value })}
                    placeholder="#10B981"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Color Preview</h4>
              <div className="flex gap-4">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: branding.primaryColor }}
                />
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: branding.secondaryColor }}
                />
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: branding.accentColor }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select 
                  value={branding.fontFamily} 
                  onValueChange={(value) => onBrandingChange({ fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map(font => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size: {branding.fontSize}px</Label>
                <Slider
                  id="font-size"
                  min={12}
                  max={24}
                  step={1}
                  value={[branding.fontSize]}
                  onValueChange={([value]) => onBrandingChange({ fontSize: value })}
                  className="w-full"
                />
              </div>

              <div className="mt-6 p-4 border rounded-lg" style={{ 
                fontFamily: branding.fontFamily, 
                fontSize: `${branding.fontSize}px` 
              }}>
                <h4 className="font-bold mb-2">Typography Preview</h4>
                <p>This is how your text will look with the selected font and size.</p>
                <p className="text-sm text-gray-600 mt-2">Small text example for secondary content.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logo" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Upload Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                  <Button variant="outline" className="mt-2">
                    Choose File
                  </Button>
                </div>
              </div>

              {branding.logo && (
                <div className="space-y-2">
                  <Label>Current Logo</Label>
                  <div className="border rounded-lg p-4">
                    <img 
                      src={branding.logo} 
                      alt="HOA Logo" 
                      className="max-h-16 mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="border-radius">Border Radius: {branding.borderRadius}px</Label>
                <Slider
                  id="border-radius"
                  min={0}
                  max={20}
                  step={1}
                  value={[branding.borderRadius]}
                  onValueChange={([value]) => onBrandingChange({ borderRadius: value })}
                  className="w-full"
                />
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Border Radius Preview</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className="h-16 bg-gray-200 border"
                    style={{ borderRadius: `${branding.borderRadius}px` }}
                  />
                  <div 
                    className="h-16 bg-blue-100 border border-blue-300"
                    style={{ borderRadius: `${branding.borderRadius}px` }}
                  />
                  <div 
                    className="h-16 bg-green-100 border border-green-300"
                    style={{ borderRadius: `${branding.borderRadius}px` }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
