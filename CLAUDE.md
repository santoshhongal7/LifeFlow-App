# LifeFlow — Multi-User PWA Goal Tracker

## Architecture Overview

**LifeFlow** is a hierarchical goal-tracking PWA with these core concepts:

1. **Main Goals**: 30/50/100-day challenges (e.g., "Fitness Challenge")
2. **Sub-Goals**: Daily tasks within a goal (e.g., "Run 5km", "Drink 2L water")
3. **Check-ins**: Daily progress tracking marking sub-goals Done/Missed
4. **Streaks**: Consecutive days with complete check-ins
5. **Multi-user**: Strict per-user data isolation via Firestore rules

## Tech Stack

```
Frontend:       React 18 + TypeScript + Vite
Styling:        Tailwind CSS v3 + CSS variables
State:          Zustand (in-memory cache)
Database:       Firebase Firestore (free Spark plan)
Auth:           Firebase Authentication (email/password)
Hosting:        Vercel (free Hobby plan)
PWA:            Workbox via vite-plugin-pwa
UI:             Lucide React + Recharts + Framer Motion
DnD:            @dnd-kit/sortable (sub-goal reordering)
```

## Critical Rules — NEVER BREAK THESE

1. **Every Firestore query MUST have `where('userId', '==', currentUser.uid)`**
   - Prevents cross-user data leaks
   - Enforced by security rules

2. **Never call Firestore directly from components**
   - All queries go through `src/lib/firestore/*Service.ts`
   - Keeps data layer separate and testable

3. **Zustand stores hold in-memory cache only**
   - Firestore is the source of truth
   - Real-time listeners populate the store
   - Never use localStorage for app data

4. **userId is ALWAYS Firebase Auth UID**
   - `user.uid` from Firebase Auth
   - All documents carry userId for filtering

5. **Check-In document IDs are deterministic**
   - Format: `{userId}_{goalId}_{YYYY-MM-DD}`
   - Ensures exactly one check-in per user/goal/day
   - Idempotent: can submit multiple times, overwrites

6. **Dates are always YYYY-MM-DD strings**
   - Use `toDateKey()` utility to convert
   - Consistent across Firestore and UI

7. **Sub-Goals are embedded in MainGoal**
   - Not a separate collection
   - Embedded array: `goal.subGoals[]`
   - Update entire array, not individual sub-goals

8. **Streaks recalculate on every check-in submit**
   - `calculateGoalStreak()` runs after every mutation
   - Ensures fresh data for leaderboards

9. **Stop all Firestore listeners on logout**
   - Call `store.stopListening()` for every store
   - Clears data and unsubscribes from updates

10. **Never commit `.env` file**
    - Add to `.gitignore` immediately
    - Use `.env.example` as template

## File Organization

