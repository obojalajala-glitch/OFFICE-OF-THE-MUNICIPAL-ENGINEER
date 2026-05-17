import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, limit, setDoc, getDocs, addDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'PERMIT_UPDATE' | 'NEW_REPORT' | 'APPOINTMENT_REMINDER';
  read: boolean;
  link?: string;
  timestamp: number;
}

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  isLoggingIn: boolean;
  authError: string | null;
  login: () => Promise<void>;
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  registerCitizen: (profileData: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearAuthError: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check admin status
        try {
          const GOD_ACCOUNT_UID = 'ZNMLVtA9OecjIYVbkIGYyZ5ySpW2';
          const GOD_ACCOUNT_EMAIL = 'jviterbo@jalajala.local';
          const isPrimaryAdmin = user.email === 'obo.jalajala@gmail.com' || user.email === GOD_ACCOUNT_EMAIL || user.uid === GOD_ACCOUNT_UID;
          
          let adminExists = false;
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            adminExists = adminDoc.exists();
          } catch (e) {
            console.error("Error checking admin doc (likely expected for non-admins):", e);
          }
          
          setIsAdmin(isPrimaryAdmin || adminExists);

          // Fetch User Profile
          try {
            const profileDoc = await getDoc(doc(db, 'users', user.uid));
            if (profileDoc.exists()) {
              setProfile(profileDoc.data() as UserProfile);
            } else if (user.uid === GOD_ACCOUNT_UID || user.email === GOD_ACCOUNT_EMAIL) {
              // Auto-provision God Account profile if missing
              const initialGodProfile: UserProfile = {
                uid: user.uid,
                username: 'jviterbo',
                firstName: 'Joselito',
                lastName: 'Viterbo',
                email: user.email || 'obo.jalajala@gmail.com',
                contactNumber: '09000000000',
                permanentAddress: 'Jalajala, Rizal',
                jalajalaAddress: 'Jalajala, Rizal',
                birthdate: '2001-01-01',
                gender: 'MALE',
                classification: 'GOVERNMENT',
                idNumber: 'GOD-001',
                idPhotoUrl: '',
                updatedAt: Date.now()
              };
              await setDoc(doc(db, 'users', GOD_ACCOUNT_UID), initialGodProfile);
              setProfile(initialGodProfile);
            } else {
              setProfile(null);
            }
          } catch (error) {
            console.error("Profile fetch error:", error);
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          }
        } catch (e) {
          console.error("Error checking status/profile:", e);
          setIsAdmin(false);
          setProfile(null);
        }
      } else {
        setIsAdmin(false);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const loginWithCredentials = async (username: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const email = `${username.toLowerCase()}@jalajala.local`;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      console.error("Login failed:", e);
      throw e;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const registerCitizen = async (profileData: Partial<UserProfile>) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      // Use Anonymous Auth for citizens who don't want to use username/password
      const userCredential = await signInAnonymously(auth);
      const newUser = userCredential.user;

      const profileRef = doc(db, 'users', newUser.uid);
      const finalProfile: UserProfile = {
        ...(profileData as any),
        uid: newUser.uid,
        username: `citizen_${newUser.uid.substring(0, 8)}`,
        updatedAt: Date.now()
      };

      await setDoc(profileRef, finalProfile);
      setProfile(finalProfile);

      // Log activity
      const p = profileData as any;
      await addDoc(collection(db, 'activity_log'), {
        type: 'CITIZEN_REGISTRATION',
        userId: user.uid,
        userName: p.fullName || 'New Citizen',
        details: `Verified registration completed for ${p.fullName || 'User'}. Classification: ${p.residentClassification || 'Standard'}.`,
        timestamp: Date.now()
      });
    } catch (e: any) {
      if (e.code === 'auth/network-request-failed') {
        setAuthError("Network error: Please check your internet connection. (Also ensure Anonymous Authentication is enabled in your Firebase Console).");
      } else if (e.code === 'auth/operation-not-allowed') {
        setAuthError("Auth error: Anonymous login is not enabled in your Firebase project settings.");
      } else {
        setAuthError(e.message);
      }
      console.error("Citizen registration failed:", e);
      throw e;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const profileRef = doc(db, 'users', user.uid);
      const updatedData = {
        ...profile,
        ...data,
        uid: user.uid,
        updatedAt: Date.now()
      };
      await setDoc(profileRef, updatedData, { merge: true });
      setProfile(updatedData as UserProfile);
    } catch (e) {
      console.error("Error updating profile:", e);
      throw e;
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Listen to notifications
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribeNotifications = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      setNotifications(notifs);
    });

    return () => unsubscribeNotifications();
  }, [user]);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.warn("Login cancelled by user.");
      } else if (error.code === 'auth/network-request-failed') {
        setAuthError("Network error: Please check your internet connection or ensure popups are not blocked by an ad-blocker/firewall.");
      } else {
        setAuthError(error.message);
        console.error("Login failed:", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const markAsRead = async (notificationId: string) => {
    // Implementation for marking as read
    // This would normally be a setDoc/updateDoc call
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (e) {
      console.error("Error marking notification as read:", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      profile,
      loading, 
      isAdmin, 
      notifications, 
      unreadCount, 
      isLoggingIn, 
      authError,
      login, 
      loginWithCredentials,
      registerCitizen,
      logout, 
      markAsRead,
      updateProfile,
      clearAuthError: () => setAuthError(null)
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
