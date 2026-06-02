import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Loader, Plus, X } from 'lucide-react'
import { useAuthStore } from '@/app/store/authStore'
import { useGoalStore } from '@/app/store/goalStore'
import { MainGoal, SubGoal } from '@/shared/types'
import { getTodayKey, addDays } from '@/shared/utils/dateUtils'
import { getCategoryGradient } from '@/shared/utils/goalUtils'

export default function CreateGoalWizard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addGoal } = useGoalStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Goal Identity
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [category, setCategory] = useState('fitness')
  const [color, setColor] = useState('#f093fb')

  // Step 2: Duration
  const [totalDays, setTotalDays] = useState(30)
  const [startDate, setStartDate] = useState(getTodayKey())

  // Step 3: Sub-Goals
  const [subGoals, setSubGoals] = useState<Omit<SubGoal, 'id' | 'createdAt' | 'updatedAt'>[]>([])
  const [newSubGoalTitle, setNewSubGoalTitle] = useState('')
  const [newSubGoalIcon, setNewSubGoalIcon] = useState('✅')

  // Step 4: Completion Rules
  const [completionRule, setCompletionRule] = useState<'all_required' | 'any_required' | 'percentage'>('all_required')
  const [completionThreshold, setCompletionThreshold] = useState(80)

  const categories = ['fitness', 'wellness', 'mindfulness', 'sports', 'diet', 'learning', 'sleep', 'productivity', 'custom']
  const emojis = ['🎯', '💪', '🧘', '⚽', '🥗', '📚', '😴', '🚀', '❤️', '🔥', '💎', '⭐']
  const icons = ['✅', '💪', '🧘', '⚽', '🥗', '📚', '😴', '🏃', '❤️', '📖', '💧', '🎵']

  const endDate = addDays(startDate, totalDays - 1)

  const addSubGoal = () => {
    if (!newSubGoalTitle.trim()) {
      setError('Sub-goal title is required')
      return
    }

    const newSubGoal: Omit<SubGoal, 'id' | 'createdAt' | 'updatedAt'> = {
      parentGoalId: '',
      title: newSubGoalTitle,
      category: category as any,
      icon: newSubGoalIcon,
      color,
      targetType: 'boolean',
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      isRequired: true,
      sortOrder: subGoals.length,
    }

    setSubGoals([...subGoals, newSubGoal])
    setNewSubGoalTitle('')
    setError('')
  }

  const removeSubGoal = (index: number) => {
    setSubGoals(subGoals.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    setError('')

    if (step === 1 && !title.trim()) {
      setError('Goal title is required')
      return
    }

    if (step === 3 && subGoals.length === 0) {
      setError('Add at least one sub-goal')
      return
    }

    if (step < 5) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    if (!title.trim()) {
      setError('Goal title is required')
      return
    }

    if (subGoals.length === 0) {
      setError('Add at least one sub-goal')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Starting goal creation with userId:', user.uid)

      // Build goal object - NO undefined values for Firestore
      const newGoalData: any = {
        userId: user.uid,
        title: title.trim(),
        description: description.trim() || 'No description',
        emoji: emoji || '🎯',
        color: color || '#f093fb',
        category: category || 'fitness',
        totalDays: totalDays || 30,
        startDate: startDate || getTodayKey(),
        endDate: endDate || getTodayKey(),
        subGoals: (subGoals || []).map((sg, index) => {
          const subGoalObj: any = {
            id: `sg_${index}`,
            parentGoalId: '',
            title: sg.title || 'Untitled',
            category: sg.category || 'fitness',
            icon: sg.icon || '✅',
            color: sg.color || '#f093fb',
            targetType: sg.targetType || 'boolean',
            activeDays: sg.activeDays || [0, 1, 2, 3, 4, 5, 6],
            isRequired: sg.isRequired !== false,
            sortOrder: index,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          // Only add optional fields if they have values
          if (sg.description) subGoalObj.description = sg.description
          if (sg.targetValue !== undefined) subGoalObj.targetValue = sg.targetValue
          if (sg.targetUnit) subGoalObj.targetUnit = sg.targetUnit
          if (sg.reminderTime) subGoalObj.reminderTime = sg.reminderTime
          return subGoalObj
        }),
        completionRule: completionRule || 'all_required',
        status: 'active',
        coverGradient: `linear-gradient(135deg, ${color} 0%, ${shiftColor(color)} 100%)`,
      }

      // Only add completionThreshold if using percentage rule
      if (completionRule === 'percentage') {
        newGoalData.completionThreshold = completionThreshold || 80
      }

      console.log('Goal data to save:', newGoalData)

      const newGoal: Omit<MainGoal, 'id' | 'createdAt' | 'updatedAt'> = newGoalData

      console.log('Calling addGoal...')
      await addGoal(user.uid, newGoal)

      console.log('Goal created successfully!')
      setError('') // Clear error on success

      // Small delay to ensure data syncs
      setTimeout(() => {
        navigate('/goals')
      }, 1000)
    } catch (err: any) {
      console.error('Full error object:', err)
      console.error('Error message:', err.message)
      console.error('Error code:', err.code)
      setError(`Error: ${err.message || 'Failed to create goal'}`)
    } finally {
      setLoading(false)
    }
  }

  const shiftColor = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = (num >> 16) & 255
    const g = (num >> 8) & 255
    const b = num & 255
    return `#${((r - 50) * 65536 + (g - 50) * 256 + (b - 50)).toString(16).padStart(6, '0')}`
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Create New Goal
        </h1>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className="flex-1 h-1 rounded-full"
              style={{
                background: s <= step ? 'var(--grad-fitness)' : 'var(--glass-border)',
              }}
            />
          ))}
        </div>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2">
          Step {step} of 5
        </p>
      </div>

      {error && (
        <div
          className="p-4 rounded-btn mb-4 text-sm text-red-400"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          {error}
        </div>
      )}

      <div className="glass-card p-6 mb-6">
        {/* Step 1: Goal Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Goal Identity
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Goal Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
                placeholder="e.g., 30-Day Fitness Challenge"
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
                placeholder="What's this goal about?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Emoji
                </label>
                <div className="glass-card p-3 flex gap-2 flex-wrap">
                  {emojis.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className="text-2xl p-2 rounded-btn"
                      style={{
                        background: emoji === e ? 'var(--glass-border-hover)' : 'transparent',
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Category
                </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="glass-input">
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Duration */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Duration & Timing
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Number of Days: {totalDays}
              </label>

              {/* Preset Buttons */}
              <div className="flex gap-2 flex-wrap mb-3">
                {[7, 14, 21, 30, 50, 75, 100].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTotalDays(days)}
                    className="px-4 py-2 rounded-pill text-sm font-medium transition-colors"
                    style={{
                      background: totalDays === days ? 'var(--grad-fitness)' : 'var(--glass-border)',
                      color: totalDays === days ? 'white' : 'var(--text-primary)',
                    }}
                  >
                    {days}
                  </button>
                ))}
              </div>

              {/* Custom Days Input */}
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Or enter custom days:
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={totalDays}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (val >= 1 && val <= 365) {
                      setTotalDays(val)
                    }
                  }}
                  className="glass-input w-full"
                  placeholder="Enter days (1-365)"
                />
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="1"
                max="365"
                value={totalDays}
                onChange={(e) => setTotalDays(parseInt(e.target.value))}
                className="w-full"
              />
              <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">
                Drag to adjust (1-365 days)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input"
              />
            </div>

            <div className="glass-card p-3">
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                End Date: <strong style={{ color: 'var(--text-primary)' }}>{endDate}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Sub-Goals */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Sub-Goals
            </h2>

            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              Add daily tasks to track within this goal
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={newSubGoalTitle}
                onChange={(e) => setNewSubGoalTitle(e.target.value)}
                className="glass-input"
                placeholder="e.g., Run 5km, Drink 2L water"
              />
              <div className="flex gap-2">
                <select value={newSubGoalIcon} onChange={(e) => setNewSubGoalIcon(e.target.value)} className="glass-input flex-1">
                  {icons.map((i) => (
                    <option key={i} value={i}>
                      {i} Icon
                    </option>
                  ))}
                </select>
                <button onClick={addSubGoal} className="gradient-button flex items-center gap-2">
                  <Plus size={18} />
                  Add
                </button>
              </div>
            </div>

            {subGoals.length > 0 && (
              <div className="space-y-2">
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  {subGoals.length} sub-goal{subGoals.length !== 1 ? 's' : ''} added
                </p>
                {subGoals.map((sg, index) => (
                  <div key={index} className="glass-card p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sg.icon}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{sg.title}</span>
                    </div>
                    <button
                      onClick={() => removeSubGoal(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Completion Rules */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Completion Rules
            </h2>

            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              How should a day be marked as complete?
            </p>

            <div className="space-y-3">
              {[
                { value: 'all_required', label: 'All Required Sub-Goals', desc: 'Must complete every required sub-goal' },
                { value: 'any_required', label: 'Any Required Sub-Goal', desc: 'Just complete at least one required sub-goal' },
                { value: 'percentage', label: 'Percentage Threshold', desc: 'Complete a minimum percentage of sub-goals' },
              ].map((rule) => (
                <label key={rule.value} className="glass-card p-3 cursor-pointer hover:scale-105 transition-transform flex items-start gap-3">
                  <input
                    type="radio"
                    name="completionRule"
                    value={rule.value}
                    checked={completionRule === rule.value}
                    onChange={(e) => setCompletionRule(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {rule.label}
                    </p>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                      {rule.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {completionRule === 'percentage' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Threshold: {completionThreshold}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={completionThreshold}
                  onChange={(e) => setCompletionThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Review & Launch
            </h2>

            <div className="space-y-3">
              <div className="glass-card p-3">
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Goal Title</p>
                <p style={{ color: 'var(--text-primary)' }} className="font-semibold text-lg">
                  {emoji} {title}
                </p>
              </div>

              <div className="glass-card p-3">
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Duration</p>
                <p style={{ color: 'var(--text-primary)' }} className="font-semibold">
                  {totalDays} days ({startDate} to {endDate})
                </p>
              </div>

              <div className="glass-card p-3">
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Sub-Goals ({subGoals.length})</p>
                {subGoals.map((sg, i) => (
                  <p key={i} style={{ color: 'var(--text-primary)' }}>
                    {sg.icon} {sg.title}
                  </p>
                ))}
              </div>

              <div className="glass-card p-3">
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Completion Rule</p>
                <p style={{ color: 'var(--text-primary)' }} className="font-semibold">
                  {completionRule === 'all_required' && 'All required sub-goals'}
                  {completionRule === 'any_required' && 'Any required sub-goal'}
                  {completionRule === 'percentage' && `${completionThreshold}% threshold`}
                </p>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)' }} className="text-sm text-center">
              Ready to launch your goal? Click "Create Goal" below!
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 glass-button flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        )}

        {step < 5 ? (
          <button onClick={handleNext} className="flex-1 gradient-button flex items-center justify-center gap-2">
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 gradient-button flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : null}
            {loading ? 'Creating...' : 'Create Goal'}
          </button>
        )}
      </div>
    </div>
  )
}
