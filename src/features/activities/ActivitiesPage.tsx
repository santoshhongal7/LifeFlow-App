import { Plus } from 'lucide-react'
import { useActivityStore } from '@/app/store/activityStore'

export default function ActivitiesPage() {
  const { activities } = useActivityStore()

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Activities
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log and track your daily activities</p>
        </div>
        <button className="gradient-button inline-flex items-center gap-2">
          <Plus size={18} />
          Add Activity
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            No activities yet
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
            Create your first activity to start logging
          </p>
          <button className="gradient-button inline-block">Add Activity</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {activities.map((activity) => (
            <div key={activity.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {activity.name}
                    </p>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                      {activity.category} • {activity.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
