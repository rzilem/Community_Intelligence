
export type ResaleEventType = 'rush_order' | 'normal_order' | 'questionnaire' | 'inspection' | 'document_expiration' | 'document_update';

export type ResaleEventStatus = 'pending' | 'in_progress' | 'completed';

export interface ResaleEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  property?: string;
  type: ResaleEventType;
  startTime: string;
  endTime: string;
  date: Date;
  color?: string;
  status?: ResaleEventStatus;
}

export interface NewResaleEvent {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  property?: string;
  type: string;
  color: string;
}

export interface ResaleEventFilters {
  resaleOrders: boolean;
  propertyInspections: boolean;
  documentExpirations: boolean;
  documentUpdates: boolean;
}
