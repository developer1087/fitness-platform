import { SignupScreen } from '../../components/auth/SignupScreen';
import { useAuth } from '../../lib/auth';
import { router } from 'expo-router';
import { SignupFormData } from '../../lib/shared-types';

export default function SignupPage() {
  const { signUp, loading } = useAuth();

  const handleSignup = async (credentials: SignupFormData) => {
    await signUp(credentials);
    // Navigation will be handled by auth state change
    router.replace('/(tabs)/');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SignupScreen
      onSignup={handleSignup}
      loading={loading}
      onLogin={handleLogin}
    />
  );
}