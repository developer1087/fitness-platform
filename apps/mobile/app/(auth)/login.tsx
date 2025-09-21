import { LoginScreen } from '../../components/auth/LoginScreen';
import { useAuth } from '../../lib/auth';
import { router } from 'expo-router';
import { LoginFormData } from '@fitness-platform/shared-types';

export default function LoginPage() {
  const { signIn, loading } = useAuth();

  const handleLogin = async (credentials: LoginFormData) => {
    await signIn(credentials);
    // Navigation will be handled by auth state change
    router.replace('/(tabs)/');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      loading={loading}
      onForgotPassword={handleForgotPassword}
      onSignUp={handleSignUp}
    />
  );
}