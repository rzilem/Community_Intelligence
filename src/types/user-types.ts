
import { Profile } from './profile-types';

export interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile?: Profile;  // Make profile optional to handle users without profiles
}
