import { useMemo, useState } from 'react'
import { useGoalStore } from '@/app/store/goalStore'
import { useCheckInStore } from '@/app/store/checkInStore'
import { calculateGoalStreak } from '@/shared/utils/streakUtils'
import { getCategoryColor } from '@/shared/utils/goalUtils'
import { parseDateKey, formatDate } from '@/shared/utils/dateUtils'
import { getActiveGoals } from '@/shared/utils/goalUtils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { TrendingUp, CheckCircle2, Target, Flame } from 'lucide-react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { MainGoal } from '@/shared/types'

type Period = '7d' | '14d' | '30d'

const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '14d': 14, '30d': 30 }

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="glass-card p-4 text-center">
      <Icon size={22} className="mx-auto mb-1" color={color} />
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-primary)',
      }}
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value % 1 !== 0 ? p.value.toFixed(0) : p.value}
          {p.dataKey === 'rate' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { goals } = useGoalStore()
  const { checkIns, getCheckInsForGoal } = useCheckInStore()
  const [period, setPeriod] = useState<Period>('7d')
  const [selectedGoalId, setSelectedGoalId] = useState<string>('all')

  const days = PERIOD_DAYS[period]
  const today = new Date()
  const dateRange = eachDayOfInterval({ start: subDays(today, days - 1), end: today })

  // Overall daily completion data
  const dailyData = useMemo(() => {
    return dateRange.map((date) => {
      const dateKey = format(date, 'yyyy-MM-dd')
      const dayCheckIns = checkIns.filter((ci) => ci.date === dateKey)
      const activeGoalsOnDay = goals.filter((g) => g.startDate <= dateKey && g.endDate >= dateKey && g.status === 'active')
      const completed = dayCheckIns.filter((ci) => ci.isGoalDayComplete).length
      const rate = activeGoalsOnDay.length > 0 ? Math.round((completed / activeGoalsOnDay.length) * 100) : 0

      return {
        date: format(date, days <= 7 ? 'EEE' : 'MMM d'),
        completed,
        total: activeGoalsOnDay.length,
        rate,
      }
    })
  }, [checkIns, goals, period])

  // Per-goal stats
  const goalStats = useMemo(() => {
    return goals.map((goal) => {
      const goalCheckIns = getCheckInsForGoal(goal.id)
      const streak = calculateGoalStreak(goalCheckIns, goal.startDate)
      return {
        goal,
        streak,
        name: goal.emoji + ' ' + (goal.title.length > 14 ? goal.title.slice(0, 14) + '…' : goal.title),
        completionRate: streak.completionRate,
        currentStreak: streak.currentStreak,
        totalComplete: streak.totalCompleteDays,
      }
    })
  }, [goals, checkIns])

  // Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    goals.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1
    })
    return Object.entries(counts).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: getCategoryColor(category),
    }))
  }, [goals])

  // Selected goal trend
  const selectedGoalTrend = useMemo(() => {
    if (selectedGoalId === 'all') return null
    const goal = goals.find((g) => g.id === selectedGoalId)
    if (!goal) return null

    const goalCheckIns = getCheckInsForGoal(selectedGoalId)
    return dateRange.map((date) => {
      const dateKey = format(date, 'yyyy-MM-dd')
      const checkIn = goalCheckIns.find((ci) => ci.date === dateKey)
      return {
        date: format(date, days <= 7 ? 'EEE' : 'MMM d'),
        completion: checkIn ? checkIn.completionPercentage : 0,
        complete: checkIn?.isGoalDayComplete ? 100 : 0,
      }
    })
  }, [selectedGoalId, goals, checkIns, period])

  const totalCompleteDays = goalStats.reduce((s, g) => s + g.streak.totalCompleteDays, 0)
  const avgCompletionRate = goalStats.length > 0
    ? Math.round(goalStats.reduce((s, g) => s + g.streak.completionRate, 0) / goalStats.length)
    : 0
  const bestStreak = goalStats.reduce((m, g) => Math.max(m, g.streak.currentStreak), 0)

  if (goals.length === 0) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
        <div className="glass-card p-10 text-center">
          <div className="text-5xl mb-4">📈</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No data yet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Create a goal and start checking in to see your analytics!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Visualize your progress over time</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={CheckCircle2} label="Days Complete" value={totalCompleteDays} color="#22c55e" />
        <StatCard icon={TrendingUp} label="Avg Rate" value={`${avgCompletionRate}%`} color="#4facfe" />
        <StatCard icon={Flame} label="Best Streak" value={bestStreak} color="#f97316" />
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['7d', '14d', '30d'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={{
              background: period === p ? 'var(--grad-fitness)' : 'rgba(255,255,255,0.06)',
              color: period === p ? '#fff' : 'var(--text-secondary)',
              border: period === p ? 'none' : '1px solid var(--glass-border)',
            }}
          >
            {p === '7d' ? '7 Days' : p === '14d' ? '14 Days' : '30 Days'}
          </button>
        ))}
      </div>

      {/* Daily Completion Chart */}
      <div className="glass-card p-5">
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Daily Completion Rate
        </h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dailyData} barSize={days <= 7 ? 28 : 14}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="rate" name="Completion" fill="url(#blueGrad)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4facfe" />
                <stop offset="100%" stopColor="#00f2fe" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Goal Comparison */}
      {goalStats.length > 1 && (
        <div className="glass-card p-5">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Goal Completion Rates
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={goalStats} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="completionRate" name="Rate" radius={[0, 4, 4, 0]}>
                {goalStats.map((entry, i) => (
                  <Cell key={i} fill={getCategoryColor(entry.goal.category)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-Goal Trend */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Goal Trend</h2>
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="text-sm rounded-lg px-3 py-1.5"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              outline: 'none',
            }}
          >
            <option value="all">All Goals</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.emoji} {g.title}</option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={selectedGoalId === 'all' ? dailyData : (selectedGoalTrend || dailyData)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            {selectedGoalId === 'all' ? (
              <Line
                type="monotone"
                dataKey="rate"
                name="Rate"
                stroke="#4facfe"
                strokeWidth={2.5}
                dot={{ fill: '#4facfe', r: 3 }}
                activeDot={{ r: 5 }}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="completion"
                name="Completion"
                stroke="#f093fb"
                strokeWidth={2.5}
                dot={{ fill: '#f093fb', r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Goal Categories
          </h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={150}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  <span className="ml-auto font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goal Cards */}
      <div>
        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Goal Details</h2>
        <div className="space-y-3">
          {goalStats.map(({ goal, streak }) => (
            <div key={goal.id} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{goal.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{goal.title}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{goal.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: getCategoryColor(goal.category) }}>
                    {streak.completionRate}%
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>completion</p>
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${streak.completionRate}%`,
                    background: getCategoryColor(goal.category),
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                <span>{streak.totalCompleteDays} days complete</span>
                <span>{streak.currentStreak} day streak 🔥</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}