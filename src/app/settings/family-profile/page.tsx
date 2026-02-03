'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { RequireAuth } from '@/components/RequireAuth'
import { ArrowLeft, Save, Brain } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FamilyProfilePage() {
  const router = useRouter()

  // Query family profile
  const familyProfile = useQuery(api.familyProfile.get)

  // Mutation to update
  const upsertProfile = useMutation(api.familyProfile.upsert)

  // Local state for editing
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [zyloNotes, setZyloNotes] = useState('')
  const [location, setLocation] = useState({ city: '', region: '' })
  const [shoppingPrefs, setShoppingPrefs] = useState({
    primaryStores: '',
    frequency: '',
    budgetLevel: '' as '' | 'budget-conscious' | 'moderate' | 'flexible',
  })
  const [healthContext, setHealthContext] = useState({
    conditions: '',
    dietaryRestrictions: '',
    allergies: '',
    foodValues: '',
  })
  const [familyDynamics, setFamilyDynamics] = useState({
    primaryCook: '',
    pickyEaters: '',
    mealSchedule: '',
  })
  const [cookingCapacity, setCookingCapacity] = useState({
    energyLevel: '' as '' | 'low' | 'variable' | 'good',
    weeknightMinutes: '',
    weekendFlexibility: false,
    batchCooking: false,
  })

  // Initialize form when profile loads and not editing
  const initializeForm = () => {
    if (familyProfile) {
      setZyloNotes(familyProfile.zyloNotes ?? '')
      setLocation({
        city: familyProfile.location?.city ?? '',
        region: familyProfile.location?.region ?? '',
      })
      setShoppingPrefs({
        primaryStores: (familyProfile.shoppingPreferences?.primaryStores ?? []).join(', '),
        frequency: familyProfile.shoppingPreferences?.frequency ?? '',
        budgetLevel: familyProfile.shoppingPreferences?.budgetLevel ?? '',
      })
      setHealthContext({
        conditions: (familyProfile.healthContext?.conditions ?? []).join(', '),
        dietaryRestrictions: (familyProfile.healthContext?.dietaryRestrictions ?? []).join(', '),
        allergies: (familyProfile.healthContext?.allergies ?? []).join(', '),
        foodValues: (familyProfile.healthContext?.foodValues ?? []).join(', '),
      })
      setFamilyDynamics({
        primaryCook: familyProfile.familyDynamics?.primaryCook ?? '',
        pickyEaters: (familyProfile.familyDynamics?.pickyEaters ?? []).join(', '),
        mealSchedule: familyProfile.familyDynamics?.mealSchedule ?? '',
      })
      setCookingCapacity({
        energyLevel: familyProfile.cookingCapacity?.energyLevel ?? '',
        weeknightMinutes: familyProfile.cookingCapacity?.weeknightMinutes?.toString() ?? '',
        weekendFlexibility: familyProfile.cookingCapacity?.weekendFlexibility ?? false,
        batchCooking: familyProfile.cookingCapacity?.batchCooking ?? false,
      })
    }
  }

  const handleStartEditing = () => {
    initializeForm()
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Helper to convert comma-separated string to array
      const toArray = (str: string) =>
        str
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)

      await upsertProfile({
        zyloNotes: zyloNotes || undefined,
        location:
          location.city || location.region
            ? {
                city: location.city || undefined,
                region: location.region || undefined,
              }
            : undefined,
        shoppingPreferences:
          shoppingPrefs.primaryStores || shoppingPrefs.frequency || shoppingPrefs.budgetLevel
            ? {
                primaryStores: toArray(shoppingPrefs.primaryStores) || undefined,
                frequency: shoppingPrefs.frequency || undefined,
                budgetLevel: shoppingPrefs.budgetLevel || undefined,
              }
            : undefined,
        healthContext:
          healthContext.conditions ||
          healthContext.dietaryRestrictions ||
          healthContext.allergies ||
          healthContext.foodValues
            ? {
                conditions: toArray(healthContext.conditions) || undefined,
                dietaryRestrictions: toArray(healthContext.dietaryRestrictions) || undefined,
                allergies: toArray(healthContext.allergies) || undefined,
                foodValues: toArray(healthContext.foodValues) || undefined,
              }
            : undefined,
        familyDynamics:
          familyDynamics.primaryCook || familyDynamics.pickyEaters || familyDynamics.mealSchedule
            ? {
                primaryCook: familyDynamics.primaryCook || undefined,
                pickyEaters: toArray(familyDynamics.pickyEaters) || undefined,
                mealSchedule: familyDynamics.mealSchedule || undefined,
              }
            : undefined,
        cookingCapacity:
          cookingCapacity.energyLevel ||
          cookingCapacity.weeknightMinutes ||
          cookingCapacity.weekendFlexibility ||
          cookingCapacity.batchCooking
            ? {
                energyLevel: cookingCapacity.energyLevel || undefined,
                weeknightMinutes: cookingCapacity.weeknightMinutes
                  ? parseInt(cookingCapacity.weeknightMinutes)
                  : undefined,
                weekendFlexibility: cookingCapacity.weekendFlexibility || undefined,
                batchCooking: cookingCapacity.batchCooking || undefined,
              }
            : undefined,
      })
      setEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  }

  return (
    <RequireAuth>
      <div
        className="min-h-[calc(100vh-120px)] pb-8"
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
          <div className="flex items-center justify-between">
            <h1
              className="text-xl font-bold font-heading"
              style={{ color: 'var(--color-text)' }}
            >
              Family Profile
            </h1>
            {!editing && familyProfile && (
              <button
                type="button"
                onClick={handleStartEditing}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                Edit
              </button>
            )}
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            What Zylo knows about your family
          </p>
        </div>

        <div className="px-4 py-4 space-y-6">
          {familyProfile === undefined ? (
            <p style={{ color: 'var(--color-muted)' }}>Loading...</p>
          ) : !familyProfile && !editing ? (
            <div
              className="rounded-2xl border p-6 text-center"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Brain
                size={40}
                className="mx-auto mb-3"
                style={{ color: 'var(--color-muted)' }}
              />
              <p className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                No profile data yet
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                Complete the onboarding chat with Zylo to build your family profile, or add details
                manually.
              </p>
              <button
                type="button"
                onClick={handleStartEditing}
                className="px-4 py-2 rounded-xl font-semibold text-sm text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Add Details Manually
              </button>
            </div>
          ) : editing ? (
            <>
              {/* Zylo Notes */}
              <section>
                <label
                  className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Zylo&apos;s Summary
                </label>
                <textarea
                  value={zyloNotes}
                  onChange={(e) => setZyloNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={inputStyle}
                  placeholder="Zylo's notes about your family..."
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  This is the summary Zylo uses to personalize meal suggestions
                </p>
              </section>

              {/* Location */}
              <section>
                <h3
                  className="text-xs font-bold uppercase tracking-wide mb-3"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Location
                </h3>
                <div
                  className="rounded-2xl border p-4 space-y-3"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <input
                    type="text"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={inputStyle}
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={location.region}
                    onChange={(e) => setLocation({ ...location, region: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={inputStyle}
                    placeholder="State/Region"
                  />
                </div>
              </section>

              {/* Shopping Preferences */}
              <section>
                <h3
                  className="text-xs font-bold uppercase tracking-wide mb-3"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Shopping
                </h3>
                <div
                  className="rounded-2xl border p-4 space-y-3"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Preferred Stores
                    </label>
                    <input
                      type="text"
                      value={shoppingPrefs.primaryStores}
                      onChange={(e) =>
                        setShoppingPrefs({ ...shoppingPrefs, primaryStores: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                      placeholder="e.g., Costco, Trader Joe's (comma-separated)"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Shopping Frequency
                    </label>
                    <input
                      type="text"
                      value={shoppingPrefs.frequency}
                      onChange={(e) =>
                        setShoppingPrefs({ ...shoppingPrefs, frequency: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                      placeholder="e.g., weekly, twice a week"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Budget Level
                    </label>
                    <select
                      value={shoppingPrefs.budgetLevel}
                      onChange={(e) =>
                        setShoppingPrefs({
                          ...shoppingPrefs,
                          budgetLevel: e.target.value as '' | 'budget-conscious' | 'moderate' | 'flexible',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                    >
                      <option value="">Not specified</option>
                      <option value="budget-conscious">Budget-conscious</option>
                      <option value="moderate">Moderate</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Health & Dietary */}
              <section>
                <h3
                  className="text-xs font-bold uppercase tracking-wide mb-3"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Health & Dietary
                </h3>
                <div
                  className="rounded-2xl border p-4 space-y-3"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Health Conditions
                    </label>
                    <input
                      type="text"
                      value={healthContext.conditions}
                      onChange={(e) =>
                        setHealthContext({ ...healthContext, conditions: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                      placeholder="e.g., Lyme disease, diabetes (comma-separated)"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Dietary Restrictions
                    </label>
                    <input
                      type="text"
                      value={healthContext.dietaryRestrictions}
                      onChange={(e) =>
                        setHealthContext({ ...healthContext, dietaryRestrictions: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                      placeholder="e.g., gluten-free, dairy-free (comma-separated)"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Allergies
                    </label>
                    <input
                      type="text"
                      value={healthContext.allergies}
                      onChange={(e) =>
                        setHealthContext({ ...healthContext, allergies: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                      placeholder="e.g., peanuts, shellfish (comma-separated)"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Food Values
                    </label>
                    <input
                      type="text"
                      value={healthContext.foodValues}
                      onChange={(e) =>
                        setHealthContext({ ...healthContext, foodValues: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                      placeholder="e.g., organic, clean eating, local (comma-separated)"
                    />
                  </div>
                </div>
              </section>

              {/* Family Dynamics */}
              <section>
                <h3
                  className="text-xs font-bold uppercase tracking-wide mb-3"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Family Dynamics
                </h3>
                <div
                  className="rounded-2xl border p-4 space-y-3"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Primary Cook
                    </label>
                    <input
                      type="text"
                      value={familyDynamics.primaryCook}
                      onChange={(e) =>
                        setFamilyDynamics({ ...familyDynamics, primaryCook: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                      placeholder="Who usually cooks?"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Picky Eaters
                    </label>
                    <input
                      type="text"
                      value={familyDynamics.pickyEaters}
                      onChange={(e) =>
                        setFamilyDynamics({ ...familyDynamics, pickyEaters: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                      placeholder="Names of picky eaters (comma-separated)"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Meal Schedule
                    </label>
                    <input
                      type="text"
                      value={familyDynamics.mealSchedule}
                      onChange={(e) =>
                        setFamilyDynamics({ ...familyDynamics, mealSchedule: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                      placeholder="e.g., dinner at 6pm, kids eat earlier"
                    />
                  </div>
                </div>
              </section>

              {/* Cooking Capacity */}
              <section>
                <h3
                  className="text-xs font-bold uppercase tracking-wide mb-3"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Cooking Capacity
                </h3>
                <div
                  className="rounded-2xl border p-4 space-y-3"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Energy Level
                    </label>
                    <select
                      value={cookingCapacity.energyLevel}
                      onChange={(e) =>
                        setCookingCapacity({
                          ...cookingCapacity,
                          energyLevel: e.target.value as '' | 'low' | 'variable' | 'good',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                    >
                      <option value="">Not specified</option>
                      <option value="low">Low - keep it simple</option>
                      <option value="variable">Variable - depends on the day</option>
                      <option value="good">Good - happy to cook</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text)' }}>
                      Weeknight Cooking Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={cookingCapacity.weeknightMinutes}
                      onChange={(e) =>
                        setCookingCapacity({ ...cookingCapacity, weeknightMinutes: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={inputStyle}
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                      More time on weekends?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCookingCapacity({
                          ...cookingCapacity,
                          weekendFlexibility: !cookingCapacity.weekendFlexibility,
                        })
                      }
                      className="w-12 h-7 rounded-full relative transition-colors"
                      style={{
                        backgroundColor: cookingCapacity.weekendFlexibility
                          ? 'var(--color-primary)'
                          : 'var(--color-border)',
                      }}
                    >
                      <div
                        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
                        style={{
                          transform: cookingCapacity.weekendFlexibility
                            ? 'translateX(24px)'
                            : 'translateX(4px)',
                        }}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                      Do batch cooking?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCookingCapacity({
                          ...cookingCapacity,
                          batchCooking: !cookingCapacity.batchCooking,
                        })
                      }
                      className="w-12 h-7 rounded-full relative transition-colors"
                      style={{
                        backgroundColor: cookingCapacity.batchCooking
                          ? 'var(--color-primary)'
                          : 'var(--color-border)',
                      }}
                    >
                      <div
                        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
                        style={{
                          transform: cookingCapacity.batchCooking
                            ? 'translateX(24px)'
                            : 'translateX(4px)',
                        }}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* Save/Cancel buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : familyProfile ? (
            /* View Mode */
            <>
              {/* Zylo Notes */}
              {familyProfile.zyloNotes && (
                <section>
                  <h3
                    className="text-xs font-bold uppercase tracking-wide mb-3"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Zylo&apos;s Summary
                  </h3>
                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
                      {familyProfile.zyloNotes}
                    </p>
                  </div>
                </section>
              )}

              {/* Location */}
              {(familyProfile.location?.city || familyProfile.location?.region) && (
                <ProfileSection
                  title="Location"
                  items={[
                    { label: 'City', value: familyProfile.location.city },
                    { label: 'Region', value: familyProfile.location.region },
                  ]}
                />
              )}

              {/* Shopping */}
              {familyProfile.shoppingPreferences && (
                <ProfileSection
                  title="Shopping"
                  items={[
                    {
                      label: 'Stores',
                      value: familyProfile.shoppingPreferences.primaryStores?.join(', '),
                    },
                    { label: 'Frequency', value: familyProfile.shoppingPreferences.frequency },
                    { label: 'Budget', value: familyProfile.shoppingPreferences.budgetLevel },
                  ]}
                />
              )}

              {/* Health */}
              {familyProfile.healthContext && (
                <ProfileSection
                  title="Health & Dietary"
                  items={[
                    { label: 'Conditions', value: familyProfile.healthContext.conditions?.join(', ') },
                    {
                      label: 'Dietary Restrictions',
                      value: familyProfile.healthContext.dietaryRestrictions?.join(', '),
                    },
                    { label: 'Allergies', value: familyProfile.healthContext.allergies?.join(', ') },
                    { label: 'Food Values', value: familyProfile.healthContext.foodValues?.join(', ') },
                  ]}
                />
              )}

              {/* Family Dynamics */}
              {familyProfile.familyDynamics && (
                <ProfileSection
                  title="Family Dynamics"
                  items={[
                    { label: 'Primary Cook', value: familyProfile.familyDynamics.primaryCook },
                    { label: 'Picky Eaters', value: familyProfile.familyDynamics.pickyEaters?.join(', ') },
                    { label: 'Meal Schedule', value: familyProfile.familyDynamics.mealSchedule },
                  ]}
                />
              )}

              {/* Cooking Capacity */}
              {familyProfile.cookingCapacity && (
                <ProfileSection
                  title="Cooking Capacity"
                  items={[
                    { label: 'Energy Level', value: familyProfile.cookingCapacity.energyLevel },
                    {
                      label: 'Weeknight Time',
                      value: familyProfile.cookingCapacity.weeknightMinutes
                        ? `${familyProfile.cookingCapacity.weeknightMinutes} minutes`
                        : undefined,
                    },
                    {
                      label: 'Weekend Flexibility',
                      value: familyProfile.cookingCapacity.weekendFlexibility ? 'Yes' : undefined,
                    },
                    {
                      label: 'Batch Cooking',
                      value: familyProfile.cookingCapacity.batchCooking ? 'Yes' : undefined,
                    },
                  ]}
                />
              )}

              {/* If no data at all */}
              {!familyProfile.zyloNotes &&
                !familyProfile.location &&
                !familyProfile.shoppingPreferences &&
                !familyProfile.healthContext &&
                !familyProfile.familyDynamics &&
                !familyProfile.cookingCapacity && (
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    No profile details saved yet. Tap &quot;Edit&quot; to add information.
                  </p>
                )}
            </>
          ) : null}
        </div>
      </div>
    </RequireAuth>
  )
}

// Helper component for view mode sections
function ProfileSection({
  title,
  items,
}: {
  title: string
  items: { label: string; value: string | undefined }[]
}) {
  const visibleItems = items.filter((item) => item.value)
  if (visibleItems.length === 0) return null

  return (
    <section>
      <h3
        className="text-xs font-bold uppercase tracking-wide mb-3"
        style={{ color: 'var(--color-muted)' }}
      >
        {title}
      </h3>
      <div
        className="rounded-2xl border p-4 space-y-2"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {visibleItems.map((item) => (
          <div key={item.label} className="flex justify-between text-sm">
            <span style={{ color: 'var(--color-muted)' }}>{item.label}</span>
            <span className="text-right" style={{ color: 'var(--color-text)' }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
