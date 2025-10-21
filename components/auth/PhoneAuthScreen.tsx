import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AuthService } from '../../lib/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

type ConfirmationResult = FirebaseAuthTypes.ConfirmResult;

interface PhoneAuthScreenProps {
  onSuccess: () => void;
  onSwitchToEmail: () => void;
  invitationToken?: string | null;
}

export default function PhoneAuthScreen({ onSuccess, onSwitchToEmail, invitationToken }: PhoneAuthScreenProps) {
  // Phone input state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // UI state
  const [step, setStep] = useState<'phone' | 'verify' | 'profile'>('phone');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Log invitation token if provided
  React.useEffect(() => {
    if (invitationToken) {
      console.log('🎟️ PhoneAuthScreen received invitation token:', invitationToken);
    }
  }, [invitationToken]);

  // Format phone number as user types (05X-XXX-XXXX)
  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');

    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);

    // Format as 05X-XXX-XXXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    setError(null);
  };

  const handleSendCode = async () => {
    try {
      setError(null);
      setLoading(true);

      // Remove formatting for API call
      const cleanPhone = phoneNumber.replace(/\D/g, '');

      // Validate phone number
      if (cleanPhone.length !== 10) {
        setError('Phone number must be 10 digits');
        return;
      }

      if (!cleanPhone.startsWith('05')) {
        setError('Phone number must start with 05');
        return;
      }

      console.log('Sending verification code to:', cleanPhone);
      const confirmationResult = await AuthService.sendPhoneVerification(cleanPhone);
      setConfirmation(confirmationResult);
      setStep('verify');
    } catch (err) {
      console.error('Send code error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!confirmation) {
        setError('Please request a verification code first');
        return;
      }

      if (verificationCode.length !== 6) {
        setError('Verification code must be 6 digits');
        return;
      }

      console.log('Verifying code:', verificationCode);
      await AuthService.verifyPhoneCode(confirmation, verificationCode);

      // After successful verification, check if user already has a profile
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        // Check if user profile exists in Firestore
        // If yes → sign in complete
        // If no → need to create profile
        setStep('profile');
      }
    } catch (err) {
      console.error('Verify code error:', err);
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!firstName.trim()) {
        setError('First name is required');
        return;
      }

      if (!lastName.trim()) {
        setError('Last name is required');
        return;
      }

      const cleanPhone = phoneNumber.replace(/\D/g, '');

      console.log('Completing signup for:', cleanPhone);
      if (invitationToken) {
        console.log('🎟️ Including invitation token in signup');
      }

      await AuthService.signUpWithPhone(
        {
          phoneNumber: cleanPhone,
          verificationCode,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
        invitationToken || undefined
      );

      onSuccess();
    } catch (err) {
      console.error('Complete signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setVerificationCode('');
    setStep('phone');
    setConfirmation(null);
  };

  // Render phone number input step
  if (step === 'phone') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Ryzup Fitness</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="05X-XXX-XXXX"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
              maxLength={12} // 10 digits + 2 hyphens
              autoComplete="tel"
              textContentType="telephoneNumber"
              editable={!loading}
            />
            <Text style={styles.hint}>Israeli mobile number (10 digits)</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Verification Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={onSwitchToEmail}
            disabled={loading}
          >
            <Text style={styles.linkText}>Sign in with Email instead</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Render verification code input step
  if (step === 'verify') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Verify Your Phone</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {phoneNumber}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="123456"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              editable={!loading}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleResendCode}
            disabled={loading}
          >
            <Text style={styles.linkText}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Render profile creation step
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John"
            value={firstName}
            onChangeText={setFirstName}
            autoComplete="given-name"
            textContentType="givenName"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Doe"
            value={lastName}
            onChangeText={setLastName}
            autoComplete="family-name"
            textContentType="familyName"
            editable={!loading}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCompleteSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete Signup</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
