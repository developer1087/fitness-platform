import { authService } from '../../lib/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockSendPasswordResetEmail = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
      };

      const mockUserCredential = {
        user: mockUser,
      };

      mockSignInWithEmailAndPassword.mockResolvedValue(mockUserCredential as any);

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.signIn(credentials);

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object), // auth instance
        credentials.email,
        credentials.password
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw error for invalid credentials', async () => {
      const errorMessage = 'Invalid email or password';
      mockSignInWithEmailAndPassword.mockRejectedValue(new Error(errorMessage));

      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.signIn(credentials)).rejects.toThrow(errorMessage);
    });

    it('should handle Firebase auth errors', async () => {
      const firebaseError = {
        code: 'auth/user-not-found',
        message: 'User not found',
      };
      mockSignInWithEmailAndPassword.mockRejectedValue(firebaseError);

      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(authService.signIn(credentials)).rejects.toThrow('User not found');
    });
  });

  describe('signUp', () => {
    it('should create user account with valid data', async () => {
      const mockUser = {
        uid: 'new-user-uid',
        email: 'newuser@example.com',
        displayName: null,
        emailVerified: false,
      };

      const mockUserCredential = {
        user: mockUser,
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential as any);
      mockSetDoc.mockResolvedValue(undefined);

      const credentials = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        confirmPassword: 'password123',
      };

      const result = await authService.signUp(credentials);

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object), // auth instance
        credentials.email,
        credentials.password
      );

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.any(Object), // doc reference
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'newuser@example.com',
          role: 'user',
          accountStatus: 'active',
          subscriptionTier: 'free',
        })
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw error if email already exists', async () => {
      const firebaseError = {
        code: 'auth/email-already-in-use',
        message: 'Email already in use',
      };
      mockCreateUserWithEmailAndPassword.mockRejectedValue(firebaseError);

      const credentials = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        confirmPassword: 'password123',
      };

      await expect(authService.signUp(credentials)).rejects.toThrow('Email already in use');
    });

    it('should handle weak password errors', async () => {
      const firebaseError = {
        code: 'auth/weak-password',
        message: 'Password should be at least 6 characters',
      };
      mockCreateUserWithEmailAndPassword.mockRejectedValue(firebaseError);

      const credentials = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
        confirmPassword: '123',
      };

      await expect(authService.signUp(credentials)).rejects.toThrow('Password should be at least 6 characters');
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await authService.signOut();

      expect(mockSignOut).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should handle sign out errors', async () => {
      const errorMessage = 'Sign out failed';
      mockSignOut.mockRejectedValue(new Error(errorMessage));

      await expect(authService.signOut()).rejects.toThrow(errorMessage);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      mockSendPasswordResetEmail.mockResolvedValue(undefined);

      const email = 'test@example.com';
      await authService.resetPassword(email);

      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        expect.any(Object), // auth instance
        email
      );
    });

    it('should throw error for invalid email', async () => {
      const firebaseError = {
        code: 'auth/user-not-found',
        message: 'User not found',
      };
      mockSendPasswordResetEmail.mockRejectedValue(firebaseError);

      const email = 'nonexistent@example.com';

      await expect(authService.resetPassword(email)).rejects.toThrow('User not found');
    });
  });

  describe('createUserProfile', () => {
    it('should create user profile in Firestore', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      const userId = 'test-uid';
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      await authService.createUserProfile(userId, userData);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.any(Object), // doc reference
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'user',
          accountStatus: 'active',
          subscriptionTier: 'free',
          createdAt: expect.any(String),
          lastLoginAt: expect.any(String),
        })
      );
    });

    it('should handle Firestore errors', async () => {
      const errorMessage = 'Failed to create profile';
      mockSetDoc.mockRejectedValue(new Error(errorMessage));

      const userId = 'test-uid';
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      await expect(authService.createUserProfile(userId, userData)).rejects.toThrow(errorMessage);
    });
  });
});