```
src/
├── app/
│   ├── App.tsx                     Root + Auth listener + Router
│   └── store/
│       ├── authStore.ts            Firebase Auth state (Zustand)
│       ├── goalStore.ts            Goals + real-time listener
│       ├── checkInStore.ts         Check-ins + real-time listener
│       ├── activityStore.ts        Activities + real-time listener
│       └── settingsStore.ts        User settings + real-time listener
│
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx           Email/password login UI
│   │   ├── RegisterPage.tsx        New user registration UI
│   │   └── AuthLayout.tsx          Shared auth page wrapper
│   ├── dashboard/
│   │   └── Dashboard.tsx           Home page with active goals
│   ├── goals/
│   │   ├── GoalsList.tsx           All goals grid
│   │   ├── GoalDetail.tsx          Single goal + sub-goals
│   │   ├── CreateGoalWizard.tsx    5-step goal creation
│   │   └── SubGoalEditor.tsx       Add/edit sub-goals with dnd-kit
│   ├── checkin/
│   │   ├── DailyCheckIn.tsx        Main check-in interface
│   │   └── CheckInCard.tsx         Single sub-goal check-in
│   ├── streaks/
│   │   └── StreaksPage.tsx         Streaks + milestones
│   ├── activities/
│   │   └── ActivitiesPage.tsx      Custom activity logging
│   ├── diet/
│   │   └── DietPage.tsx            Diet-specific tracking
│   ├── analytics/
│   │   └── AnalyticsPage.tsx       Charts + insights
│   └── settings/
│       └── SettingsPage.tsx        Profile + preferences + sign out
│
├── lib/
│   ├── firebase.ts                 Firebase app init
│   ├── auth/
│   │   └── authService.ts          registerUser, signInUser, signOutUser
│   └── firestore/
│       ├── goalsService.ts         subscribeToGoals, createGoal, etc.
│       ├── checkInsService.ts      subscribeToCheckIns, submitCheckIn
│       ├── activitiesService.ts    subscribeToActivities, logActivity
│       └── userService.ts          subscribeToUserProfile, updateSettings
│
├── shared/
│   ├── components/
│   │   ├── AuthGuard.tsx           Redirect to /login if no user
│   │   ├── SplashScreen.tsx        Loading screen
│   │   ├── MainLayout.tsx          Main page wrapper + nav
│   │   ├── BottomNavBar.tsx        5-tab navigation
│   │   ├── GlassCard.tsx           Reusable glass-card wrapper
│   │   ├── CircularProgress.tsx    Circular streak badge
│   │   └── ... other UI components
│   ├── hooks/
│   │   ├── useAuth.ts              useAuthStore wrapper
│   │   └── useGoals.ts             useGoalStore wrapper
│   ├── utils/
│   │   ├── dateUtils.ts            toDateKey, parseDateKey, getTodayKey, etc.
│   │   ├── streakUtils.ts          calculateGoalStreak, calculateSubGoalStreak
│   │   └── goalUtils.ts            getActiveGoals, getDaysRemaining, etc.
│   └── types/
│       └── index.ts                All TypeScript interfaces
│
└── styles/
    └── globals.css                 CSS variables + global styles
```

## Data Flow

### Authentication

1. User goes to `/login` or `/register`
2. `LoginPage.tsx` calls `useAuthStore.signIn()`
3. `authService.signInUser()` calls Firebase Auth
4. On success, redirect to `/`
5. `App.tsx` listens to `onAuthStateChanged`
6. If user exists, start all Firestore listeners
7. If user logs out, stop all listeners and clear stores

### Goal Creation

1. User clicks "Create Goal" → `/goals/create`
2. `CreateGoalWizard.tsx` 5-step form
3. On submit, calls `goalStore.addGoal()`
4. Calls `goalsService.createGoal()` → adds to Firestore
5. Real-time listener in `goalStore` detects change
6. Store updates, UI re-renders with new goal

### Daily Check-in

1. User navigates to `/checkin`
2. See list of active goals for today
3. Click a goal → `/checkin/:goalId`
4. `DailyCheckIn.tsx` loads goal + today's check-in
5. Mark sub-goals Done/Missed
6. On submit:
   - Calculate if goal day is complete
   - Call `checkInStore.submitDailyCheckIn()`
   - Writes to Firestore
   - Real-time listener updates store
   - Calculate streaks with `calculateGoalStreak()`
   - Show confetti if milestone hit
   - Redirect back to dashboard

## Key Components

### useAuthStore

```typescript
interface AuthStore {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signUp(email, password, name): Promise<void>;
  signIn(email, password): Promise<void>;
  signOut(): Promise<void>;
}
```

Start/stop listeners when user changes:
```typescript
// In App.tsx useEffect
onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    startGoalsListener(currentUser.uid);
    startCheckInsListener(currentUser.uid);
    // etc.
  } else {
    stopGoalsListener();
    stopCheckInsListener();
    // etc.
  }
});
```

### useGoalStore

```typescript
interface GoalStore {
  goals: MainGoal[];
  startListening(userId): void;     // Subscribe to Firestore
  stopListening(): void;             // Unsubscribe + clear
  addGoal(userId, goal): Promise;
  updateGoal(goalId, updates): Promise;
  deleteGoal(goalId): Promise;
  getGoalById(goalId): MainGoal | undefined;
}
```

### useCheckInStore

```typescript
interface CheckInStore {
  checkIns: DailyCheckIn[];
  submitDailyCheckIn(userId, goalId, date, ...): Promise;
  updateDailyCheckIn(userId, goalId, date, updates): Promise;
  getCheckInForGoalDate(goalId, date): DailyCheckIn | undefined;
  getCheckInsForGoal(goalId): DailyCheckIn[];
}
```

