import { Link, useLocation } from 'react-router-dom'
import { Home, Activity, Target, Flame, LineChart } from 'lucide-react'
import { useCheckInStore } from '@/app/store/checkInStore'
import { getTodayKey } from '@/shared/utils/dateUtils'

export default function BottomNavBar() {
  const location = useLocation()
  const { checkIns } = useCheckInStore()
  const today = getTodayKey()
  const todayCheckIns = checkIns.filter((ci) => ci.date === today && !ci.isGoalDayComplete)
  const hasPendingCheckIn = todayCheckIns.length > 0

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/activities', icon: Activity, label: 'Activities' },
    { path: '/goals', icon: Target, label: 'Goals', badge: hasPendingCheckIn },
    { path: '/streaks', icon: Flame, label: 'Streaks' },
    { path: '/analytics', icon: LineChart, label: 'Analytics' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        borderColor: 'var(--glass-border)',
      }}
    >
      <div className="flex justify-around items-center max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 relative flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <div className="relative mb-1">
                <Icon size={24} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
