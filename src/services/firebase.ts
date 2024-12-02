import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User 
  } from 'firebase/auth';
  import { getDatabase, ref, set, get } from 'firebase/database';
  import { auth } from '../config/firebase';
  
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
  export const firebaseAuth = {
    googleProvider,
    signInWithGoogle: async () => {
      try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        await firebaseAuth.createUserProfile(result.user);
        return result.user;
      } catch (error) {
        console.error('Erreur de connexion Google:', error);
        throw error;
      }
    },
  
    createUserProfile: async (user: User) => {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        await set(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: Date.now(),
        });
      }
    },
  
    signOut: async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Erreur de déconnexion:', error);
        throw error;
      }
    },
  
    onAuthStateChange: (callback: (user: User | null) => void) => {
      return onAuthStateChanged(auth, callback);
    },
  };