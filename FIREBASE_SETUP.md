# 🔥 Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your MeetingAI frontend.

## 📋 Prerequisites

1. **Google Account** - Required for Firebase Console access
2. **Firebase Project** - Create one at [console.firebase.google.com](https://console.firebase.google.com)

## 🚀 Step 1: Create Firebase Project

### 1.1 Create New Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `meeting-ai-app`
4. Enable Google Analytics (optional)
5. Choose Analytics account (optional)
6. Click "Create project"

### 1.2 Enable Authentication
1. In your Firebase project, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

## 🔧 Step 2: Configure Frontend

### 2.1 Get Firebase Config
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Register app with name: `meeting-ai-frontend`
5. Copy the config object

### 2.2 Update Environment Variables
1. Copy `env.example` to `.env`:
```bash
cp env.example .env
```

2. Update `.env` with your Firebase config:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Step 3: Test Authentication

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Test Sign Up
1. Open `http://localhost:8080`
2. Click "Get Started" button
3. Fill in the signup form
4. Check Firebase Console > Authentication > Users

### 3.3 Test Sign In
1. Click "Sign In" button
2. Use the credentials you just created
3. Verify you're redirected to dashboard

## 🔒 Step 4: Security Rules (Optional)

### 4.1 Firestore Rules (if using Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4.2 Storage Rules (if using Firebase Storage)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎯 Features Implemented

### ✅ Authentication Features
- **Email/Password Sign Up** - New user registration
- **Email/Password Sign In** - Existing user login
- **Automatic Sign Out** - Session management
- **Protected Routes** - Route protection based on auth state
- **User Profile** - Display user name and email

### ✅ UI Components
- **LoginForm** - Sign in modal with email/password
- **SignupForm** - Registration modal with validation
- **AuthModal** - Modal wrapper for auth forms
- **Updated Navbar** - Auth buttons and user menu
- **Updated Landing** - Auth integration

### ✅ Backend Integration
- **API Service** - Firebase token-based API calls
- **Automatic Headers** - JWT tokens in API requests
- **Error Handling** - Proper error management

## 🔧 Configuration Options

### Environment Variables
```env
# Required Firebase Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Optional
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_API_URL=http://localhost:5000/api
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Firebase: Error (auth/invalid-api-key)"
- **Solution**: Check your `VITE_FIREBASE_API_KEY` in `.env`
- **Fix**: Copy the correct API key from Firebase Console

#### 2. "Firebase: Error (auth/domain-not-authorized)"
- **Solution**: Add your domain to Firebase Auth settings
- **Fix**: Go to Authentication > Settings > Authorized domains

#### 3. "Firebase: Error (auth/email-already-in-use)"
- **Solution**: User already exists
- **Fix**: Use "Sign In" instead of "Sign Up"

#### 4. "Firebase: Error (auth/weak-password)"
- **Solution**: Password too weak
- **Fix**: Use password with at least 6 characters

### Debug Mode
Enable Firebase debug mode in development:
```javascript
// In your browser console
localStorage.setItem('firebase:debug', '*');
```

## 📚 Next Steps

1. **Customize UI** - Update colors, fonts, and styling
2. **Add Social Login** - Google, GitHub, etc.
3. **Email Verification** - Send verification emails
4. **Password Reset** - Forgot password functionality
5. **User Profiles** - Extended user information

## 🎉 Success!

Your Firebase Authentication is now fully integrated! Users can:
- ✅ Sign up with email/password
- ✅ Sign in to their accounts
- ✅ Access protected routes
- ✅ Make authenticated API calls
- ✅ Sign out securely

The authentication system is production-ready and secure! 🚀
