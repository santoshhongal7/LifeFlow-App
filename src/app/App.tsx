import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from './store/authStore'
import { useGoalStore } from './store/goalStore'
import { useCheckInStore } from './store/checkInStore'
import { useActivityStore } from './store/activityStore'
import { useSettingsStore } from './store/settingsStore'

// Layout Components
import AuthLayout from '@/features/auth/AuthLayout'
import MainLayout from '@/shared/components/MainLayout'

// Auth Pages
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'

// Protected Pages
import Dashboard from '@/features/dashboard/Dashboard'
import DailyCheckIn from '@/features/checkin/DailyCheckIn'
import GoalsList from '@/features/goals/GoalsList'
import CreateGoalWizard from '@/features/goals/CreateGoalWizard'
import GoalDetail from '@/features/goals/GoalDetail'
import TestGoalCreation from '@/features/goals/TestGoalCreation'
import DirectFirestoreTest from '@/features/goals/DirectFirestoreTest'
import FirebaseCheck from '@/features/goals/FirebaseCheck'
import StreaksPage from '@/features/streaks/StreaksPage'
import ActivitiesPage from '@/features/activities/ActivitiesPage'
import DietPage from '@/features/diet/DietPage'
import AnalyticsPage from '@/features/analytics/AnalyticsPage'
import SettingsPage from '@/features/settings/SettingsPage'

// Guards and Components
import AuthGuard from '@/shared/components/AuthGuard'
import SplashScreen from '@/shared/components/SplashScreen'

export default function App() {
  const { user, loading, setUser, setLoading } = useAuthStore()
  const { startListening: startGoalsListener, stopListening: stopGoalsListener } = useGoalStore()
  const { startListening: startCheckInsListener, stopListening: stopCheckInsListener } = useCheckInStore()
  const { startListening: startActivityListener, stopListening: stopActivityListener } = useActivityStore()
  const { startListening: startSettingsListener, stopListening: stopSettingsListener } = useSettingsStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        // Start all Firestore listeners
        startGoalsListener(currentUser.uid)
        startCheckInsListener(currentUser.uid)
        startActivityListener(currentUser.uid)
        startSettingsListener(currentUser.uid)
      } else {
        setUser(null)
        // Stop all listeners
        stopGoalsListener()
        stopCheckInsListener()
        stopActivityListener()
        stopSettingsListener()
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <SplashScreen />
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/checkin" element={<DailyCheckIn />} />
          <Route path="/checkin/:goalId" element={<DailyCheckIn />} />
          <Route path="/goals" element={<GoalsList />} />
          <Route path="/goals/create" element={<CreateGoalWizard />} />
          <Route path="/goals/test" element={<TestGoalCreation />} />
          <Route path="/goals/firestore-test" element={<DirectFirestoreTest />} />
          <Route path="/goals/firebase-check" element={<FirebaseCheck />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
          <Route path="/goals/:id/edit" element={<GoalDetail edit />} />
          <Route path="/streaks" element={<StreaksPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/diet" element={<DietPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
