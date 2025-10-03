# Phone Authentication Implementation Guide

**Status:** 🟡 70% Complete - Core functionality implemented
**Last Updated:** October 3, 2025

## Overview

Ryzup Fitness uses **phone authentication as the primary method** for trainee signup and login. This provides a seamless mobile-first experience for the Israeli market.

## Authentication Strategy

### Trainers (Web App)
- **Primary:** Email/Password
- **Alternative:** Google OAuth
- **Platform:** Web only (app.ryzup.me)
- **Role:** Automatically assigned `role: 'trainer'`

### Trainees (Mobile App)
- **Primary:** Phone Authentication (SMS verification) ✅ IMPLEMENTED
- **Fallback:** Email/Password (for edge cases)
- **Platform:** Mobile only (React Native app)
- **Role:** Automatically assigned `role: 'trainee'`

## Implementation Status

### ✅ Completed

#### 1. Type Definitions
**Files:**
- `/packages/shared-types/src/auth/types.ts` (Mobile monorepo)
- `/fitness-platform-web-standalone/src/shared-types/auth/types.ts` (Web app)

**Types Added:**
```typescript
export type AuthMethod = 'phone' | 'email' | 'google';

export interface User {
  phoneNumber: string | null;
  authMethod: AuthMethod;
  // ... other fields
}

export interface PhoneAuthCredentials {
  phoneNumber: string;
  verificationCode: string;
}

export interface PhoneSignupCredentials {
  phoneNumber: string;
  verificationCode: string;
  firstName: string;
  lastName: string;
}
```

#### 2. Phone Validation Schemas
**Files:**
- `/packages/shared-types/src/auth/schemas.ts` (Mobile)
- `/fitness-platform-web-standalone/src/shared-types/auth/schemas.ts` (Web)

**Validation:**
- Israeli phone format: `05XXXXXXXX` (10 digits)
- Regex: `/^05\d{8}$/`
- Auto-conversion to international: `+972XXXXXXXXX`
- SMS verification code: 6 digits

#### 3. Mobile Phone Auth Service
**File:** `/apps/mobile/lib/auth.tsx`

**Methods Implemented:**
```typescript
class AuthService {
  // Send SMS verification code
  static async sendPhoneVerification(phoneNumber: string): Promise<ConfirmationResult>

  // Verify SMS code and sign in
  static async verifyPhoneCode(confirmation: ConfirmationResult, code: string): Promise<{user: User}>

  // Complete signup with profile
  static async signUpWithPhone(credentials: PhoneSignupFormData): Promise<{user: User}>

  // Sign in existing user
  static async signInWithPhone(credentials: PhoneLoginFormData): Promise<{user: User}>
}
```

**Features:**
- Automatic phone number formatting (`05X` → `+972X`)
- Comprehensive error handling (quota exceeded, invalid code, etc.)
- Firestore profile creation with `role: 'trainee'` and `authMethod: 'phone'`
- Consistency check: Deletes Firebase Auth user if Firestore creation fails

#### 4. Phone Auth UI Component
**File:** `/apps/mobile/components/auth/PhoneAuthScreen.tsx`

**Flow:**
1. **Step 1: Phone Input**
   - Auto-formatted input: `05X-XXX-XXXX`
   - Validation before sending SMS
   - "Sign in with Email instead" fallback option

2. **Step 2: SMS Verification**
   - 6-digit code input
   - Auto-submit on completion
   - Resend code option
   - Clear error messages

3. **Step 3: Profile Creation**
   - First name and last name
   - Automatic Firestore user document creation
   - Role assignment (`trainee`)

### 🚧 In Progress / Remaining Work

#### 5. Web Trainee Invitation Form
**File to Update:** `/fitness-platform-web-standalone/src/app/trainees/page.tsx`

**Required Changes:**
- Add phone number field (primary)
- Make email optional (fallback)
- Update form validation to use new schema
- Show phone number in trainee list

#### 6. Trainee Service Updates
**File:** `/fitness-platform-web-standalone/src/lib/traineeService.ts`

**Required Changes:**
```typescript
// Update queries to support phone as primary identifier
static async getTraineeByPhone(trainerId: string, phoneNumber: string): Promise<Trainee | null>

// Update invitation creation to use phone
static async inviteTrainee(trainerId: string, invitationData: TraineeInvitationFormData)
// Should create invitation with phoneNumber (required) and email (optional)
```

#### 7. SMS Invitation Service
**File to Create:** `/fitness-platform-web-standalone/src/app/api/sms/invite/route.ts`

**Implementation:**
- Use Firebase Functions or Twilio for SMS sending
- Send deep link: `ryzup://invite?token=XXX&phone=05XXXXXXXX`
- Fallback to email if SMS fails
- Development mode: Console log only

#### 8. Firebase Configuration
**Manual Steps Required:**

1. **Enable Phone Authentication**
   ```
   Firebase Console → Authentication → Sign-in method → Phone → Enable
   ```

2. **Configure SMS Region Policy** (Optional but recommended)
   ```
   Firebase Console → Authentication → Settings → SMS Region Policy
   - Allow: Israel (+972)
   - Block: All other countries (to prevent abuse)
   ```

