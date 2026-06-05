import { useMemo } from 'react'
import { useGoalStore } from '@/app/store/goalStore'
import { useCheckInStore } from '@/app/store/checkInStore'
import { calculateGoalStreak, calculateSubGoalStreak, getMilestoneMessage, getStreakColor } from '@/shared/utils/streakUtils'
import { Flame, Trophy, Target, TrendingUp, Calendar, Star } from 'lucide-react'

const MILESTONES = [1, 3, 7, 14, 21, 30, 50, 75, 100]

function StreakRing({ streak, max = 30 }: { streak: number; max?: number }) {
  const pct = Math.min(streak / max, 1)
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - pct * circ

  const color = streak === 0
    ? '#4b5563'
    : streak < 7
    ? '#f59e0b'
    : streak < 30
    ? '#f97316'
    : '#ef4444'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <svg width="72" height="72" className="rotate-[-90deg]">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold" style={{ color: 'var(--text-primary)', lineHeight: 1 }}>
          {streak}
        </span>
        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>days</span>
      </div>
    </div>
  )
}

function MilestoneBadge({ days, achieved }: { days: number; achieved: boolean }) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg"
      style={{
        background: achieved ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${achieved ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <Star size={14} color={achieved ? '#f97316' : '#4b5563'} fill={achieved ? '#f97316' : 'none'} />
      <span className="text-[11px] font-semibold" style={{ color: achieved ? '#f97316' : 'var(--text-muted)' }}>
        {days}d
      </span>
    </div>
  )
}

export default function StreaksPage() {
  const { goals } = useGoalStore()
  const { checkIns, getCheckInsForGoal } = useCheckInStore()

  const goalStreaks = useMemo(() => {
    return goals.map((goal) => {
      const goalCheckIns = getCheckInsForGoal(goal.id)
      const streak = calculateGoalStreak(goalCheckIns, goal.startDate)
      const subGoalStreaks = goal.subGoals.map((sg) => ({
        subGoal: sg,
        streak: calculateSubGoalStreak(goalCheckIns, sg.id),
      })).filter((s) => s.streak !== null)

      return { goal, streak, subGoalStreaks }
    })
  }, [goals, checkIns])

  const totalCurrentStreak = goalStreaks.reduce((sum, g) => sum + g.streak.currentStreak, 0)
  const bestStreak = goalStreaks.reduce((max, g) => Math.max(max, g.streak.longestStreak), 0)
  const totalCompleteDays = goalStreaks.reduce((sum, g) => sum + g.streak.totalCompleteDays, 0)

  if (goals.length === 0) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Streaks</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your longest streaks and milestones</p>
        </div>
        <div className="glass-card p-10 text-center">
          <Flame size={52} className="mx-auto mb-4" color="#f97316" />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No streaks yet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Start a goal to build your first streak!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Streaks</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your consistency and milestones</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <Flame size={22} className="mx-auto mb-1" color="#f97316" />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalCurrentStreak}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Streak</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Trophy size={22} className="mx-auto mb-1" color="#f59e0b" />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{bestStreak}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Best Streak</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Calendar size={22} className="mx-auto mb-1" color="#4facfe" />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalCompleteDays}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Days Complete</p>
        </div>
      </div>

      {/* Per-Goal Streaks */}
      {goalStreaks.map(({ goal, streak, subGoalStreaks }) => (
        <div key={goal.id} className="glass-card p-5">
          {/* Goal Header */}
          <div className="flex items-center gap-4 mb-4">
            <StreakRing streak={streak.currentStreak} max={goal.totalDays} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{goal.emoji}</span>
                <h2 className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {goal.title}
                </h2>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {getMilestoneMessage(streak.currentStreak)}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className={`text-lg font-bold ${getStreakColor(streak.longestStreak)}`}>
                {streak.longestStreak}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Best</p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{streak.totalCompleteDays}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Complete</p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{streak.completionRate}%</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Rate</p>
            </div>
          </div>

          {/* Milestones */}
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>MILESTONES</p>
            <div className="flex gap-2 flex-wrap">
              {MILESTONES.map((m) => (
                <MilestoneBadge key={m} days={m} achieved={streak.longestStreak >= m} />
              ))}
            </div>
          </div>

          {/* Sub-Goal Streaks */}
          {subGoalStreaks.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>SUB-GOAL STREAKS</p>
              <div className="space-y-2">
                {subGoalStreaks.map(({ subGoal, streak: sg }) => (
                  <div
                    key={subGoal.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{subGoal.icon}</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subGoal.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Flame size={13} color={sg!.currentStreak > 0 ? '#f97316' : '#4b5563'} />
                        <span className={getStreakColor(sg!.currentStreak)} style={{ fontWeight: 600 }}>
                          {sg!.currentStreak}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>/ {sg!.longestStreak} best</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}