## Firestore Queries

**ALWAYS include userId filter:**

```typescript
// ✅ CORRECT
const q = query(
  collection(db, 'goals'),
  where('userId', '==', currentUser.uid),
  orderBy('createdAt', 'desc')
);

// ❌ WRONG — security rules will block this
const q = query(
  collection(db, 'goals'),
  orderBy('createdAt', 'desc')
);
```

## Dates

Always use string format `YYYY-MM-DD`:

```typescript
import { toDateKey, getTodayKey, parseDateKey } from '@/shared/utils/dateUtils';

// Current date as key
const today = getTodayKey();  // "2025-06-02"

// Convert Date to key
const key = toDateKey(new Date());  // "2025-06-02"

// Parse key back to Date
const date = parseDateKey("2025-06-02");  // Date object
```

## Firestore Collections

```
users/{userId}
  uid, email, displayName, avatar, createdAt, lastLoginAt, settings

goals/{goalId}
  userId, title, description, emoji, color, category, totalDays,
  startDate, endDate, subGoals[], completionRule, status,
  createdAt, updatedAt

checkIns/{userId}_{goalId}_{YYYY-MM-DD}
  userId, goalId, date, subGoalEntries[], isGoalDayComplete,
  completionPercentage, wasAutoMissed, notes, submittedAt

activities/{activityId}
  userId, name, category, icon, color, unit, defaultTarget, createdAt

activityLogs/{logId}
  userId, activityId, date, value, unit, notes, loggedAt
```

## Security Rules

Each collection matches on `userId == request.auth.uid` before allowing read/write.

```firestore
match /goals/{goalId} {
  allow read, write: if request.auth != null &&
    resource.data.userId == request.auth.uid;
  allow create: if request.auth != null &&
    request.resource.data.userId == request.auth.uid;
}
```

## Styling

Dark glassmorphism theme with CSS variables:

```css
--bg-primary: #080810;
--bg-secondary: #0f0f1a;
--bg-card: rgba(255, 255, 255, 0.04);
--glass-blur: blur(24px);

--grad-fitness: linear-gradient(135deg, #f093fb, #f5576c);
--grad-wellness: linear-gradient(135deg, #4facfe, #00f2fe);
/* ... 7 more category gradients */

--status-done: #22c55e;
--status-missed: #ef4444;
--status-pending: #f59e0b;
```

Use `.glass-card`, `.glass-button`, `.glass-input` classes.

## Adding New Features

### New Goal Category
1. Add to `ActivityCategory` union in `src/shared/types/index.ts`
2. Add CSS gradient in `src/styles/globals.css`
3. Add color mapping in `src/shared/utils/goalUtils.ts`

### New Firestore Collection
1. Create service file in `src/lib/firestore/`
2. Add `userId` field to every document
3. Add security rule in Firebase Console
4. Create Zustand store in `src/app/store/`
5. Add listener to App.tsx

### New Page
1. Create component in `src/features/{feature}/`
2. Add route in `src/app/App.tsx`
3. Add to BottomNavBar if main feature
4. Wrap in AuthGuard if protected

## Testing Checklist

- [ ] Register new user
- [ ] Login with existing user
- [ ] Create goal with sub-goals
- [ ] Check-in on goal
- [ ] Verify streak increments
- [ ] Edit goal/sub-goals
- [ ] Delete goal
- [ ] Logout and login again
- [ ] Verify data persists
- [ ] Test offline (DevTools → Network → Offline)
- [ ] Install PWA on mobile
- [ ] Verify User A cannot see User B data (open two browsers)
- [ ] Check Firestore rules are enforced

## Deployment Checklist

- [ ] `.env.example` complete, `.env` in .gitignore
- [ ] TypeScript: `npm run type-check` has zero errors
- [ ] Build: `npm run build` succeeds
- [ ] Firebase Firestore rules set
- [ ] Firebase indexes created
- [ ] Vercel env vars added
- [ ] Vercel deploy succeeds
- [ ] Vercel URL added to Firebase authorized domains
- [ ] Test register → login → create goal → check-in flow
- [ ] PWA installable on mobile

---

**Remember: `userId` filter on EVERY Firestore query. ALWAYS.**
