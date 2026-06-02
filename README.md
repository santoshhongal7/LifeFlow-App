# LifeFlow — Progressive Web App Goal Tracker

A modern, multi-user Progressive Web App (PWA) for tracking personal goals, building streaks, and managing daily activities. Built with React, Firebase, and Tailwind CSS.

## 🎯 Features

- **Multi-User Support**: Complete user isolation with Firebase Authentication
- **Hierarchical Goal System**: Main goals with multiple sub-goals/tasks
- **Daily Check-ins**: Mark progress on sub-goals each day
- **Streak Tracking**: Build and maintain streaks across goals
- **Activity Logging**: Track custom activities and metrics
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Offline Support**: PWA installable on Android and iOS
- **Real-time Sync**: Firestore keeps data in sync across devices
- **Dark Theme**: Beautiful glassmorphism UI design

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 + Custom CSS
- **State Management**: Zustand
- **Backend/Database**: Firebase (Auth + Firestore)
- **Deployment**: Vercel
- **PWA**: Workbox via vite-plugin-pwa
- **UI Components**: Lucide React, Recharts, Framer Motion
- **Drag & Drop**: @dnd-kit/sortable

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd LifeFlow
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with Firebase credentials:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start development server:
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── app/
│   ├── App.tsx              # Main app component with routing
│   └── store/               # Zustand stores (auth, goals, check-ins, etc.)
├── features/
│   ├── auth/                # Authentication pages (login, register)
│   ├── dashboard/           # Dashboard with goal overview
│   ├── goals/               # Goal creation, editing, details
│   ├── checkin/             # Daily check-in interface
│   ├── streaks/             # Streak visualization
│   ├── activities/          # Activity logging
│   ├── diet/                # Diet tracking
│   ├── analytics/           # Analytics & insights
│   └── settings/            # User settings & profile
├── lib/
│   ├── firebase.ts          # Firebase initialization
│   ├── auth/                # Authentication services
│   └── firestore/           # Firestore data services
├── shared/
│   ├── components/          # Reusable components
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript type definitions
└── styles/
    └── globals.css          # Global styles & CSS variables
```

## 🔐 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project named "lifeflow-app"
3. Enable Google Analytics (optional)

### 2. Enable Authentication

1. Go to Build → Authentication
2. Enable "Email/Password" sign-in method

### 3. Create Firestore Database

1. Go to Build → Firestore Database
2. Start in production mode
3. Select region: asia-south1 (Mumbai)

### 4. Set Security Rules

Go to Firestore → Rules and paste:

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

### 5. Create Composite Indexes

Go to Firestore → Indexes and create:

```
Collection: goals
  Fields: userId ASC, createdAt DESC

Collection: checkIns
  Fields: userId ASC, goalId ASC, date DESC

Collection: checkIns
  Fields: userId ASC, date DESC

Collection: activities
  Fields: userId ASC, createdAt DESC

Collection: activityLogs
  Fields: userId ASC, activityId ASC, date DESC
```

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial LifeFlow setup"
git remote add origin https://github.com/YOUR_USERNAME/lifeflow-app.git
git push -u origin main
```

2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repo
4. Add environment variables
5. Deploy!

### Add Vercel URL to Firebase

1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel URL to "Authorized domains"

## 📱 Mobile App Installation

### Android
1. Open the site in Chrome
2. Menu → Install app

### iOS
1. Open in Safari
2. Share → Add to Home Screen

## 🎨 Customization

### Colors
Edit `src/styles/globals.css` CSS variables:
```css
:root {
  --grad-fitness: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  /* More colors... */
}
```

### Fonts
Google Fonts are loaded in `index.html`. Change in `tailwind.config.js`.

## 📖 User Guide

### Creating a Goal

1. Click "New Goal" on Goals page
2. Follow 5-step wizard:
   - Step 1: Goal identity (title, emoji, category)
   - Step 2: Duration (number of days)
   - Step 3: Sub-goals (add tasks)
   - Step 4: Completion rules (all/any/percentage)
   - Step 5: Review and create

### Daily Check-in

1. Go to "Checkin" tab
2. Select a goal
3. Mark sub-goals as Done/Missed
4. Submit

### Viewing Streaks

1. Go to "Streaks" tab
2. See longest streak and current streak
3. Milestones unlocked

## 🔄 State Management

Uses Zustand for state:
- `authStore`: User authentication
- `goalStore`: Goals and sub-goals
- `checkInStore`: Daily check-ins
- `activityStore`: Custom activities
- `settingsStore`: User preferences

All data synced real-time with Firestore.

## ✅ Quality Checklist

- [x] User authentication (register/login)
- [x] Multi-user isolation with Firestore rules
- [x] Goal CRUD operations
- [x] Daily check-in system
- [x] Streak calculations
- [x] Responsive design
- [x] PWA installable
- [x] Offline support
- [x] Dark theme
- [x] Settings/profile page
- [ ] Analytics charts
- [ ] Activity logging fully implemented
- [ ] Diet tracking
- [ ] Push notifications

## 🐛 Troubleshooting

### Firebase credentials not working
- Verify `.env` file has all 6 Firebase keys
- Check Firebase project is enabled
- Ensure Vercel env vars are set

### Check-ins not showing
- Verify Firestore security rules are correct
- Check Firebase indexes are created
- Ensure userId matches auth user

### Offline not working
- Check service worker is registered
- Verify `vite-plugin-pwa` is configured
- Test in private/incognito mode

## 📝 License

MIT License - feel free to use for personal projects

## 🤝 Contributing

Contributions welcome! Please create a pull request with your changes.

---

**Track goals. Build streaks. Become who you want to be.** 🌊
