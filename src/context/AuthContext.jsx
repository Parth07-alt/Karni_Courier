import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const ref = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            let profileData = snap.data();
            // Upgrade to Master Admin if phone matches and not already admin
            const masterPhone = import.meta.env.VITE_MASTER_ADMIN_PHONE;
            if (masterPhone && firebaseUser.phoneNumber === masterPhone && profileData.role !== 'admin') {
              profileData.role = 'admin';
              await setDoc(ref, { role: 'admin' }, { merge: true });
            }
            setUserProfile(profileData);
          } else {
            // Create basic profile on first login
            const masterPhone = import.meta.env.VITE_MASTER_ADMIN_PHONE;
            const newProfile = {
              uid: firebaseUser.uid,
              phone: firebaseUser.phoneNumber || '',
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role: (masterPhone && firebaseUser.phoneNumber === masterPhone) ? 'admin' : 'customer',
              addresses: [],
              createdAt: serverTimestamp(),
            };
            await setDoc(ref, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  const updateProfile = async (data) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, data, { merge: true });
    setUserProfile((prev) => ({ ...prev, ...data }));
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google sign-in error:', err);
      throw err;
    }
  };

  const isAdmin = userProfile?.role === 'admin';
  const displayName = userProfile?.name || userProfile?.phone || userProfile?.email || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAdmin, displayName, initials, logout, updateProfile, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
