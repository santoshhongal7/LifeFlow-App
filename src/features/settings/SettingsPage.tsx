import { useNavigate } from 'react-router-dom'
import { LogOut, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/app/store/authStore'
import { useSettingsStore } from '@/app/store/settingsStore'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { profile } = useSettingsStore()
  const [confirmDelete, setConfirmDelete] = React.useState('')

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Settings
      </h1>

      {/* Profile Section */}
      <div className="glass-card p-6 mb-4">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Profile
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="glass-input opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Display Name
            </label>
            <input
              type="text"
              value={user?.displayName || ''}
              disabled
              className="glass-input opacity-50"
            />
          </div>

          {profile?.settings && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Theme
                </label>
                <select className="glass-input" defaultValue={profile.settings.theme}>
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Reminder Time
                </label>
                <input
                  type="time"
                  defaultValue={profile.settings.reminderTime}
                  className="glass-input"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifs"
                  defaultChecked={profile.settings.notificationsEnabled}
                />
                <label htmlFor="notifs" style={{ color: 'var(--text-secondary)' }}>
                  Enable Notifications
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoMiss"
                  defaultChecked={profile.settings.autoMissAfterMidnight}
                />
                <label htmlFor="autoMiss" style={{ color: 'var(--text-secondary)' }}>
                  Auto-miss after midnight
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="glass-card p-6 border border-red-500/20"
        style={{ background: 'rgba(239, 68, 68, 0.05)' }}
      >
        <h2 className="text-lg font-bold mb-4 text-red-500">Danger Zone</h2>

        <button
          onClick={handleSignOut}
          className="w-full mb-4 px-4 py-3 rounded-btn flex items-center justify-center gap-2 transition-colors"
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Delete Account
          </label>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-3">
            Type DELETE to confirm
          </p>
          <input
            type="text"
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            placeholder="Type DELETE here"
            className="glass-input mb-2"
          />
          <button
            disabled={confirmDelete !== 'DELETE'}
            className="w-full px-4 py-2 rounded-btn flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            style={{
              background: confirmDelete === 'DELETE' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
          >
            <Trash2 size={18} />
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
