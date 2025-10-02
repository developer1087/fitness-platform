import { LoginFormData, SignupFormData } from './shared-types';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Type alias for User
type User = FirebaseAuthTypes.User;

// Production Firebase Auth Service
export class AuthService {
  static async signIn(credentials: LoginFormData): Promise<{ user: User }> {
    try {
      console.log('🔐 Signing in with Firebase:', credentials.email);
      const userCredential = await auth().signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
      console.log('✅ Firebase sign in successful:', userCredential.user.uid);
      return { user: userCredential.user };
    } catch (error: any) {
      console.error('❌ Firebase sign in error:', error);

      // Provide user-friendly error messages
      let message = 'Sign in failed. Please try again.';
      if (error?.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            message = 'Invalid email or password. Please check your credentials.';
            break;
          case 'auth/too-many-requests':
            message = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            message = 'Network error. Please check your internet connection.';
            break;
          default:
            message = error.message;
        }
      }
      throw new Error(message);
    }
  }

  static async signUp(credentials: SignupFormData): Promise<{ user: User }> {
    try {
      console.log('📝 Creating Firebase account:', credentials.email);
      const userCredential = await auth().createUserWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
      console.log('✅ Firebase account created:', userCredential.user.uid);
      return { user: userCredential.user };
    } catch (error: any) {
      console.error('❌ Firebase sign up error:', error);

      // Provide user-friendly error messages
      let message = 'Account creation failed. Please try again.';
      if (error?.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            message = 'This email is already registered. Please sign in instead.';
            break;
          case 'auth/weak-password':
            message = 'Password is too weak. Please choose a stronger password.';
            break;
          case 'auth/invalid-email':
            message = 'Invalid email address. Please check the format.';
            break;
          case 'auth/network-request-failed':
            message = 'Network error. Please check your internet connection.';
            break;
          default:
            message = error.message;
        }
      }
      throw new Error(message);
    }
  }

  static async signOut(): Promise<void> {
    try {
      console.log('🚪 Signing out from Firebase');
      await auth().signOut();
      console.log('✅ Firebase sign out successful');
    } catch (error) {
      console.error('❌ Firebase sign out error:', error);
      throw error;
    }
  }

  static getCurrentUser(): User | null {
    return auth().currentUser;
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      console.log('📧 Sending password reset email:', email);
      await auth().sendPasswordResetEmail(email);
      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('❌ Password reset error:', error);

      let message = 'Failed to send password reset email.';
      if (error?.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            message = 'No account found with this email address.';
            break;
          case 'auth/invalid-email':
            message = 'Invalid email address.';
            break;
          case 'auth/network-request-failed':
            message = 'Network error. Please check your internet connection.';
            break;
          default:
            message = error.message;
        }
      }
      throw new Error(message);
    }
  }
}

// Auth state management hooks for React Native with Firebase

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: LoginFormData) => Promise<void>;
  signUp: (credentials: SignupFormData) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 Setting up Firebase auth state listener');

    // Listen to Firebase auth state changes
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      console.log('🔄 Firebase auth state changed:', firebaseUser?.uid || 'no user');
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up Firebase auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (credentials: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.signIn(credentials);
      // User state will be updated by onAuthStateChanged listener
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (credentials: SignupFormData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.signUp(credentials);
      // User state will be updated by onAuthStateChanged listener
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signOut();
      // User state will be updated by onAuthStateChanged listener
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}