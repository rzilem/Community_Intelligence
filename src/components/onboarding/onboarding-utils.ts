
import { Building, Calendar, CheckSquare, Home, FileCheck } from 'lucide-react';

export const getTemplateIcon = (templateType: string) => {
  switch (templateType) {
    case 'hoa':
      return Home;
    case 'condo':
      return Building;
    case 'onsite-hoa':
      return Calendar;
    case 'onsite-condo':
      return CheckSquare;
    case 'offboarding':
      return FileCheck;
    default:
      return Home;
  }
};
