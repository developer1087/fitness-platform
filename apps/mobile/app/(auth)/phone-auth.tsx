import PhoneAuthScreen from '../../components/auth/PhoneAuthScreen';
import { router } from 'expo-router';

export default function PhoneAuthPage() {
  const handleSuccess = () => {
    // Navigation will be handled by auth state change
    router.replace('/(tabs)/');
  };

  const handleSwitchToEmail = () => {
    router.push('/(auth)/login');
  };

  return (
    <PhoneAuthScreen
      onSuccess={handleSuccess}
      onSwitchToEmail={handleSwitchToEmail}
    />
  );
}
