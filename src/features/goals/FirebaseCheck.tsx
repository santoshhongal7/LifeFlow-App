import { useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { signInAnonymously } from 'firebase/auth'
import { collection, getDocs, query, limit } from 'firebase/firestore'

export default function FirebaseCheck() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (msg: string) => {
    console.log(msg)
    setResults((prev) => [...prev, msg])
  }

  const runChecks = async () => {
    setResults([])
    setLoading(true)
    addResult('🔍 FIREBASE DIAGNOSTICS STARTING...\n')

    try {
      // Check 1: Firebase Auth instance
      addResult('✓ Check 1: Firebase Auth initialized')
      console.log('Auth object:', auth)
      if (!auth) throw new Error('Auth not initialized!')

      // Check 2: Firebase Firestore instance
      addResult('✓ Check 2: Firebase Firestore initialized')
      console.log('Firestore object:', db)
      if (!db) throw new Error('Firestore not initialized!')

      // Check 3: Environment variables
      addResult('✓ Check 3: Checking environment variables')
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
      const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN

      if (!apiKey) {
        addResult('❌ MISSING: VITE_FIREBASE_API_KEY in .env')
        throw new Error('API key missing')
      }
      if (!projectId) {
        addResult('❌ MISSING: VITE_FIREBASE_PROJECT_ID in .env')
        throw new Error('Project ID missing')
      }
      if (!authDomain) {
        addResult('❌ MISSING: VITE_FIREBASE_AUTH_DOMAIN in .env')
        throw new Error('Auth domain missing')
      }

      addResult(`  Project ID: ${projectId}`)
      addResult(`  Auth Domain: ${authDomain}`)
      addResult(`  API Key: ${apiKey.substring(0, 10)}...`)

      // Check 4: Try anonymous auth
      addResult('\n✓ Check 4: Testing Firebase Auth (anonymous sign-in)')
      addResult('  Attempting sign-in...')

      const authResult = await Promise.race([
        signInAnonymously(auth),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        ),
      ]) as any

      addResult(`  ✓ Auth successful: ${authResult.user.uid}`)

      // Check 5: Test Firestore read
      addResult('\n✓ Check 5: Testing Firestore connection')
      addResult('  Attempting to query Firestore...')

      const goalsRef = collection(db, 'goals')
      const q = query(goalsRef, limit(1))

      const queryResult = await Promise.race([
        getDocs(q),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 5000)
        ),
      ]) as any

      addResult(`  ✓ Firestore query successful`)
      addResult(`  Documents found: ${queryResult.docs.length}`)

      addResult('\n' + '='.repeat(50))
      addResult('✅ ALL CHECKS PASSED!')
      addResult('='.repeat(50))
      addResult('\nFIREBASE IS WORKING CORRECTLY!')
      addResult('The issue is likely with:')
      addResult('  1. Firestore security rules (not published)')
      addResult('  2. Or the goalStore addGoal function')
      addResult('\nNext step: Check Firestore rules in Firebase Console')
    } catch (err: any) {
      addResult('\n' + '='.repeat(50))
      addResult('❌ FIREBASE CHECK FAILED')
      addResult('='.repeat(50))
      addResult(`\nError: ${err.message}`)
      addResult(`Code: ${err.code || 'UNKNOWN'}`)

      addResult('\n📋 TROUBLESHOOTING:')
      addResult('1. Verify .env file has all 6 Firebase variables')
      addResult('2. Check .env values are correct (copy from Firebase Console)')
      addResult('3. Verify no extra spaces or quotes in .env')
      addResult('4. Restart dev server: Ctrl+C then npm run dev')
      addResult('5. Check internet connection')
      addResult('6. Clear browser cache (Ctrl+Shift+Del)')

      addResult('\n🔗 Firebase Console:')
      addResult('https://console.firebase.google.com')

      console.error('Full error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        🔧 Firebase Diagnostics
      </h1>

      <div className="glass-card p-6 space-y-4">
        <button onClick={runChecks} disabled={loading} className="gradient-button w-full">
          {loading ? 'Running checks...' : 'Run Firebase Diagnostics'}
        </button>

        {results.length > 0 && (
          <div
            className="p-4 rounded-btn font-mono text-sm whitespace-pre-wrap"
            style={{
              background: 'var(--bg-secondary)',
              color: results.some((r) => r.includes('✅')) ? '#22c55e' : '#ef4444',
              maxHeight: '400px',
              overflow: 'auto',
              lineHeight: '1.6',
            }}
          >
            {results.join('\n')}
          </div>
        )}

        <div className="glass-card p-3 text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            What this checks:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Firebase Auth module is loaded</li>
            <li>Firestore module is loaded</li>
            <li>All .env variables exist</li>
            <li>Can authenticate with Firebase</li>
            <li>Can connect to Firestore database</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
