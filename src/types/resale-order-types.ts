
import { ResalePackageStatus } from './resale-types';

export type ResalePriority = 'Urgent' | 'Regular' | 'Standard' | 'Expedited';
export type ResaleOrderStatus = 'Scheduled' | 'Completed' | 'In Review' | 'Past Due';
export type ResaleOrderType = 'Resale Certificate' | 'Mortgage Questionnaire' | 'Questionnaire' | 'Compliance Questionnaire' | 'Condo Questionnaire' | 'Disclosure Packet';

export interface ResaleOrder {
  id: string;
  orderNumber: string;
  address: string;
  ownerSeller: string;
  community: string;
  communityId: string; // Association ID
  propertyId?: string;
  type: ResaleOrderType;
  priority: ResalePriority;
  scheduledDate: string;
  status: ResaleOrderStatus;
  createdAt: string;
  updatedAt: string;
}
