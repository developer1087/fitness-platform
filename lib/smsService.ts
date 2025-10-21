import firestore from '@react-native-firebase/firestore';

export interface SMSInvitation {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  trainerName: string;
  inviteToken: string;
  inviteUrl: string;
}

/**
 * SMS Service for sending trainee invitations
 *
 * In production, this should use Firebase Functions + Twilio or similar service.
 * For now, this provides a structure for SMS sending.
 */
class SMSService {
  private readonly SMS_LOGS_COLLECTION = 'sms_logs';

  /**
   * Send SMS invitation to trainee
   */
  async sendInvitation(invitation: SMSInvitation): Promise<void> {
    try {
      console.log('📱 Sending SMS invitation to:', invitation.phoneNumber);

      // Format phone number to international format
      const formattedPhone = this.formatPhoneNumber(invitation.phoneNumber);

      // Create SMS content
      const message = this.createInvitationMessage(invitation);

      // In development: Log to console
      if (__DEV__) {
        console.log('🔷 [DEV] SMS would be sent:');
        console.log(`To: ${formattedPhone}`);
        console.log(`Message: ${message}`);
        console.log(`Link: ${invitation.inviteUrl}`);

        // Save to Firestore logs for development tracking
        await this.logSMS(formattedPhone, message, 'dev_mode');
        return;
      }

      // In production: Call Firebase Function to send SMS via Twilio
      // await this.sendSMSViaFirebaseFunction(formattedPhone, message);

      // Save to logs
      await this.logSMS(formattedPhone, message, 'sent');

      console.log('✅ SMS invitation sent successfully');
    } catch (error) {
      console.error('❌ Error sending SMS invitation:', error);
      throw error;
    }
  }

  /**
   * Create invitation message text
   */
  private createInvitationMessage(invitation: SMSInvitation): string {
    return `Hi ${invitation.firstName}! ${invitation.trainerName} invited you to Ryzup Fitness. Download the app and sign up: ${invitation.inviteUrl}`;
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If starts with 05, convert to +972 format
    if (cleaned.startsWith('05')) {
      return `+972${cleaned.substring(1)}`;
    }

    // If already has country code
    if (cleaned.startsWith('972')) {
      return `+${cleaned}`;
    }

    // Return as-is if already formatted
    return phoneNumber.startsWith('+') ? phoneNumber : `+${cleaned}`;
  }

  /**
   * Log SMS to Firestore for tracking
   */
  private async logSMS(phoneNumber: string, message: string, status: string): Promise<void> {
    try {
      await firestore()
        .collection(this.SMS_LOGS_COLLECTION)
        .add({
          phoneNumber,
          message,
          status,
          sentAt: new Date().toISOString(),
          type: 'trainee_invitation',
        });
    } catch (error) {
      console.warn('⚠️ Failed to log SMS:', error);
      // Don't throw - logging is non-critical
    }
  }

  /**
   * Production: Send SMS via Firebase Function + Twilio
   * This is called from Firebase Functions, not directly from the app
   */
  private async sendSMSViaFirebaseFunction(phoneNumber: string, message: string): Promise<void> {
    // This would be implemented as a Firebase Function
    // Example implementation:
    /*
    const sendSMS = firebase.functions().httpsCallable('sendSMS');
    const result = await sendSMS({
      phoneNumber,
      message,
    });

    if (!result.data.success) {
      throw new Error('SMS sending failed');
    }
    */

    throw new Error('Production SMS sending not yet implemented. Please set up Firebase Functions + Twilio.');
  }

  /**
   * Send verification code SMS (for phone auth - handled by Firebase Auth)
   */
  async sendVerificationCode(phoneNumber: string): Promise<void> {
    // This is handled by Firebase Auth directly via signInWithPhoneNumber
    console.log('📱 Verification code handled by Firebase Auth for:', phoneNumber);
  }
}

export const smsService = new SMSService();
