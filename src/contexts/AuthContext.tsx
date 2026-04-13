import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User as UserProfile } from '../types';

interface AuthContextType {
  user: (User & UserProfile) | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User & UserProfile) | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (supabaseUser: User) => {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (profile) {
      // Map snake_case from DB to camelCase for the app
      const mappedProfile: UserProfile = {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        username: profile.username,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        campusId: profile.campus_id,
        major: profile.major,
        graduationYear: profile.graduation_year,
        isVerified: profile.is_verified,
        trustScore: Number(profile.trust_score),
        isBanned: profile.is_banned,
        notificationPreferences: profile.notification_preferences,
        privacySettings: profile.privacy_settings,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      };
      setUser({ ...supabaseUser, ...mappedProfile });
    } else {
      setUser(supabaseUser as any);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user).then(() => setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
