import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGoalStore } from '@/app/store/goalStore'
import { ChevronLeft, Plus, X, Save } from 'lucide-react'
import { SubGoal } from '@/shared/types'

interface GoalDetailProps {
  edit?: boolean
}

export default function GoalDetail({ edit = false }: GoalDetailProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getGoalById, updateGoal } = useGoalStore()
  const goal = id ? getGoalById(id) : null

  const [isEditing, setIsEditing] = useState(edit || false)
  const [title, setTitle] = useState(goal?.title || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [subGoals, setSubGoals] = useState(goal?.subGoals || [])
  const [newSubGoal, setNewSubGoal] = useState({ title: '', icon: '✅' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const icons = ['✅', '💪', '🧘', '⚽', '🥗', '📚', '😴', '🏃', '❤️', '📖', '💧', '🎵']

  const addSubGoal = () => {
    if (!newSubGoal.title.trim()) {
      setError('Sub-goal title is required')
      return
    }

    const newSg: SubGoal = {
      id: `sg_${Date.now()}`,
      parentGoalId: goal?.id || '',
      title: newSubGoal.title,
      description: '',
      category: goal?.category || 'fitness',
      icon: newSubGoal.icon,
      color: goal?.color || '#f093fb',
      targetType: 'boolean',
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      isRequired: true,
      sortOrder: subGoals.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setSubGoals([...subGoals, newSg])
    setNewSubGoal({ title: '', icon: '✅' })
    setError('')
  }

  const removeSubGoal = (sgId: string) => {
    setSubGoals(subGoals.filter((sg) => sg.id !== sgId))
  }

  const handleSave = async () => {
    if (!goal) return

    setLoading(true)
    setError('')

    try {
      await updateGoal(goal.id, {
        ...goal,
        title: title.trim(),
        description: description.trim(),
        subGoals,
      })
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save goal')
    } finally {
      setLoading(false)
    }
  }

  if (!goal) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/goals')}
          className="flex items-center gap-2 mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <div className="glass-card p-8 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>Goal not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <button
        onClick={() => {
          if (isEditing) {
            setIsEditing(false)
            setTitle(goal.title)
            setDescription(goal.description)
            setSubGoals(goal.subGoals)
          } else {
            navigate('/goals')
          }
        }}
        className="flex items-center gap-2 mb-4"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronLeft size={20} />
        Back
      </button>

      {error && (
        <div
          className="p-4 rounded-btn mb-4 text-sm text-red-400"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          {error}
        </div>
      )}

      {/* Goal Header */}
      <div className="glass-card p-6 mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Goal Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-input"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{goal.emoji}</span>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {goal.title}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>{goal.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-3 text-center">
                <p style={{ color: 'var(--text-muted)' }} className="text-xs mb-1">
                  Duration
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {goal.totalDays}d
                </p>
              </div>
              <div className="glass-card p-3 text-center">
                <p style={{ color: 'var(--text-muted)' }} className="text-xs mb-1">
                  Sub-Goals
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {goal.subGoals.length}
                </p>
              </div>
              <div className="glass-card p-3 text-center">
                <p style={{ color: 'var(--text-muted)' }} className="text-xs mb-1">
                  Status
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {goal.status}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Goals Section */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Sub-Goals
        </h2>

        {/* Add Sub-Goal Form (if editing) */}
        {isEditing && (
          <div className="mb-6 p-4 rounded-btn space-y-3" style={{ background: 'var(--bg-secondary)' }}>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold">
              Add more sub-goals to your goal
            </p>

            {/* Input Row */}
            <input
              type="text"
              value={newSubGoal.title}
              onChange={(e) => setNewSubGoal({ ...newSubGoal, title: e.target.value })}
              className="glass-input w-full"
              placeholder="e.g., Run 5km, Drink 2L water"
            />

            {/* Icon Select & Button Row */}
            <div className="flex gap-2">
              <select
                value={newSubGoal.icon}
                onChange={(e) => setNewSubGoal({ ...newSubGoal, icon: e.target.value })}
                className="glass-input"
                style={{ maxWidth: '120px' }}
              >
                {icons.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon} Icon
                  </option>
                ))}
              </select>
              <button onClick={addSubGoal} className="gradient-button flex items-center gap-2 flex-1 justify-center">
                <Plus size={18} />
                Add Sub-Goal
              </button>
            </div>
          </div>
        )}

        {/* Sub-Goals List */}
        <div className="space-y-2">
          {subGoals.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }} className="text-center py-8">
              No sub-goals yet
            </p>
          ) : (
            subGoals.map((sg) => (
              <div key={sg.id} className="glass-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{sg.icon}</span>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {sg.title}
                    </p>
                    {sg.description && (
                      <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
                        {sg.description}
                      </p>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <button
                    onClick={() => removeSubGoal(sg.id)}
                    className="text-red-500 hover:text-red-400 p-2"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 gradient-button flex items-center justify-center gap-2"
            >
              Edit Goal
            </button>
            <button
              onClick={() => navigate(`/checkin/${goal.id}`)}
              className="flex-1 glass-button flex items-center justify-center gap-2"
            >
              Check In
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setIsEditing(false)
                setTitle(goal.title)
                setDescription(goal.description)
                setSubGoals(goal.subGoals)
              }}
              className="flex-1 glass-button flex items-center justify-center gap-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 gradient-button flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
