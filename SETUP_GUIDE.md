# LifeFlow Setup Guide

Complete step-by-step guide to set up and deploy LifeFlow.

## Table of Contents

1. [Firebase Setup](#firebase-setup)
2. [Local Development](#local-development)
3. [Vercel Deployment](#vercel-deployment)
4. [Testing](#testing)

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Project name: `lifeflow-app`
4. Uncheck "Enable Google Analytics"
5. Click "Create project"
6. Wait for creation to complete

### Step 2: Enable Authentication

1. Left sidebar → "Build" → "Authentication"
2. Click "Get started"
3. Sign-in method: "Email/Password"
4. Enable "Email/Password"
5. Click "Save"

### Step 3: Create Firestore Database

1. Left sidebar → "Build" → "Firestore Database"
2. Click "Create database"
3. Location: Select "asia-south1 (Mumbai)"
4. Security rules: "Start in production mode"
5. Click "Create"

### Step 4: Set Security Rules

1. Go to Firestore → "Rules" tab
2. Replace all content with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /goals/{goalId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    match /checkIns/{checkInId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    match /activities/{activityId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    match /activityLogs/{logId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click "Publish"

### Step 5: Create Composite Indexes

1. Go to Firestore → "Indexes" tab
2. Click "Create Index" for each:

**Index 1:**
- Collection: `goals`
- Field 1: `userId` - Ascending
- Field 2: `createdAt` - Descending
- Collection scope: Collection

**Index 2:**
- Collection: `checkIns`
- Field 1: `userId` - Ascending
- Field 2: `goalId` - Ascending
- Field 3: `date` - Descending
- Collection scope: Collection

**Index 3:**
- Collection: `checkIns`
- Field 1: `userId` - Ascending
- Field 2: `date` - Descending
- Collection scope: Collection

**Index 4:**
- Collection: `activities`
- Field 1: `userId` - Ascending
- Field 2: `createdAt` - Descending
- Collection scope: Collection

**Index 5:**
- Collection: `activityLogs`
- Field 1: `userId` - Ascending
- Field 2: `activityId` - Ascending
- Field 3: `date` - Descending
- Collection scope: Collection

### Step 6: Get Firebase Config

1. Click the gear icon (⚙️) → "Project settings"
2. Scroll to "Your apps" section
3. Click the Web icon `</>`
4. App name: `lifeflow-web`
5. Check "Also set up Firebase Hosting"
6. Click "Register app"
7. Copy the config object shown:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## Local Development

### Step 1: Clone and Setup

```bash
# Navigate to your projects folder
cd /Volumes/Jai\ Shri\ Matha/Script_Workspace

# Clone or extract LifeFlow
# If you have the code already, navigate to it
cd LifeFlow

# Install dependencies
npm install
```

### Step 2: Create Environment File

1. Create `.env` file in project root:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=lifeflow-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lifeflow-app
VITE_FIREBASE_STORAGE_BUCKET=lifeflow-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

2. Replace `YOUR_*` values from Firebase config in Step 6 above

3. **IMPORTANT**: Never commit `.env` file!

### Step 3: Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 4: Test Locally

1. Register a new account
2. Create a goal
3. Check in on the goal
4. Verify data appears in Firestore Console

---

## Vercel Deployment

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial LifeFlow setup"

# Create GitHub repo at github.com/YOUR_USERNAME/lifeflow-app

# Connect remote
git remote add origin https://github.com/YOUR_USERNAME/lifeflow-app.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub (if not already)
3. Click "Add New Project"
4. Select `lifeflow-app` repository
5. Framework Preset: **Vite**
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Click "Environment Variables"
9. Add all 6 Firebase variables from `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
10. Click "Deploy"

### Step 3: Add Vercel URL to Firebase

1. Wait for Vercel deployment to complete
2. Copy the deployment URL (usually `https://lifeflow-app.vercel.app`)
3. Go to Firebase Console → Authentication → Settings
4. Scroll to "Authorized domains"
5. Click "Add domain"
6. Paste your Vercel URL (without `https://`)
7. Click "Add"

### Step 4: Test Production

1. Open your Vercel URL
2. Register a new account
3. Create a goal
4. Test all features
5. Verify data in Firestore

---

## Testing

### Pre-Deployment Checklist

- [ ] `.env.example` is complete
- [ ] `.env` is in `.gitignore`
- [ ] `npm run build` succeeds with zero errors
- [ ] TypeScript: `npm run type-check` has zero errors
- [ ] Can register new user
- [ ] Can login with email/password
- [ ] Can create a goal
- [ ] Can perform daily check-in
- [ ] Can logout and login again
- [ ] Goal data persists
- [ ] User A cannot see User B data (test in incognito window)

### Testing Multi-User Isolation

1. Open two browser windows (or use incognito)
2. In Window 1: Register as user1@example.com
3. In Window 2: Register as user2@example.com
4. In Window 1: Create a goal
5. In Window 2: Refresh - goal should NOT be visible
6. This confirms Firestore security rules are working

### Testing Offline

1. Open DevTools (F12)
2. Go to "Network" tab
3. Check "Offline"
4. App should still be usable (cached data)
5. Go back online
6. Data should sync

### Testing PWA Installation

**Android:**
1. Open Chrome
2. Menu → "Install app"
3. App installs to home screen
4. Opens fullscreen

**iOS:**
1. Open Safari
2. Share → "Add to Home Screen"
3. App installs to home screen

---

## Troubleshooting

### "Firebase credentials not working"

**Solution:**
- Double-check all 6 env variables are correct
- Verify `.env` file exists (not `.env.example`)
- Check Firebase Console that Auth and Firestore are enabled
- If deployed: Verify Vercel env vars are set in Project Settings

### "Check-ins not saving"

**Solution:**
- Check Firestore security rules are published
- Verify userId matches authenticated user
- Check Firestore indexes are created (may take 5-10 minutes)
- Look at Firebase Console Logs for errors

### "Cannot login after deployment"

**Solution:**
- Verify Vercel URL is added to Firebase authorized domains
- Check email/password auth is enabled in Firebase
- Try clearing browser cache and cookies
- Check Firebase Console authentication logs

### "PWA won't install"

**Solution:**
- HTTPS is required (Vercel provides this)
- Service worker must load properly
- Check DevTools → Application → Manifest
- Try different browser (Chrome/Edge work best)

### "Other users can see my data"

**CRITICAL SECURITY ISSUE:**
- This means security rules are not working
- Check Firestore rules are correctly published
- Verify every query has `where('userId', '==', currentUser.uid)`
- Check Firestore → Rules tab shows your rules

---

## Getting Help

- Check `README.md` for feature documentation
- Check `CLAUDE.md` for architecture details
- Review Firebase error messages in console
- Check Firestore security rules syntax
- Verify all indexes are created
- Check Vercel build logs for deployment errors

---

## Next Steps

After successful setup:

1. **Customize Colors**: Edit `src/styles/globals.css`
2. **Add Features**: Implement analytics, diet tracking, etc.
3. **Notifications**: Set up Firebase Cloud Messaging
4. **Sharing**: Add goal sharing between users
5. **Exports**: Add CSV/PDF export of goals and streaks

---

**Remember: Every Firebase API call must have userId filter. Security rules enforce this!**