3. **Add Test Phone Numbers** (Development)
   ```
   Firebase Console → Authentication → Phone numbers for testing
   - Add: 0501234567 → Code: 123456
   - Add: 0501234568 → Code: 654321
   ```

4. **Configure SHA-256 Fingerprint** (For Play Integrity)
   ```
   Firebase Console → Project Settings → Your apps → Android app
   - Add SHA-256 from keystore
   ```

## Phone Number Format

### Input Format (User-facing)
```
05X-XXX-XXXX
Example: 050-123-4567
```

### Storage Format (Firestore)
```
05XXXXXXXX
Example: 0501234567
```

### Firebase Auth Format (International)
```
+972XXXXXXXXX
Example: +972501234567
```

### Auto-Formatting Logic
```typescript
// Remove leading 0, add +972
const formattedPhone = phoneNumber.startsWith('+972')
  ? phoneNumber
  : `+972${phoneNumber.substring(1)}`;
```

## Data Model Changes

### User Collection (`users/{uid}`)
```typescript
{
  uid: string;
  email: string | null;          // Optional for phone auth
  phoneNumber: string | null;    // Required for trainees
  authMethod: 'phone' | 'email' | 'google';
  role: 'trainer' | 'trainee' | 'admin';
  // ... other fields
}
```

### Trainee Collection (`trainees/{traineeId}`)
```typescript
{
  id: string;
  trainerId: string;
  userId?: string;               // Links to users collection
  phoneNumber: string;           // PRIMARY IDENTIFIER
  email?: string;                // FALLBACK
  firstName: string;
  lastName: string;
  authMethod: 'phone' | 'email' | 'google';
  status: 'pending' | 'active' | 'inactive';
  // ... other fields
}
```

### Trainee Invitations (`trainee_invitations/{invitationId}`)
```typescript
{
  id: string;
  trainerId: string;
  phoneNumber: string;           // PRIMARY CONTACT
  email?: string;                // FALLBACK CONTACT
  inviteToken: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;            // 7 days from creation
  // ... other fields
}
```

## Error Handling

### Common Errors
```typescript
'auth/invalid-phone-number'     → "Invalid phone number format"
'auth/too-many-requests'        → "Too many requests. Try again later"
'auth/quota-exceeded'           → "SMS quota exceeded"
'auth/invalid-verification-code' → "Invalid code. Check and try again"
'auth/code-expired'             → "Code expired. Request new one"
'auth/session-expired'          → "Session expired. Start over"
```

## Testing Strategy

### Development Testing
1. **Use Test Phone Numbers** (No real SMS sent)
   - Configure in Firebase Console
   - Fixed verification codes
   - Fast iteration

2. **Real Device Testing** (Required for production)
   - Firebase phone auth doesn't work on emulators
   - Need physical Android device
   - Or use test phone numbers

### Test Flow
```bash
# 1. Enter test phone number
05XXXXXXXX

# 2. Automatic code (from Firebase test config)
123456

# 3. Profile creation
First Name: Test
Last Name: User

# 4. Verify Firestore
- Check users/{uid} has role='trainee' and authMethod='phone'
- Check phoneNumber is stored correctly
```

## Security Considerations

### SMS Abuse Prevention
1. **Rate Limiting** - Firebase enforces SMS quota per phone number
2. **Region Locking** - Restrict to Israel only (+972)
3. **reCAPTCHA** - Fallback if Play Integrity fails
4. **Monitoring** - Watch Firebase usage dashboard for abuse

### Data Privacy
- Phone numbers are hashed in Firebase Auth
- Stored in plain text in Firestore (for trainee management)
- GDPR compliance: Users can request deletion

## Next Steps (Priority Order)

1. **Update Trainee Invitation Modal** (Web)
   - Add phone number field
   - Make email optional
   - Update validation

2. **Implement SMS Service**
   - Create API route `/api/sms/invite`
   - Integrate SMS provider (Twilio or Firebase)
   - Handle errors gracefully

3. **Update TraineeService**
   - Support phone-based queries
   - Update invitation logic
   - Migration script for existing data

4. **Firebase Console Configuration**
   - Enable phone auth
   - Add test numbers
   - Configure region policy

5. **End-to-End Testing**
   - Test complete signup flow
   - Test fallback to email
   - Test invitation flow

6. **Data Migration** (Before production launch)
   - Wipe existing test data
   - Fresh start with phone auth
   - Document migration steps

## References

- **Firebase Phone Auth Docs:** https://firebase.google.com/docs/auth/android/phone-auth
- **React Native Firebase:** https://rnfirebase.io/auth/phone-auth
- **Israeli Phone Format:** Ministry of Communications standards

---

**For implementation questions, see code comments in:**
- `/apps/mobile/lib/auth.tsx` (Phone auth service)
- `/apps/mobile/components/auth/PhoneAuthScreen.tsx` (UI component)
- `/packages/shared-types/src/auth/schemas.ts` (Validation schemas)
