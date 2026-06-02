# Running LifeFlow Locally - Complete Guide

## Prerequisites Check

```bash
# Check Node.js version (need 16+)
node --version

# Check npm version (need 8+)
npm --version
```

If not installed, download from https://nodejs.org

---

## Step 1: Open Terminal in Project Folder

**On Mac/Linux:**
```bash
cd /Volumes/Jai\ Shri\ Matha/Script_Workspace/LifeFlow
```

**On Windows:**
```bash
cd C:\Path\To\Script_Workspace\LifeFlow
```

Verify you're in right folder:
```bash
ls  # Should see: package.json, src/, index.html, etc.
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will:
- Download all packages from npm
- Takes 2-3 minutes
- Creates `node_modules/` folder (~500MB)

**Output should end with:**
```
added XXX packages in XXs
```

---

## Step 3: Create Firebase Project

### Quick Steps:

1. Open https://console.firebase.google.com
2. Click "Add Project"
3. Name: `lifeflow-app`
4. Uncheck Google Analytics
5. Click "Create project"
6. Wait for creation...

### Enable Authentication:
1. Left menu → "Build" → "Authentication"
2. Click "Get started"
3. Select "Email/Password"
4. Click toggle to enable
5. Click "Save"

### Create Firestore Database:
1. Left menu → "Build" → "Firestore Database"
2. Click "Create database"
3. Region: Select **asia-south1 (Mumbai)**
4. Mode: **Start in production mode**
5. Click "Create"

---

## Step 4: Get Firebase Configuration

1. Click gear icon ⚙️ (top-left) → "Project settings"
2. Scroll down to "Your apps" section
3. Click Web icon `</>`
4. App nickname: `lifeflow-web`
5. Check "Also set up Firebase Hosting for..."
6. Click "Register app"
7. **Copy the entire config** shown on screen

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "lifeflow-app.firebaseapp.com",
  projectId: "lifeflow-app",
  storageBucket: "lifeflow-app.appspot.com",
  messagingSenderId: "12345...",
  appId: "1:12345..."
};
```

---

## Step 5: Create .env File

In your LifeFlow project folder, create a new file named `.env`:

**Mac/Linux:**
```bash
touch .env
```

**Windows:**
Right-click → New File → Name it `.env`

---

## Step 6: Add Firebase Config to .env

Open the `.env` file and paste:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=lifeflow-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lifeflow-app
VITE_FIREBASE_STORAGE_BUCKET=lifeflow-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID_HERE
VITE_FIREBASE_APP_ID=YOUR_APP_ID_HERE
```

Replace the values from Firebase config in Step 4:
- `YOUR_API_KEY_HERE` → Copy `apiKey` value
- `YOUR_SENDER_ID_HERE` → Copy `messagingSenderId` value
- `YOUR_APP_ID_HERE` → Copy `appId` value

**Save the file!**

---

## Step 7: Apply Security Rules to Firestore

1. Go to Firebase Console → Firestore Database
2. Click "Rules" tab (not "Data" tab)
3. Replace **ALL** the content with this:

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

4. Click **"Publish"** button (blue button, top-right)
5. Confirm in the dialog

---

## Step 8: Start Development Server

In your terminal (in the LifeFlow folder):

```bash
npm run dev
```

**You should see:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**The app opens automatically in your browser!**

If it doesn't open:
- Open http://localhost:5173 manually in your browser

---

## Step 9: Test the App

### Register a New Account:

1. Click **"Create one"** link
2. Fill in:
   - **Your name**: (anything)
   - **Email**: test@example.com
   - **Password**: password123 (min 8 chars)
   - **Confirm Password**: password123
3. Click **"Create Account"**

### You should see:
- Dashboard with message "No active goals"
- Navigation bar at bottom
- "New Goal" button

### Try creating a goal:
1. Click "New Goal"
2. Enter goal name: "Test Goal"
3. Click around to explore the interface

---

## ✅ Success Checklist

- [ ] `npm install` completed without errors
- [ ] `.env` file created with 6 Firebase values
- [ ] Firebase Firestore rules published
- [ ] `npm run dev` running without errors
- [ ] Browser opened to http://localhost:5173
- [ ] Can register new account
- [ ] Can see dashboard after login

If all ✅, **you're ready to develop!**

---

## Useful Commands

```bash
# Start development server (keeps running)
npm run dev

# Stop dev server
# Press Ctrl+C in terminal

# Check for TypeScript errors
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Install new packages
npm install package-name
```

---

## Troubleshooting

### "npm install" fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove old files
rm -rf node_modules package-lock.json

# Try again
npm install
```

### "Port 5173 is already in use"

**Solution:**
```bash
# Use different port
npm run dev -- --port 3000

# Then open: http://localhost:3000
```

### App opens but shows "Cannot find module"

**Solution:**
1. Stop dev server (Ctrl+C)
2. Delete `node_modules/` folder
3. Run `npm install` again
4. Run `npm run dev`

### "Firebase initialization failed"

**Solution:**
1. Check `.env` file exists
2. Verify all 6 values are correct
3. Make sure no quotes in values:
   - ✅ `VITE_FIREBASE_API_KEY=AIzaSyD...`
   - ❌ `VITE_FIREBASE_API_KEY="AIzaSyD..."`
4. Restart dev server (Ctrl+C, then `npm run dev`)

### Can't register/login

**Solution:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Firebase Console that Authentication is enabled
5. Verify `.env` values are correct

### "Too many build errors"

**Solution:**
```bash
# Clear everything and restart
npm cache clean --force
rm -rf node_modules dist
npm install
npm run dev
```

---

## File Editing During Development

The dev server watches files automatically. When you save:
- Browser automatically refreshes
- No need to restart dev server
- Changes appear instantly

**Files to edit:**
- `src/features/` - Page components
- `src/shared/components/` - Reusable components
- `src/shared/utils/` - Utility functions
- `src/styles/globals.css` - Styling

---

## Project Structure for Reference

```
LifeFlow/
├── .env                 ← Your Firebase config (CREATED)
├── src/
│   ├── app/
│   │   ├── App.tsx     ← Main app
│   │   └── store/      ← State management
│   ├── features/       ← Page components
│   ├── lib/            ← Firebase services
│   ├── shared/         ← Reusable code
│   └── styles/         ← CSS
├── index.html          ← HTML entry
├── vite.config.ts      ← Vite config
├── package.json        ← Dependencies
└── README.md           ← Documentation
```

---

## Next Steps After Running

1. **Explore the app** - Click around, understand flow
2. **Read CLAUDE.md** - Understand architecture
3. **Pick a feature** - Start implementing
4. **Check examples** - Look at LoginPage.tsx for patterns
5. **Build something** - You're ready!

---

## Keep Dev Server Running

Best practice:
1. Keep terminal open with `npm run dev` running
2. Open code editor in another window
3. Edit files, save, browser updates automatically
4. Check browser console for errors

---

## Getting Help

- **Setup issues**: Check troubleshooting above
- **Architecture**: See CLAUDE.md
- **Firebase issues**: Check Firebase Console logs
- **Browser errors**: Open DevTools (F12) → Console tab

---

🌊 **You're ready to build awesome features!**

Start with the dashboard, then explore other pages.
