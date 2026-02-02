'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../../../convex/_generated/api'
import { RequireAuth } from '@/components/RequireAuth'
import {
  ArrowLeft,
  Bell,
  Users,
  RotateCcw,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

export default function SettingsPage() {
  const router = useRouter()
  const { signOut } = useAuthActions()
  const { theme, setTheme } = useTheme()

  // Query household members
  const householdMembers = useQuery(api.householdMembers.list)

  // Query notification preferences
  const notificationPrefs = useQuery(api.notificationPreferences.get)

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <RequireAuth>
      <div
        className="min-h-[calc(100vh-120px)]"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold mb-3 transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-muted)' }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1
            className="text-xl font-bold font-heading"
            style={{ color: 'var(--color-text)' }}
          >
            Settings
          </h1>
        </div>

        <div className="px-4 py-4 space-y-6">
          {/* Appearance Section */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted)' }}
            >
              Appearance
            </h2>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon size={20} style={{ color: 'var(--color-muted)' }} />
                  ) : (
                    <Sun size={20} style={{ color: 'var(--color-muted)' }} />
                  )}
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    Dark Mode
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-12 h-7 rounded-full relative transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(4px)',
                    }}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Household Section */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted)' }}
            >
              Household
            </h2>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users size={20} style={{ color: 'var(--color-muted)' }} />
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    Family Members
                  </span>
                </div>
                {householdMembers === undefined ? (
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Loading...
                  </p>
                ) : householdMembers.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    No members added yet
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {householdMembers.map((member) => (
                      <span
                        key={member._id}
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: 'var(--color-bg)',
                          color: 'var(--color-text)',
                        }}
                      >
                        {member.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted)' }}
            >
              Notifications
            </h2>
            <Link
              href="/notifications"
              className="flex items-center justify-between p-4 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <Bell size={20} style={{ color: 'var(--color-muted)' }} />
                <div>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    Notification Settings
                  </span>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    {notificationPrefs?.pushEnabled ? 'Push enabled' : 'Configure alerts'}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--color-muted)' }} />
            </Link>
          </section>

          {/* Setup Section */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted)' }}
            >
              Setup
            </h2>
            <Link
              href="/onboarding"
              className="w-full flex items-center justify-between p-4 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <RotateCcw size={20} style={{ color: 'var(--color-muted)' }} />
                <div className="text-left">
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    Redo Setup
                  </span>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Go through onboarding again
                  </p>
                </div>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--color-muted)' }} />
            </Link>
          </section>

          {/* Account Section */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted)' }}
            >
              Account
            </h2>
            <button
              type="button"
              onClick={() => setShowSignOutConfirm(true)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <LogOut size={20} style={{ color: 'var(--color-danger)' }} />
              <span className="font-medium" style={{ color: 'var(--color-danger)' }}>
                Sign Out
              </span>
            </button>
          </section>

          {/* App version */}
          <p className="text-center text-xs pt-4" style={{ color: 'var(--color-muted)' }}>
            DinnDone v0.1.0
          </p>
        </div>

        {/* Sign out confirmation modal */}
        {showSignOutConfirm && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              onClick={() => setShowSignOutConfirm(false)}
            />
            <div
              className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto rounded-2xl p-5"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                Sign out?
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                You&apos;ll need to sign in again to access your meal plans.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors"
                  style={{ backgroundColor: 'var(--color-danger)' }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  )
}
