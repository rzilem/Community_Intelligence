
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VendorRecommendationEngine from '@/components/vendors/recommendations/VendorRecommendationEngine';
import { Vendor } from '@/types/vendor-types';
import { VENDOR_TABS } from '../config/tab-constants';
import { PROJECT_TYPES, TIMELINE_OPTIONS, PRIORITY_OPTIONS } from '../config/recommendation-defaults';

interface RecommendationsTabProps {
  vendors: Vendor[];
  criteria: any;
  onCriteriaChange: (updates: any) => void;
  onSelectVendor: (vendor: Vendor) => void;
}

const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  vendors,
  criteria,
  onCriteriaChange,
  onSelectVendor
}) => {
  return (
    <TabsContent value={VENDOR_TABS.RECOMMENDATIONS} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Project Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Project Type</label>
              <select 
                className="w-full mt-1 p-2 border rounded"
                value={criteria.projectType}
                onChange={(e) => onCriteriaChange({ projectType: e.target.value })}
              >
                {PROJECT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Budget: ${criteria.budget}</label>
              <input 
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={criteria.budget}
                onChange={(e) => onCriteriaChange({ budget: parseInt(e.target.value) })}
                className="w-full mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Timeline</label>
              <select 
                className="w-full mt-1 p-2 border rounded"
                value={criteria.timeline}
                onChange={(e) => onCriteriaChange({ timeline: e.target.value })}
              >
                {TIMELINE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select 
                className="w-full mt-1 p-2 border rounded"
                value={criteria.priority}
                onChange={(e) => onCriteriaChange({ priority: e.target.value })}
              >
                {PRIORITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-3">
          <VendorRecommendationEngine 
            criteria={criteria}
            vendors={vendors}
            onSelectVendor={onSelectVendor}
          />
        </div>
      </div>
    </TabsContent>
  );
};

export default RecommendationsTab;
