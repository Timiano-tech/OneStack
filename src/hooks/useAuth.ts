import { useState, useEffect } from 'react';

// Mock authentication hook for testing Feed without full Firebase Auth setup initially.
// In actual app, this wraps onAuthStateChanged from Firebase and fetches User profile from Firestore.

export interface AuthContextType {
  user: {
    uid: string;
    email: string;
    displayName: string;
    campusId: string;
    universityId: string;
    isVerifiedStudent: boolean;
    photoURL?: string;
  } | null;
  loading: boolean;
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating auth fetch
    const mockUser = {
      uid: 'u123',
      email: 'student@futilaro.edu.ng',
      displayName: 'Jane Doe',
      campusId: 'c1',
      universityId: 'uni1',
      isVerifiedStudent: true,
      photoURL: 'https://i.pravatar.cc/150?u=u123'
    };
    
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500);
  }, []);

  return { user, loading };
}
