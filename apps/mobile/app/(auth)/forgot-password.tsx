import { ForgotPasswordScreen } from '../../components/auth/ForgotPasswordScreen';
import { router } from 'expo-router';
import { ResetPasswordFormData } from '../../lib/shared-types';

export default function ForgotPasswordPage() {
  const handleForgotPassword = async (data: ResetPasswordFormData) => {
    // TODO: Implement forgot password logic
    console.log('Forgot password for:', data.email);
    // For now, just go back to login
    router.back();
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <ForgotPasswordScreen
      onForgotPassword={handleForgotPassword}
      onBackToLogin={handleBackToLogin}
    />
  );
}