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
  Plus,
  Pencil,
  Trash2,
  X,
  Brain,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { Id } from '../../../convex/_generated/dataModel'

interface HouseholdMember {
  _id: Id<'householdMembers'>
  name: string
  isAdmin: boolean
  dietaryPreferences?: string[]
}

interface EditingMember {
  id: Id<'householdMembers'> | null
  name: string
  dietaryPreferences: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { signOut } = useAuthActions()
  const { theme, setTheme } = useTheme()

  // Queries
  const householdMembers = useQuery(api.householdMembers.list)
  const notificationPrefs = useQuery(api.notificationPreferences.get)
  const familyProfile = useQuery(api.familyProfile.get)

  // Mutations
  const createMember = useMutation(api.householdMembers.create)
  const updateMember = useMutation(api.householdMembers.update)
  const removeMember = useMutation(api.householdMembers.remove)

  // State
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editingMember, setEditingMember] = useState<EditingMember | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Id<'householdMembers'> | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleEditMember = (member: HouseholdMember) => {
    setEditingMember({
      id: member._id,
      name: member.name,
      dietaryPreferences: (member.dietaryPreferences ?? []).join(', '),
    })
    setShowMemberModal(true)
  }

  const handleAddMember = () => {
    setEditingMember({
      id: null,
      name: '',
      dietaryPreferences: '',
    })
    setShowMemberModal(true)
  }

  const handleSaveMember = async () => {
    if (!editingMember || !editingMember.name.trim()) return

    setSaving(true)
    try {
      const prefs = editingMember.dietaryPreferences
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

      if (editingMember.id) {
        await updateMember({
          id: editingMember.id,
          name: editingMember.name.trim(),
          dietaryPreferences: prefs,
        })
      } else {
        await createMember({
          name: editingMember.name.trim(),
          isAdmin: false,
          dietaryPreferences: prefs,
        })
      }
      setShowMemberModal(false)
      setEditingMember(null)
    } catch (error) {
      console.error('Failed to save member:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMember = async (id: Id<'householdMembers'>) => {
    try {
      await removeMember({ id })
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete member:', error)
    }
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
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--color-muted)' }}
              >
                Household
              </h2>
              <button
                type="button"
                onClick={handleAddMember}
                className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                style={{ color: 'var(--color-primary)' }}
              >
                <Plus size={14} />
                Add
              </button>
            </div>
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
                    No members added yet. Tap &quot;Add&quot; to get started.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {householdMembers.map((member) => (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() => handleEditMember(member)}
                        className="w-full flex items-center justify-between p-3 rounded-xl transition-colors"
                        style={{ backgroundColor: 'var(--color-bg)' }}
                      >
                        <div className="text-left">
                          <span
                            className="font-medium block"
                            style={{ color: 'var(--color-text)' }}
                          >
                            {member.name}
                          </span>
                          {member.dietaryPreferences && member.dietaryPreferences.length > 0 && (
                            <span
                              className="text-xs"
                              style={{ color: 'var(--color-muted)' }}
                            >
                              {member.dietaryPreferences.join(', ')}
                            </span>
                          )}
                        </div>
                        <Pencil size={16} style={{ color: 'var(--color-muted)' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Zylo Memory Section */}
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted)' }}
            >
              Zylo&apos;s Memory
            </h2>
            <Link
              href="/settings/family-profile"
              className="flex items-center justify-between p-4 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <Brain size={20} style={{ color: 'var(--color-muted)' }} />
                <div>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    Family Profile
                  </span>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    {familyProfile?.zyloNotes
                      ? 'View and edit what Zylo knows'
                      : 'No profile data yet'}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--color-muted)' }} />
            </Link>
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

        {/* Edit/Add Member Modal */}
        {showMemberModal && editingMember && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              onClick={() => {
                setShowMemberModal(false)
                setEditingMember(null)
              }}
            />
            <div
              className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto rounded-2xl p-5"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {editingMember.id ? 'Edit Family Member' : 'Add Family Member'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberModal(false)
                    setEditingMember(null)
                  }}
                  style={{ color: 'var(--color-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="member-name"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Name
                  </label>
                  <input
                    id="member-name"
                    type="text"
                    autoFocus
                    value={editingMember.name}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="member-prefs"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Dietary Preferences
                  </label>
                  <input
                    id="member-prefs"
                    type="text"
                    value={editingMember.dietaryPreferences}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, dietaryPreferences: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                    placeholder="e.g., vegetarian, no nuts (comma-separated)"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                    Separate multiple preferences with commas
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {editingMember.id && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(editingMember.id)}
                    className="p-2.5 rounded-xl transition-colors"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-danger)',
                    }}
                    aria-label="Delete member"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberModal(false)
                    setEditingMember(null)
                  }}
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
                  onClick={handleSaveMember}
                  disabled={saving || !editingMember.name.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Member Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              onClick={() => setShowDeleteConfirm(null)}
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
                Delete family member?
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
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
                  onClick={() => handleDeleteMember(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors"
                  style={{ backgroundColor: 'var(--color-danger)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

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
