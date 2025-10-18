# Google Play Testing Guide - Ryzup Fitness App

## For Internal Testers

Thank you for helping test the Ryzup Fitness mobile app!

---

## Test Account Credentials

**Email:** `test@ryzup.me`
**Password:** `[Password provided separately]`

⚠️ **Keep these credentials confidential** - they are for testing purposes only.

---

## Installation Steps

### Option 1: Google Play Store (Internal Testing)

1. You should have received an invitation email from Google Play Console
2. Click the invitation link in the email
3. Accept the invitation to become an internal tester
4. Visit the Google Play Store link provided
5. Install "Ryzup Fitness" app

### Option 2: Direct APK Installation (if provided)

1. Download the APK file shared with you
2. Enable "Install from Unknown Sources" on your Android device:
   - Settings → Security → Unknown Sources (Enable)
3. Open the APK file and install

---

## Testing Instructions

### 1. First Launch

1. Open the Ryzup Fitness app
2. You should see a login screen with:
   - Email field
   - Password field
   - "Sign In" button
   - "Forgot Password?" link
   - "Sign up here" link

### 2. Login Test

1. Enter the test credentials:
   - **Email:** `test@ryzup.me`
   - **Password:** `[Password provided]`
2. Tap "Sign In"
3. **Expected:** Successfully login and see the home screen

**If login fails:**
- ❌ Check that you entered the email and password correctly
- ❌ Check your internet connection
- ❌ Take a screenshot of any error messages

### 3. Home Screen

After successful login, you should see:

- **Welcome message** with your name
- **Today's stats** (workouts, calories, active minutes, streak)
- **Quick action buttons** (may be empty for new accounts)
- **Upcoming sessions** (may be empty for new accounts)
- **Navigation tabs** at the bottom

### 4. Navigation Test

Test all bottom navigation tabs:

1. **Home Tab** (🏠)
   - Should show dashboard/overview
2. **Workouts Tab** (💪)
   - Should show workout plans (may be empty)
3. **Progress Tab** (📊)
   - Should show progress tracking (may be empty)

### 5. Profile/Settings

1. Tap on your profile icon or settings
2. **Expected:** See your profile information
3. Try the logout function:
   - Tap "Sign Out"
   - Should return to login screen

---

## What to Test

### ✅ Core Functionality

- [ ] App installs successfully
- [ ] App opens without crashing
- [ ] Login works with provided credentials
- [ ] Home screen displays correctly
- [ ] All navigation tabs work
- [ ] Logout works properly
- [ ] Can login again after logout

### ✅ UI/UX Testing

- [ ] All text is readable
- [ ] Buttons are tappable and responsive
- [ ] No overlapping UI elements
- [ ] App looks good on your device screen size
- [ ] Loading indicators appear when appropriate
- [ ] Error messages are clear and helpful

### ✅ Performance

- [ ] App loads in reasonable time (< 5 seconds)
- [ ] No unexpected crashes
- [ ] Smooth scrolling and navigation
- [ ] No lag or freezing

---

## Known Limitations (Expected Behavior)

The test account is new, so you may see:

- ✅ **Empty workout lists** - This is normal for a new account
- ✅ **No progress data** - This is expected
- ✅ **No upcoming sessions** - This is normal
- ✅ **Placeholder content** - Some sections may show "No data yet"

This is **expected and correct** - we're testing that the app handles empty states properly!

---

## Reporting Issues

Please report any bugs or issues you encounter:

### 🐛 Bug Report Template

**What happened:**
[Describe the issue]

**What you expected:**
[What should have happened]

**Steps to reproduce:**
1. [First step]
2. [Second step]
3. [etc.]

**Screenshots:**
[Attach screenshots if possible]

**Device Info:**
- Device: [e.g., Samsung Galaxy S23]
- Android Version: [e.g., Android 13]
- App Version: [Shown in settings]

---

## Testing Scenarios (If Time Permits)

### Scenario 1: Complete Login Flow
1. Launch app → See login screen
2. Enter credentials → Tap Sign In
3. See home screen → Verify data loads
4. Tap Logout → Return to login
5. ✅ **Pass if:** All steps work without errors

### Scenario 2: Navigation Flow
1. Login successfully
2. Tap each bottom tab (Home, Workouts, Progress)
3. Verify each screen loads
4. Return to Home
5. ✅ **Pass if:** All screens accessible and display correctly

### Scenario 3: Stress Test
1. Login
2. Rapidly switch between tabs
3. Pull to refresh on lists
4. Scroll quickly
5. ✅ **Pass if:** No crashes, UI remains responsive

---

## Contact

If you have questions or need help:

- **Email:** avi.israeli.dev@gmail.com
- **Issues:** Report in Google Play Console testing feedback

---

## Thank You!

Your testing helps make Ryzup Fitness better for trainers and trainees worldwide.

💪 **Happy Testing!** 🎉

---

*Last Updated: 2025-10-01*
