import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { firebaseAuth } from '../services/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const user = await firebaseAuth.signInWithGoogle();
      return user;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
};