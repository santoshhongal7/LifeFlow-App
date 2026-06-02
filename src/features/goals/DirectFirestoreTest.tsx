import { useState } from 'react'
import { useAuthStore } from '@/app/store/authStore'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getTodayKey, addDays } from '@/shared/utils/dateUtils'

export default function DirectFirestoreTest() {
  const { user } = useAuthStore()
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const testDirectWrite = async () => {
    setError('')
    setStatus('')
    setLoading(true)

    try {
      setStatus('Step 1: Checking user...')
      if (!user) {
        throw new Error('No user logged in')
      }
      console.log('✓ User:', user.uid)

      setStatus('Step 2: Preparing data...')
      const today = getTodayKey()
      const testData = {
        userId: user.uid,
        title: 'Direct Test ' + Date.now(),
        description: 'Testing direct Firestore write',
        emoji: '🎯',
        color: '#f093fb',
        category: 'fitness',
        totalDays: 30,
        startDate: today,
        endDate: addDays(today, 29),
        subGoals: [
          {
            id: 'test_0',
            parentGoalId: '',
            title: 'Test',
            category: 'fitness',
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
        completionRule: 'all_required',
        status: 'active',
        coverGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      }
      console.log('✓ Data prepared')

      setStatus('Step 3: Writing directly to Firestore...')
      console.log('Firestore db:', db)
      console.log('Collection:', 'goals')
      console.log('Data to write:', testData)

      // Create collection reference
      setStatus('Step 3a: Creating collection reference...')
      const goalsCollection = collection(db, 'goals')
      console.log('✓ Collection ref created:', goalsCollection)

      // Prepare document data
      setStatus('Step 3b: Preparing document data...')
      const docData = {
        ...testData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      console.log('✓ Document data prepared:', docData)

      // Add document with timeout
      setStatus('Step 3c: Calling addDoc (this may take a moment)...')
      console.log('About to call addDoc...')

      // Create a promise that rejects after 10 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore write timeout after 10 seconds')), 10000)
      )

      const docRef = await Promise.race([
        addDoc(goalsCollection, docData),
        timeoutPromise as Promise<any>,
      ])

      setStatus(`✅ SUCCESS! Goal created with ID: ${docRef.id}`)
      console.log('✓ Goal created:', docRef.id)
    } catch (err: any) {
      console.error('ERROR:', err)
      const errorMsg = `
Code: ${err.code || 'UNKNOWN'}
Message: ${err.message || 'Unknown error'}
Stack: ${err.stack || 'No stack trace'}

POSSIBLE FIXES:
1. Firestore security rules NOT published
   → Go to Firebase Console → Firestore → Rules
   → Click PUBLISH (not Save)

2. Firestore database doesn't exist
   → Go to Firebase Console → Create Firestore Database
   → Region: asia-south1

3. Firestore not initialized
   → Check .env has all 6 Firebase values
   → Restart: Ctrl+C then npm run dev

4. User not authenticated
   → Log out and log back in

5. Network/connectivity issue
   → Check internet connection
      `
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        🔥 Direct Firestore Test
      </h1>

      <div className="glass-card p-6 space-y-4">
        {/* Status Box */}
        <div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Status
          </h2>
          <div
            className="p-4 rounded-btn font-mono text-sm whitespace-pre-wrap"
            style={{
              background: 'var(--bg-secondary)',
              color: status.includes('SUCCESS') ? '#22c55e' : 'var(--text-secondary)',
              maxHeight: '150px',
              overflow: 'auto',
            }}
          >
            {status || 'Ready...'}
          </div>
        </div>

        {/* Error Box */}
        {error && (
          <div
            className="p-4 rounded-btn text-sm whitespace-pre-wrap font-mono text-xs"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              maxHeight: '300px',
              overflow: 'auto',
            }}
          >
            {error}
          </div>
        )}

        {/* User Info */}
        <div className="glass-card p-3 text-sm">
          <p style={{ color: 'var(--text-secondary)' }}>User:</p>
          <p style={{ color: 'var(--text-primary)' }} className="font-mono break-all">
            {user?.email || 'NOT LOGGED IN'}
          </p>
        </div>

        {/* Test Button */}
        <button
          onClick={testDirectWrite}
          disabled={loading || !user}
          className="gradient-button w-full"
        >
          {loading ? 'Testing...' : 'Test Direct Firestore Write'}
        </button>

        {/* Info */}
        <div className="glass-card p-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            What This Test Does:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Writes directly to Firestore (bypasses Zustand store)</li>
            <li>Checks if database is accessible</li>
            <li>Verifies security rules allow writes</li>
            <li>Shows exact error if it fails</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
