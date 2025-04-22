
import { useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/profile-types';
import { Association } from '@/types/association-types';
import { UserAssociation } from '../types';

export function useAuthState() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAssociations, setUserAssociations] = useState<UserAssociation[]>([]);
  const [currentAssociation, setCurrentAssociation] = useState<Association | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  return {
    session,
    setSession,
    user,
    setUser,
    profile,
    setProfile,
    loading,
    setLoading,
    isAdmin,
    setIsAdmin,
    userRole,
    setUserRole,
    userAssociations,
    setUserAssociations,
    currentAssociation,
    setCurrentAssociation,
    authError,
    setAuthError,
  };
}
