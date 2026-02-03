'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { RequireAuth } from '@/components/RequireAuth'
import {
  MessageCircle,
  Users,
  Store,
  Utensils,
  ArrowRight,
  Check,
  Plus,
  X,
  Sparkles,
  Zap,
} from 'lucide-react'

type OnboardingStep = 'choose-path' | 'welcome' | 'household' | 'stores' | 'preferences' | 'ready'

const quickSetupSteps: OnboardingStep[] = ['welcome', 'household', 'stores', 'preferences', 'ready']

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('choose-path')
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([])
  const [effortPref, setEffortPref] = useState<'super-easy' | 'middle' | 'more-prep' | 'mixed'>('mixed')
  const [newStoreName, setNewStoreName] = useState('')
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const storeInputRef = useRef<HTMLInputElement>(null)
  const memberInputRef = useRef<HTMLInputElement>(null)

  // Queries
  const householdMembers = useQuery(api.householdMembers.list)
  const stores = useQuery(api.stores.list)

  // Mutations
  const completeOnboarding = useMutation(api.userPreferences.completeOnboarding)
  const skipOnboarding = useMutation(api.userPreferences.skipOnboarding)
  const addStore = useMutation(api.stores.add)
  const removeStore = useMutation(api.stores.remove)
  const createHouseholdMember = useMutation(api.householdMembers.create)

  // Calculate progress (skip choose-path in progress calculation)
  const stepIndex = currentStep === 'choose-path' ? -1 : quickSetupSteps.indexOf(currentStep)
  const progress = currentStep === 'choose-path' ? 0 : ((stepIndex + 1) / quickSetupSteps.length) * 100

  const goNext = () => {
    const nextIndex = stepIndex + 1
    if (nextIndex < quickSetupSteps.length) {
      setCurrentStep(quickSetupSteps[nextIndex])
    }
  }

  const goBack = () => {
    const prevIndex = stepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(quickSetupSteps[prevIndex])
    } else if (currentStep === 'welcome') {
      // Go back to path choice
      setCurrentStep('choose-path')
    }
  }

  const handleChooseConversational = () => {
    router.push('/onboarding/chat')
  }

  const handleChooseQuickSetup = () => {
    setCurrentStep('welcome')
  }

  const handleAddMember = async () => {
    const name = newMemberName.trim()
    if (!name) return
    try {
      // First member is admin
      const isFirstMember = !householdMembers || householdMembers.length === 0
      await createHouseholdMember({ name, isAdmin: isFirstMember })
      setNewMemberName('')
      setTimeout(() => memberInputRef.current?.focus(), 0)
    } catch (error) {
      console.error('Failed to add member:', error)
    }
  }

  const handleAddStore = async () => {
    const name = newStoreName.trim()
    if (!name) return
    try {
      await addStore({ name })
      setNewStoreName('')
      // Re-focus input for quick multiple adds
      setTimeout(() => storeInputRef.current?.focus(), 0)
    } catch (error) {
      console.error('Failed to add store:', error)
    }
  }

  const handleRemoveStore = async (id: Id<'stores'>) => {
    try {
      await removeStore({ id })
    } catch (error) {
      console.error('Failed to remove store:', error)
    }
  }

  const [isCompleting, setIsCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  const handleComplete = async () => {
    setIsCompleting(true)
    setCompleteError(null)
    try {
      await completeOnboarding({
        dietaryRestrictions: selectedRestrictions.length > 0 ? selectedRestrictions : undefined,
        effortPreference: effortPref,
        onboardingType: 'quick',
      })
      router.push('/weekly-planning')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      setCompleteError('Something went wrong. Please try again.')
      setIsCompleting(false)
    }
  }

  const handleSkip = async () => {
    try {
      await skipOnboarding({})
      router.push('/')
    } catch (error) {
      console.error('Failed to skip onboarding:', error)
    }
  }

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Low-Carb',
    'Kosher',
    'Halal',
  ]

  const effortOptions = [
    { value: 'super-easy' as const, label: 'Super Easy', desc: 'Minimal prep, quick meals' },
    { value: 'middle' as const, label: 'Balanced', desc: 'Mix of easy and involved meals' },
    { value: 'more-prep' as const, label: 'Love to Cook', desc: 'Happy to spend time in kitchen' },
    { value: 'mixed' as const, label: 'Surprise Me', desc: 'Vary based on the day' },
  ]

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    )
  }

  return (
    <RequireAuth>
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* Progress bar */}
        <div className="h-1" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              backgroundColor: 'var(--color-primary)',
              width: `${progress}%`,
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Path Choice Step */}
          {currentStep === 'choose-path' && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--color-primary-tint)' }}
              >
                <MessageCircle size={40} style={{ color: 'var(--color-primary)' }} />
              </div>

              <h1
                className="text-2xl font-bold font-heading text-center mb-3"
                style={{ color: 'var(--color-text)' }}
              >
                Hey! I&apos;m Zylo
              </h1>

              <p
                className="text-center max-w-sm mb-8"
                style={{ color: 'var(--color-muted)' }}
              >
                How would you like to get started?
              </p>

              <div className="w-full max-w-sm space-y-4">
                {/* Conversational option */}
                <button
                  type="button"
                  onClick={handleChooseConversational}
                  className="w-full p-5 rounded-2xl border text-left transition-colors hover:border-[var(--color-primary)]"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-primary-tint)' }}
                    >
                      <MessageCircle size={24} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                        Chat with Zylo
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                        Tell me about your family and I&apos;ll learn your preferences through conversation
                      </p>
                    </div>
                    <ArrowRight size={20} className="flex-shrink-0 mt-1" style={{ color: 'var(--color-muted)' }} />
                  </div>
                </button>

                {/* Quick setup option */}
                <button
                  type="button"
                  onClick={handleChooseQuickSetup}
                  className="w-full p-5 rounded-2xl border text-left transition-colors hover:border-[var(--color-primary)]"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-secondary-tint)' }}
                    >
                      <Zap size={24} style={{ color: 'var(--color-secondary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                        Quick Setup
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                        Just the basics: household, stores, and dietary restrictions
                      </p>
                    </div>
                    <ArrowRight size={20} className="flex-shrink-0 mt-1" style={{ color: 'var(--color-muted)' }} />
                  </div>
                </button>
              </div>

              {/* Skip link */}
              <button
                type="button"
                onClick={() => setShowSkipModal(true)}
                className="mt-6 text-sm underline"
                style={{ color: 'var(--color-muted)' }}
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Welcome Step */}
          {currentStep === 'welcome' && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--color-primary-tint)' }}
              >
                <MessageCircle size={40} style={{ color: 'var(--color-primary)' }} />
              </div>

              <h1
                className="text-2xl font-bold font-heading text-center mb-3"
                style={{ color: 'var(--color-text)' }}
              >
                Hey! I&apos;m Zylo
              </h1>

              <p
                className="text-center max-w-sm mb-8"
                style={{ color: 'var(--color-muted)' }}
              >
                I&apos;m your meal planning assistant. Let me help you figure out
                what&apos;s for dinner so you don&apos;t have to stress about it.
              </p>

              <div
                className="w-full max-w-sm p-4 rounded-2xl border mb-8"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                  DinnDone helps you:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Plan meals for the whole week',
                    'Build smart grocery lists',
                    'Track what you have on hand',
                    'Swap meals when plans change',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: 'var(--color-secondary)' }}
                      />
                      <span style={{ color: 'var(--color-muted)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={goNext}
                className="w-full max-w-sm px-6 py-4 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Let&apos;s Get Started
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Household Step */}
          {currentStep === 'household' && (
            <div className="flex-1 px-6 py-8">
              <div className="flex items-center gap-3 mb-2">
                <Users size={24} style={{ color: 'var(--color-primary)' }} />
                <h1
                  className="text-xl font-bold font-heading"
                  style={{ color: 'var(--color-text)' }}
                >
                  Who&apos;s Eating?
                </h1>
              </div>

              <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
                Add yourself and anyone else I&apos;ll be planning meals for.
              </p>

              {/* Add member input */}
              <form
                className="flex gap-2 mb-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddMember()
                }}
              >
                <input
                  ref={memberInputRef}
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder={householdMembers?.length === 0 ? "Your name..." : "Add another person..."}
                  className="flex-1 h-11 px-3 rounded-xl border text-sm"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMemberName.trim()}
                  className="h-11 px-4 rounded-xl font-semibold text-white inline-flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Plus size={16} />
                  Add
                </button>
              </form>

              <div className="space-y-2 mb-6">
                {householdMembers === undefined ? (
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Loading household...
                  </p>
                ) : householdMembers.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Start by adding your name above.
                  </p>
                ) : (
                  householdMembers.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white text-sm"
                        style={{ backgroundColor: 'var(--color-secondary)' }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 font-medium" style={{ color: 'var(--color-text)' }}>
                        {member.name}
                      </span>
                      {member.isAdmin && (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--color-primary-tint)',
                            color: 'var(--color-primary)',
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                You can add or edit members anytime in Settings.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold border"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!householdMembers || householdMembers.length === 0}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Stores Step */}
          {currentStep === 'stores' && (
            <div className="flex-1 px-6 py-8">
              <div className="flex items-center gap-3 mb-2">
                <Store size={24} style={{ color: 'var(--color-primary)' }} />
                <h1
                  className="text-xl font-bold font-heading"
                  style={{ color: 'var(--color-text)' }}
                >
                  Where Do You Shop?
                </h1>
              </div>

              <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
                Add the stores you typically shop at. This helps organize your grocery list.
              </p>

              <div className="space-y-2 mb-4">
                {stores === undefined ? (
                  <p style={{ color: 'var(--color-muted)' }}>Loading...</p>
                ) : stores.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    No stores added yet.
                  </p>
                ) : (
                  stores.map((store) => (
                    <div
                      key={store._id}
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <span className="flex-1 font-medium" style={{ color: 'var(--color-text)' }}>
                        {store.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStore(store._id)}
                        className="p-2 rounded-lg"
                        style={{ color: 'var(--color-danger)' }}
                        aria-label={`Remove ${store.name}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form
                className="flex gap-2 mb-8"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddStore()
                }}
              >
                <input
                  ref={storeInputRef}
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Add a store..."
                  className="flex-1 h-11 px-3 rounded-xl border text-sm"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newStoreName.trim()}
                  className="h-11 px-4 rounded-xl font-semibold text-white inline-flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Plus size={16} />
                  Add
                </button>
              </form>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold border"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Preferences Step */}
          {currentStep === 'preferences' && (
            <div className="flex-1 px-6 py-8 overflow-auto">
              <div className="flex items-center gap-3 mb-2">
                <Utensils size={24} style={{ color: 'var(--color-primary)' }} />
                <h1
                  className="text-xl font-bold font-heading"
                  style={{ color: 'var(--color-text)' }}
                >
                  Your Preferences
                </h1>
              </div>

              <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
                Help me understand your cooking style and any dietary needs.
              </p>

              {/* Effort preference */}
              <h2
                className="text-sm font-semibold uppercase tracking-wide mb-3"
                style={{ color: 'var(--color-muted)' }}
              >
                Cooking Effort
              </h2>
              <div className="space-y-2 mb-6">
                {effortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setEffortPref(option.value)}
                    className="w-full text-left p-4 rounded-xl border transition-colors"
                    style={{
                      backgroundColor: effortPref === option.value ? 'var(--color-primary-tint)' : 'var(--color-card)',
                      borderColor: effortPref === option.value ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                          {option.label}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                          {option.desc}
                        </p>
                      </div>
                      {effortPref === option.value && (
                        <Check size={20} style={{ color: 'var(--color-primary)' }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Dietary restrictions */}
              <h2
                className="text-sm font-semibold uppercase tracking-wide mb-3"
                style={{ color: 'var(--color-muted)' }}
              >
                Dietary Restrictions (Optional)
              </h2>
              <div className="flex flex-wrap gap-2 mb-8">
                {dietaryOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleRestriction(option)}
                    className="px-3 py-2 rounded-full text-sm font-medium border transition-colors"
                    style={{
                      backgroundColor: selectedRestrictions.includes(option) ? 'var(--color-secondary)' : 'var(--color-card)',
                      borderColor: selectedRestrictions.includes(option) ? 'var(--color-secondary)' : 'var(--color-border)',
                      color: selectedRestrictions.includes(option) ? 'white' : 'var(--color-text)',
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold border"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Ready Step */}
          {currentStep === 'ready' && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--color-secondary-tint)' }}
              >
                <Sparkles size={40} style={{ color: 'var(--color-secondary)' }} />
              </div>

              <h1
                className="text-2xl font-bold font-heading text-center mb-3"
                style={{ color: 'var(--color-text)' }}
              >
                You&apos;re All Set!
              </h1>

              <p
                className="text-center max-w-sm mb-8"
                style={{ color: 'var(--color-muted)' }}
              >
                I&apos;ve got everything I need to help you plan meals. Ready to create your first week?
              </p>

              <div
                className="w-full max-w-sm p-4 rounded-2xl border mb-8"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-start gap-3">
                  <MessageCircle size={20} className="mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    <strong style={{ color: 'var(--color-text)' }}>Tip from Zylo:</strong>{' '}
                    You can change your preferences or give me feedback anytime. Just head to Settings!
                  </p>
                </div>
              </div>

              {completeError && (
                <p className="text-center text-sm mb-4" style={{ color: 'var(--color-danger)' }}>
                  {completeError}
                </p>
              )}

              <div className="w-full max-w-sm space-y-3">
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="w-full px-6 py-4 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {isCompleting ? 'Setting up...' : "Let's Plan Your Week"}
                  <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full px-6 py-4 rounded-xl font-semibold"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip confirmation modal */}
        {showSkipModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <h2
                className="text-lg font-bold font-heading mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                Skip setup?
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                The app works better when I know a bit about your household. Even a 30-second Quick Setup helps!
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                You can always set up later in Settings.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSkipModal(false)
                    handleChooseQuickSetup()
                  }}
                  className="w-full py-3 rounded-xl font-semibold text-white"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  Do Quick Setup
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full py-3 rounded-xl font-medium"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Skip anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  )
}
