
import { Association } from '@/types/association-types';

export interface UserAssociation {
  id: string;
  user_id: string;
  association_id: string;
  role: string;
  created_at: string;
  associations: Association;
}
