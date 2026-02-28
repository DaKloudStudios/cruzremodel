import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';
import { UserRole, ViewState, TeamMember } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthorized: boolean;
  userRole: UserRole | null;
  clientId: string | null;
  allowedViews: ViewState[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // RBAC State
  // RBAC State
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [allowedViews, setAllowedViews] = useState<ViewState[]>([]);

  // Check whitelist in Firestore and get permissions
  const checkWhitelist = async (user: User) => {
    try {
      if (!user.email) throw new Error("No email provided");

      const docRef = doc(db, 'allowed_users', user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as TeamMember;
        setIsAuthorized(true);
        // Default to Admin if role is missing to prevent lockout for manual entries
        // Default to Admin if role is missing to prevent lockout for manual entries
        const role = userData.role || 'Admin';
        setUserRole(role);
        setClientId(userData.clientId || null);

        // Admin gets everything, Staff gets specific list
        if (role === 'Admin') {
          setAllowedViews(['Dashboard', 'Leads', 'Clients', 'Calls', 'Estimates', 'Projects', 'Services', 'Calendar', 'Pricebook', 'Templates', 'TimeClock', 'ProposalViewer', 'Settings', 'Gantt']);
        } else {
          let views = userData.allowedViews || ['Dashboard'];
          setAllowedViews(views);
        }
        setAuthError(null);
      } else {
        // --- SECURE MODE: BOOTSTRAP ADMIN ONLY ---
        // For security, do not allow any random Google sign-in to become an Admin.
        // We only allow this specific email to self-register as the root Administrator.
        if (user.email.toLowerCase() === 'crzremodel@gmail.com') {
          const newUser: TeamMember = {
            id: user.uid,
            email: user.email,
            name: user.displayName || 'Owner Admin',
            role: 'Admin',
            allowedViews: ['Dashboard', 'Leads', 'Clients', 'Calls', 'Estimates', 'Projects', 'Services', 'Calendar', 'Pricebook', 'Templates', 'TimeClock', 'ProposalViewer', 'Settings', 'Gantt'],
            dateAdded: new Date().toISOString(),
            photoUrl: user.photoURL || undefined
          };

          await setDoc(docRef, newUser);

          setIsAuthorized(true);
          setUserRole('Admin');
          setClientId(null);
          setAllowedViews(newUser.allowedViews);
          setAuthError(null);
        } else {
          // Reject all other unknown logins
          console.warn(`Unauthorized login attempt blocked for: ${user.email}`);
          setAuthError('Access Denied: Your email is not registered in the allowed users directory.');
          setIsAuthorized(false);
          await signOut(auth);
        }
      }
    } catch (err) {
      console.error("Whitelist check failed", err);
      setAuthError("Error verifying access permissions.");
      setIsAuthorized(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        await checkWhitelist(user);
      } else {
        // User is signed out - No Guest Override
        // User is signed out - No Guest Override
        setCurrentUser(null);
        setIsAuthorized(false);
        setUserRole(null);
        setClientId(null);
        setAllowedViews([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error("Login failed", error);
      setAuthError(error.message || "Failed to sign in");
    }
  };

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle cleanup
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, isAuthorized, userRole, clientId, allowedViews, login, logout, authError }}>
      {children}
    </AuthContext.Provider>
  );
};