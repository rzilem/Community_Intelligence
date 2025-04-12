
import React from 'react';
import { Home, Building, MapPin, ArrowRightLeft, FileBox } from 'lucide-react';
import { OnboardingTemplate } from '@/types/onboarding-types';

export const templateTypeOptions = [
  { value: 'hoa', label: 'HOA', icon: <Home className="h-4 w-4 mr-2" /> },
  { value: 'condo', label: 'Condo', icon: <Building className="h-4 w-4 mr-2" /> },
  { value: 'onsite-hoa', label: 'On-site HOA', icon: <MapPin className="h-4 w-4 mr-2" /> },
  { value: 'onsite-condo', label: 'On-site Condo', icon: <MapPin className="h-4 w-4 mr-2" /> },
  { value: 'offboarding', label: 'Offboarding', icon: <ArrowRightLeft className="h-4 w-4 mr-2" /> },
];

export const getTemplateIcon = (type: OnboardingTemplate['template_type']) => {
  switch (type) {
    case 'hoa':
      return <Home className="h-5 w-5 text-blue-500" />;
    case 'condo':
      return <Building className="h-5 w-5 text-purple-500" />;
    case 'onsite-hoa':
      return <MapPin className="h-5 w-5 text-green-500" />;
    case 'onsite-condo':
      return <MapPin className="h-5 w-5 text-indigo-500" />;
    case 'offboarding':
      return <ArrowRightLeft className="h-5 w-5 text-red-500" />;
    default:
      return <FileBox className="h-5 w-5 text-gray-500" />;
  }
};

export const getStageColorClass = (completed: number, total: number) => {
  if (completed === 0) return "text-red-500 fill-red-500";
  if (completed === total) return "text-green-500 fill-green-500";
  return "text-yellow-500 fill-yellow-500";
};
