import { useState } from 'react'
import { useGoalStore } from '@/app/store/goalStore'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Edit } from 'lucide-react'

export default function GoalsList() {
  const { goals, deleteGoal } = useGoalStore()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDelete = async (goalId: string) => {
    setLoading(true)
    try {
      await deleteGoal(goalId)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert('Failed to delete goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Goals
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {goals.length} goal{goals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/goals/create" className="gradient-button inline-flex items-center gap-2">
          <Plus size={18} />
          New Goal
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            No goals yet
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
            Create your first goal to start tracking!
          </p>
          <Link to="/goals/create" className="gradient-button inline-block">
            Create Goal
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Goal Info */}
                <Link
                  to={`/goals/${goal.id}`}
                  className="flex-1 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {goal.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                        {goal.totalDays} day challenge • {goal.subGoals.length} sub-goals
                      </p>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                    {goal.description}
                  </p>
                </Link>

                {/* Actions */}
                <div className="flex gap-2">
                  {/* Edit Button */}
                  <Link
                    to={`/goals/${goal.id}/edit`}
                    className="p-2 rounded-btn transition-colors"
                    style={{
                      background: 'rgba(79, 172, 254, 0.2)',
                      color: '#4facfe',
                    }}
                    title="Edit goal"
                  >
                    <Edit size={18} />
                  </Link>

                  {/* Delete Button */}
                  {deleteConfirm === goal.id ? (
                    <div className="glass-card p-2 absolute right-4 top-16 z-50 space-y-2 w-48">
                      <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
                        Delete "{goal.title}"?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(goal.id)}
                          disabled={loading}
                          className="flex-1 px-3 py-1 rounded-btn text-sm"
                          style={{
                            background: 'rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                          }}
                        >
                          {loading ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 px-3 py-1 rounded-btn text-sm"
                          style={{
                            background: 'var(--glass-border)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(goal.id)}
                      className="p-2 rounded-btn transition-colors"
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                      }}
                      title="Delete goal"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3">
                <span
                  className="px-3 py-1 rounded-pill text-xs font-medium"
                  style={{
                    background:
                      goal.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    color: goal.status === 'active' ? '#22c55e' : '#999',
                  }}
                >
                  {goal.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
