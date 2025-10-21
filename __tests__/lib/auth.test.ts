import { AuthService } from '../../lib/auth';

describe('AuthService (Mobile)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any stored state
    global.fetch && jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in with valid credentials (mock)', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await AuthService.signIn(credentials);

      expect(result.user).toEqual({
        uid: 'mock-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
      });
    });

    it('should throw error for invalid credentials', async () => {
      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(AuthService.signIn(credentials)).rejects.toThrow('Invalid email or password');
    });

    it('should handle signin delay', async () => {
      const startTime = Date.now();

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      await AuthService.signIn(credentials);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take approximately 1 second due to mock delay
      expect(duration).toBeGreaterThan(900);
    });
  });

  describe('signUp', () => {
    it('should create new user account (mock)', async () => {
      const credentials = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        confirmPassword: 'password123',
      };

      const result = await AuthService.signUp(credentials);

      expect(result.user).toEqual({
        uid: 'mock-new-user-id',
        email: 'newuser@example.com',
        displayName: 'John Doe',
        emailVerified: false,
      });
    });

    it('should handle signup delay', async () => {
      const startTime = Date.now();

      const credentials = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        confirmPassword: 'password123',
      };

      await AuthService.signUp(credentials);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take approximately 1.5 seconds due to mock delay
      expect(duration).toBeGreaterThan(1400);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully (mock)', async () => {
      const startTime = Date.now();

      await AuthService.signOut();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take approximately 0.5 seconds due to mock delay
      expect(duration).toBeGreaterThan(400);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null for no authenticated user (mock)', async () => {
      const user = await AuthService.getCurrentUser();
      expect(user).toBe(null);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email (mock)', async () => {
      const email = 'test@example.com';
      const startTime = Date.now();

      await AuthService.resetPassword(email);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take approximately 1 second due to mock delay
      expect(duration).toBeGreaterThan(900);
    });
  });
});