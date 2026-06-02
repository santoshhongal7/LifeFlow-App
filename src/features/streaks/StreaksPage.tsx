import { useGoalStore } from '@/app/store/goalStore'
import { Flame } from 'lucide-react'

export default function StreaksPage() {
  const { goals } = useGoalStore()

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Streaks
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your longest streaks and milestones</p>
      </div>

      {goals.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Flame size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            No streaks yet
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Start a goal to build your first streak!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {goal.emoji} {goal.title}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                    Coming soon...
                  </p>
                </div>
                <Flame size={24} className="text-orange-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
