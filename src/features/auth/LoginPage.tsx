import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader } from 'lucide-react'
import { useAuthStore } from '@/app/store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, loading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}

    if (!email) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address'

    if (!password) errors.password = 'Password is required'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) return

    try {
      await signIn(email, password)
      navigate('/')
    } catch {
      // Error is handled by the store
    }
  }

  return (
    <div
      className="w-full max-w-md rounded-card p-10"
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-4xl mb-3">🌊</div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          LifeFlow
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
          Track goals. Build streaks.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Welcome back
        </h2>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
            }}
            className={`glass-input ${fieldErrors.email ? 'error' : ''}`}
            placeholder="you@example.com"
            disabled={loading}
          />
          {fieldErrors.email && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
              }}
              className={`glass-input pr-10 ${fieldErrors.password ? 'error' : ''}`}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 rounded-btn text-sm text-red-400"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            {error.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full gradient-button flex items-center justify-center gap-2 mt-6"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : null}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>
          Create one
        </Link>
      </div>
    </div>
  )
}
