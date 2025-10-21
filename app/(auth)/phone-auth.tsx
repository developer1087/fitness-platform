import PhoneAuthScreen from '../../components/auth/PhoneAuthScreen';
import { router, useLocalSearchParams } from 'expo-router';

export default function PhoneAuthPage() {
  const params = useLocalSearchParams();
  const invitationToken = params.token as string | undefined;

  // Log invitation token if present
  if (invitationToken) {
    console.log('🎟️ Phone auth page received invitation token from URL:', invitationToken);
  }

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
      invitationToken={invitationToken}
    />
  );
}
