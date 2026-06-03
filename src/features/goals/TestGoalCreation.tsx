import { useState } from 'react'
import { useAuthStore } from '@/app/store/authStore'
import { useGoalStore } from '@/app/store/goalStore'
import { getTodayKey, addDays } from '@/shared/utils/dateUtils'
import { ActivityCategory } from '@/shared/types'

export default function TestGoalCreation() {
  const { user } = useAuthStore()
  const { addGoal } = useGoalStore()
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const testGoalCreation = async () => {
    setError('')
    setStatus('')
    setLoading(true)

    try {
      // Check 1: User exists
      setStatus('✓ Checking user...')
      if (!user) {
        throw new Error('No user logged in!')
      }
      setStatus(`✓ User found: ${user.uid}`)

      // Check 2: Create simple goal
      setStatus('✓ Creating simple goal...')
      const today = getTodayKey()
      const endDate = addDays(today, 29)

      const simpleGoal: Omit<any, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        title: 'Test Goal ' + new Date().getTime(),
        description: 'Simple test goal',
        emoji: '🎯',
        color: '#f093fb',
        category: 'fitness' as ActivityCategory,
        totalDays: 30,
        startDate: today,
        endDate: endDate,
        subGoals: [
          {
            id: 'sg_0',
            parentGoalId: '',
            title: 'Test Sub-Goal',
            description: 'Test',
            category: 'fitness' as ActivityCategory,
            icon: '✅',
            color: '#f093fb',
            targetType: 'boolean',
            activeDays: [0, 1, 2, 3, 4, 5, 6],
            isRequired: true,
            sortOrder: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        completionRule: 'all_required' as const,
        status: 'active' as const,
        coverGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      }

      setStatus('✓ Calling addGoal...')
      console.log('Goal data:', simpleGoal)

      await addGoal(user.uid, simpleGoal)

      setStatus('✅ GOAL CREATED SUCCESSFULLY!')
      setError('')
    } catch (err: any) {
      console.error('FULL ERROR:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)

      setError(`
ERROR DETAILS:
Code: ${err.code || 'unknown'}
Message: ${err.message || 'unknown'}

TROUBLESHOOTING:
1. Check Firestore security rules are PUBLISHED (not just saved)
2. Check Firebase project ID matches .env file
3. Check Firestore database exists in Firebase Console
4. Check browser console (F12) for more details
      `)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        🧪 Goal Creation Diagnostic
      </h1>

      <div className="glass-card p-6 space-y-4">
        {/* Status */}
        <div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Status
          </h2>
          <div
            className="p-4 rounded-btn font-mono text-sm whitespace-pre-wrap"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            {status || 'Ready to test...'}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="p-4 rounded-btn text-sm whitespace-pre-wrap"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            {error}
          </div>
        )}

        {/* User Info */}
        <div className="glass-card p-3">
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Logged in as:
          </p>
          <p style={{ color: 'var(--text-primary)' }} className="font-mono text-sm">
            {user ? user.email : 'NOT LOGGED IN'}
          </p>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2">
            User ID:
          </p>
          <p style={{ color: 'var(--text-primary)' }} className="font-mono text-sm break-all">
            {user ? user.uid : 'N/A'}
          </p>
        </div>

        {/* Test Button */}
        <button
          onClick={testGoalCreation}
          disabled={loading || !user}
          className="gradient-button w-full"
        >
          {loading ? 'Testing...' : 'Run Diagnostic Test'}
        </button>

        {/* Instructions */}
        <div className="space-y-2">
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
            Instructions:
          </h3>
          <ol style={{ color: 'var(--text-secondary)' }} className="text-sm space-y-1 list-decimal list-inside">
            <li>Click "Run Diagnostic Test"</li>
            <li>Check the Status section above</li>
            <li>If error, check the troubleshooting steps</li>
            <li>Open DevTools (F12) Console tab for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
