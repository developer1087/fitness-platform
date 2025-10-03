import { LoginFormData, SignupFormData, PhoneLoginFormData, PhoneSignupFormData } from './shared-types';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Type alias for User
type User = FirebaseAuthTypes.User;

// Phone auth confirmation result type
type ConfirmationResult = FirebaseAuthTypes.ConfirmResult;

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

      // Create user profile in Firestore
      const uid = userCredential.user.uid;
      const now = new Date().toISOString();

      try {
        await firestore()
          .collection('users')
          .doc(uid)
          .set({
            email: credentials.email,
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            role: 'trainee', // Mobile app is for trainees
            createdAt: now,
            lastLoginAt: now,
            preferences: {
              workoutReminders: true,
              emailNotifications: true,
              pushNotifications: true,
              privacySettings: {
                profileVisibility: 'friends',
                workoutDataSharing: false,
                progressSharing: false,
              },
            },
          });
        console.log('✅ Firestore user document created:', uid);
      } catch (firestoreError) {
        console.error('❌ Firestore document creation error:', firestoreError);
        // If Firestore creation fails, delete the auth user to maintain consistency
        await userCredential.user.delete();
        throw new Error('Failed to create user profile. Please try again.');
      }

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

  // PHONE AUTHENTICATION METHODS

  /**
   * Send SMS verification code to phone number
   * Returns confirmation object that will be used to verify the code
   * Phone number must be in format: +972XXXXXXXXX (with country code)
   */
  static async sendPhoneVerification(phoneNumber: string): Promise<ConfirmationResult> {
    try {
      console.log('📱 Sending verification SMS to:', phoneNumber);

      // Format phone number to international format if needed
      const formattedPhone = phoneNumber.startsWith('+972')
        ? phoneNumber
        : `+972${phoneNumber.substring(1)}`; // Remove leading 0 and add +972

      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      console.log('✅ Verification code sent to:', formattedPhone);

      return confirmation;
    } catch (error: any) {
      console.error('❌ Phone verification error:', error);

      let message = 'Failed to send verification code. Please try again.';
      if (error?.code) {
        switch (error.code) {
          case 'auth/invalid-phone-number':
            message = 'Invalid phone number format. Please check and try again.';
            break;
          case 'auth/too-many-requests':
            message = 'Too many requests. Please try again later.';
            break;
          case 'auth/network-request-failed':
            message = 'Network error. Please check your internet connection.';
            break;
          case 'auth/quota-exceeded':
            message = 'SMS quota exceeded. Please try again later.';
            break;
          default:
            message = error.message;
        }
      }
      throw new Error(message);
    }
  }

  /**
   * Verify SMS code and sign in user (for existing users)
   */
  static async verifyPhoneCode(
    confirmation: ConfirmationResult,
    code: string
  ): Promise<{ user: User }> {
    try {
      console.log('🔐 Verifying SMS code');
      const userCredential = await confirmation.confirm(code);
      console.log('✅ Phone verification successful:', userCredential.user.uid);

      return { user: userCredential.user };
    } catch (error: any) {
      console.error('❌ Code verification error:', error);

      let message = 'Invalid verification code. Please try again.';
      if (error?.code) {
        switch (error.code) {
          case 'auth/invalid-verification-code':
            message = 'Invalid verification code. Please check and try again.';
            break;
          case 'auth/code-expired':
            message = 'Verification code has expired. Please request a new one.';
            break;
          case 'auth/session-expired':
            message = 'Session expired. Please start over.';
            break;
          default:
            message = error.message;
        }
      }
      throw new Error(message);
    }
  }

  /**
   * Complete phone number signup with verification code
   * Creates user account and Firestore profile
   */
  static async signUpWithPhone(credentials: PhoneSignupFormData): Promise<{ user: User }> {
    try {
      console.log('📝 Creating phone auth account:', credentials.phoneNumber);

      // Note: The phone number verification should already be done via sendPhoneVerification
      // This method should be called AFTER successful verification
      // The user is already signed in at this point from verifyPhoneCode

      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found. Please verify phone number first.');
      }

      console.log('✅ Phone account created:', currentUser.uid);

      // Create user profile in Firestore
      const uid = currentUser.uid;
      const now = new Date().toISOString();

      try {
        await firestore()
          .collection('users')
          .doc(uid)
          .set({
            phoneNumber: credentials.phoneNumber,
            email: null, // Phone auth doesn't have email
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            role: 'trainee', // Mobile app is for trainees
            authMethod: 'phone',
            createdAt: now,
            lastLoginAt: now,
            preferences: {
              workoutReminders: true,
              emailNotifications: false, // No email for phone auth
              pushNotifications: true,
              privacySettings: {
                profileVisibility: 'friends',
                workoutDataSharing: false,
                progressSharing: false,
              },
            },
          });
        console.log('✅ Firestore user document created:', uid);
      } catch (firestoreError) {
        console.error('❌ Firestore document creation error:', firestoreError);
        // If Firestore creation fails, delete the auth user to maintain consistency
        await currentUser.delete();
        throw new Error('Failed to create user profile. Please try again.');
      }

      return { user: currentUser };
    } catch (error: any) {
      console.error('❌ Phone signup error:', error);
      throw error instanceof Error ? error : new Error('Phone signup failed');
    }
  }

  /**
   * Sign in with phone number (for existing users)
   * This is actually the same flow as signup - Firebase handles it automatically
   */
  static async signInWithPhone(credentials: PhoneLoginFormData): Promise<{ user: User }> {
    try {
      console.log('📱 Phone sign in:', credentials.phoneNumber);

      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found. Please verify phone number first.');
      }

      console.log('✅ Phone sign in successful:', currentUser.uid);
      return { user: currentUser };
    } catch (error: any) {
      console.error('❌ Phone sign in error:', error);
      throw error instanceof Error ? error : new Error('Phone sign in failed');
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