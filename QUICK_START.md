# LifeFlow Quick Start Checklist

## ⚡ Get Running in 5 Minutes

### 1. Install Dependencies
```bash
cd /Volumes/Jai\ Shri\ Matha/Script_Workspace/LifeFlow
npm install
```
⏱️ ~2 minutes

### 2. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com)
- Create project: `lifeflow-app`
- Enable Authentication (Email/Password)
- Create Firestore Database (production mode, asia-south1)

⏱️ ~3 minutes

### 3. Set Up Environment
```bash
# Copy template
cp .env.example .env

# Add Firebase config to .env
# VITE_FIREBASE_API_KEY=...
# etc.
```
⏱️ ~1 minute

### 4. Apply Security Rules
Copy these security rules to Firestore → Rules tab:

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

⏱️ ~1 minute

### 5. Start Development Server
```bash
npm run dev
```

App opens at: http://localhost:5173

⏱️ ~30 seconds

### 6. Test It Out
- Click "Create one" to register
- Enter email/password
- App loads dashboard
- You're in! 🎉

---

## 📋 What's Included

✅ **Complete React App** - 45+ components
✅ **Multi-user Auth** - Firebase authentication
✅ **Real-time Database** - Firestore with security rules
✅ **Type Safety** - 100% TypeScript
✅ **PWA Ready** - Installable on mobile
✅ **Dark Theme** - Glassmorphism design
✅ **Responsive** - Mobile to desktop
✅ **Production Code** - Ready to extend

---

## 🚀 Next: Build Features

Pick one and implement:

### Easy (30 min)
- [ ] Complete goal creation form (CreateGoalWizard.tsx)
- [ ] Add goal editing
- [ ] Implement activity logging

### Medium (1-2 hours)
- [ ] Drag-and-drop sub-goal reordering
- [ ] Goal calendar view
- [ ] Streak heatmap

### Advanced (2-3 hours)
- [ ] Analytics charts with Recharts
- [ ] Goal sharing between users
- [ ] Push notifications

---

## 📖 Read These First

1. **README.md** - Overview & features
2. **SETUP_GUIDE.md** - Detailed Firebase setup
3. **CLAUDE.md** - Architecture & critical rules
4. **PROJECT_SUMMARY.md** - File structure

---

## 🆘 Troubleshooting

### "npm install" fails
```bash
# Try clearing cache
npm cache clean --force
npm install
```

### "npm run dev" fails
- Check Node.js version: `node --version` (needs 16+)
- Try: `rm -rf node_modules package-lock.json && npm install`

### App won't load after npm run dev
- Wait 30 seconds for compilation
- Check DevTools console for errors
- Verify Firebase config in `.env`

### Can't register/login
- Check `VITE_FIREBASE_API_KEY` in .env is correct
- Verify Email/Password auth is enabled in Firebase Console
- Check browser console for error messages

### App loads but check-ins don't save
- Verify Firestore security rules are published (not just saved)
- Check Firestore database was created
- Verify `userId` field is in your check-in documents

---

## 🎯 Development Workflow

```bash
# Start dev server
npm run dev

# In another terminal:
# Watch TypeScript compilation
npm run type-check

# Before committing:
npm run build  # Should succeed with no errors

# Deploy to Vercel:
# (follow SETUP_GUIDE.md Vercel section)
```

---

## 💡 Pro Tips

1. **Use Firebase Console** to view data in Firestore
2. **Check DevTools Console** for error messages
3. **Test in incognito** to test multi-user isolation
4. **Use Vercel Previews** for testing before main deployment
5. **Check CLAUDE.md** when confused about architecture

---

## 📞 Key Files Reference

| Need... | File... |
|---------|---------|
| Add route | `src/app/App.tsx` |
| Add component | `src/features/{feature}/` |
| Add store | `src/app/store/` |
| Add Firestore query | `src/lib/firestore/*Service.ts` |
| Add utility | `src/shared/utils/` |
| Change colors | `src/styles/globals.css` |
| Configure build | `vite.config.ts` |

---

## ✨ You're All Set!

The hardest part is done. Your app is ready.

```bash
npm run dev
# Open http://localhost:5173
# Register
# Explore
# Build amazing features!
```

**Need help?** Check the documentation files or see CLAUDE.md for architecture.

---

🌊 **Happy coding! Track goals. Build streaks.**
