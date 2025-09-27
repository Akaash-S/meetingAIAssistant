# 🔐 Authentication Testing Guide

This guide will help you test the Firebase Authentication implementation and verify that redirections work correctly.

## 🧪 Testing Steps

### 1. **Setup Environment**
```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your Firebase config
```

### 2. **Start Development Server**
```bash
npm run dev
```

### 3. **Test Authentication Flow**

#### **Step 1: Test Sign Up**
1. Open `http://localhost:8080`
2. Click "Get Started" button
3. Fill in the signup form:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: password123
   - **Confirm Password**: password123
4. Click "Create Account"
5. **Expected**: Modal closes and redirects to `/dashboard`

#### **Step 2: Test Sign In**
1. Click "Sign In" button
2. Fill in the login form:
   - **Email**: test@example.com
   - **Password**: password123
3. Click "Sign In"
4. **Expected**: Modal closes and redirects to `/dashboard`

#### **Step 3: Test Protected Routes**
1. Try accessing `/dashboard` directly
2. **Expected**: If not authenticated, redirects to `/`
3. **Expected**: If authenticated, shows dashboard

#### **Step 4: Test Logout**
1. Click user menu in navbar
2. Click "Sign Out"
3. **Expected**: Redirects to `/` and shows sign in buttons

### 4. **Debug Authentication Issues**

#### **Check Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Authentication > Users**
3. Verify your test user appears

#### **Check Browser Console**
1. Open Developer Tools (F12)
2. Check for any error messages
3. Look for Firebase auth state changes

#### **Check Network Tab**
1. Open Developer Tools > Network
2. Look for Firebase API calls
3. Verify authentication requests

### 5. **Test Development Tools**

#### **Auth Test Component**
- Visit `http://localhost:8080/auth-test`
- Shows current user information
- Provides test buttons for navigation

#### **Auth Test on Landing**
- Scroll down on landing page
- See "Auth Test (Dev Only)" section
- Test authentication state

## 🐛 Common Issues & Solutions

### **Issue 1: "Firebase: Error (auth/invalid-api-key)"**
**Solution**: Check your Firebase API key in `.env`
```env
VITE_FIREBASE_API_KEY=your-correct-api-key
```

### **Issue 2: "Firebase: Error (auth/domain-not-authorized)"**
**Solution**: Add your domain to Firebase Auth settings
1. Go to Firebase Console > Authentication > Settings
2. Add `localhost:8080` to authorized domains

### **Issue 3: "Firebase: Error (auth/email-already-in-use)"**
**Solution**: User already exists, use "Sign In" instead

### **Issue 4: "Firebase: Error (auth/weak-password)"**
**Solution**: Use password with at least 6 characters

### **Issue 5: No redirect after authentication**
**Solution**: Check if `redirectToDashboard` is called
1. Check browser console for errors
2. Verify Firebase auth state changes
3. Check if `onAuthStateChanged` is working

### **Issue 6: "Cannot read property 'navigate' of undefined"**
**Solution**: `useNavigate` must be used within Router context
1. Verify `BrowserRouter` wraps the app
2. Check if `AuthProvider` is inside `BrowserRouter`

## 🔍 Debugging Commands

### **Check Authentication State**
```javascript
// In browser console
import { auth } from './src/lib/firebase';
console.log('Current user:', auth.currentUser);
```

### **Check Firebase Config**
```javascript
// In browser console
console.log('Firebase config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});
```

### **Test Navigation**
```javascript
// In browser console
import { useNavigate } from 'react-router-dom';
// This should work in components, not in console
```

## ✅ Success Criteria

### **Authentication Works When:**
- ✅ User can sign up with email/password
- ✅ User can sign in with existing credentials
- ✅ User is redirected to dashboard after auth
- ✅ Protected routes require authentication
- ✅ User can sign out and is redirected to home
- ✅ Auth state persists across page refreshes
- ✅ No console errors during auth flow

### **UI Works When:**
- ✅ Auth modals open and close properly
- ✅ Form validation works (password confirmation, email format)
- ✅ Loading states show during auth operations
- ✅ Error messages display for auth failures
- ✅ User menu shows when authenticated
- ✅ Sign in/up buttons show when not authenticated

## 🚀 Production Checklist

Before deploying to production:

- [ ] Remove `AuthTest` component from landing page
- [ ] Remove `/auth-test` route
- [ ] Update Firebase authorized domains for production
- [ ] Test with production Firebase project
- [ ] Verify all environment variables are set
- [ ] Test on different browsers and devices
- [ ] Verify HTTPS is working (required for Firebase Auth)

## 🎯 Next Steps

After successful authentication testing:

1. **Customize UI** - Update colors, fonts, and styling
2. **Add Social Login** - Google, GitHub, etc.
3. **Email Verification** - Send verification emails
4. **Password Reset** - Forgot password functionality
5. **User Profiles** - Extended user information
6. **Backend Integration** - Connect with your Flask API

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify Firebase configuration
3. Test with a fresh browser session
4. Check Firebase Console for user creation
5. Verify all environment variables are set correctly

The authentication system should now work seamlessly! 🎉
