'use client'

import { useState } from 'react'
import { Check, Plus, X, Users, Store, Utensils, Pencil } from 'lucide-react'

// Household members checkpoint
interface HouseholdMember {
  name: string
  dietaryNotes?: string
}

interface HouseholdCheckpointProps {
  members: HouseholdMember[]
  onConfirm: (members: HouseholdMember[]) => void
  onSkip: () => void
}

export function HouseholdCheckpoint({
  members,
  onConfirm,
  onSkip,
}: HouseholdCheckpointProps) {
  const [editableMembers, setEditableMembers] = useState<HouseholdMember[]>(members)
  const [newName, setNewName] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const handleAddMember = () => {
    if (newName.trim()) {
      setEditableMembers([...editableMembers, { name: newName.trim() }])
      setNewName('')
    }
  }

  const handleRemoveMember = (index: number) => {
    setEditableMembers(editableMembers.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const handleStartEdit = (index: number) => {
    const member = editableMembers[index]
    setEditingIndex(index)
    setEditName(member.name)
    setEditNotes(member.dietaryNotes || '')
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editName.trim()) {
      const updated = [...editableMembers]
      updated[editingIndex] = {
        name: editName.trim(),
        dietaryNotes: editNotes.trim() || undefined,
      }
      setEditableMembers(updated)
      setEditingIndex(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users size={20} style={{ color: 'var(--color-primary)' }} />
        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
          Confirm Household Members
        </h3>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
        Based on our conversation, here&apos;s who I&apos;ll be planning meals for:
      </p>

      <div className="space-y-2 mb-4">
        {editableMembers.map((member, index) => (
          <div key={index}>
            {editingIndex === index ? (
              /* Edit mode */
              <div
                className="p-3 rounded-lg space-y-2"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-primary)',
                }}
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Name"
                  className="w-full h-9 px-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  autoFocus
                />
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Dietary notes (optional)"
                  className="w-full h-9 px-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 h-8 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-muted)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!editName.trim()}
                    className="flex-1 h-8 rounded-lg text-sm text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div
                className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                style={{ backgroundColor: 'var(--color-bg)' }}
                onClick={() => handleStartEdit(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleStartEdit(index)}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm block" style={{ color: 'var(--color-text)' }}>
                    {member.name}
                  </span>
                  {member.dietaryNotes && (
                    <span
                      className="text-xs block truncate"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {member.dietaryNotes}
                    </span>
                  )}
                </div>
                <Pencil
                  size={14}
                  className="flex-shrink-0"
                  style={{ color: 'var(--color-muted)' }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveMember(index)
                  }}
                  className="p-1 rounded flex-shrink-0"
                  style={{ color: 'var(--color-danger)' }}
                  aria-label={`Remove ${member.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
          placeholder="Add someone..."
          className="flex-1 h-9 px-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        <button
          type="button"
          onClick={handleAddMember}
          disabled={!newName.trim()}
          className="h-9 px-3 rounded-lg text-white flex items-center gap-1 text-sm disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-muted)',
          }}
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => onConfirm(editableMembers)}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          <Check size={14} />
          Looks Good
        </button>
      </div>
    </div>
  )
}

// Dietary restrictions checkpoint
interface DietaryCheckpointProps {
  initialRestrictions: string[]
  onConfirm: (restrictions: string[]) => void
  onSkip: () => void
}

const COMMON_RESTRICTIONS = [
  'Gluten-Free',
  'Dairy-Free',
  'Vegetarian',
  'Vegan',
  'Nut-Free',
  'Low-Carb',
  'Kosher',
  'Halal',
]

export function DietaryCheckpoint({
  initialRestrictions,
  onConfirm,
  onSkip,
}: DietaryCheckpointProps) {
  const [selected, setSelected] = useState<string[]>(initialRestrictions)

  const toggleRestriction = (restriction: string) => {
    setSelected((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction]
    )
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Utensils size={20} style={{ color: 'var(--color-primary)' }} />
        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
          Dietary Restrictions
        </h3>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
        Select any that apply to your household:
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {COMMON_RESTRICTIONS.map((restriction) => (
          <button
            key={restriction}
            type="button"
            onClick={() => toggleRestriction(restriction)}
            className="px-3 py-2 rounded-full text-sm font-medium border transition-colors"
            style={{
              backgroundColor: selected.includes(restriction)
                ? 'var(--color-secondary)'
                : 'var(--color-bg)',
              borderColor: selected.includes(restriction)
                ? 'var(--color-secondary)'
                : 'var(--color-border)',
              color: selected.includes(restriction) ? 'white' : 'var(--color-text)',
            }}
          >
            {restriction}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-muted)',
          }}
        >
          None
        </button>
        <button
          type="button"
          onClick={() => onConfirm(selected)}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          <Check size={14} />
          Confirm
        </button>
      </div>
    </div>
  )
}

// Stores checkpoint
interface StoresCheckpointProps {
  initialStores: string[]
  onConfirm: (stores: string[]) => void
  onSkip: () => void
}

const COMMON_STORES = [
  'Costco',
  'Kroger',
  'Meijer',
  'Walmart',
  'Target',
  'Aldi',
  'Whole Foods',
  'Trader Joes',
]

export function StoresCheckpoint({
  initialStores,
  onConfirm,
  onSkip,
}: StoresCheckpointProps) {
  const [selected, setSelected] = useState<string[]>(initialStores)
  const [customStore, setCustomStore] = useState('')

  const toggleStore = (store: string) => {
    setSelected((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
    )
  }

  const addCustomStore = () => {
    if (customStore.trim() && !selected.includes(customStore.trim())) {
      setSelected([...selected, customStore.trim()])
      setCustomStore('')
    }
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Store size={20} style={{ color: 'var(--color-primary)' }} />
        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
          Where Do You Shop?
        </h3>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
        This helps organize your grocery lists.
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {COMMON_STORES.map((store) => (
          <button
            key={store}
            type="button"
            onClick={() => toggleStore(store)}
            className="px-3 py-2 rounded-full text-sm font-medium border transition-colors"
            style={{
              backgroundColor: selected.includes(store)
                ? 'var(--color-secondary)'
                : 'var(--color-bg)',
              borderColor: selected.includes(store)
                ? 'var(--color-secondary)'
                : 'var(--color-border)',
              color: selected.includes(store) ? 'white' : 'var(--color-text)',
            }}
          >
            {store}
          </button>
        ))}
      </div>

      {/* Show custom stores that aren't in the common list */}
      {selected.filter((s) => !COMMON_STORES.includes(s)).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected
            .filter((s) => !COMMON_STORES.includes(s))
            .map((store) => (
              <div
                key={store}
                className="px-3 py-2 rounded-full text-sm font-medium text-white flex items-center gap-1"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                {store}
                <button
                  type="button"
                  onClick={() => toggleStore(store)}
                  className="ml-1"
                  aria-label={`Remove ${store}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={customStore}
          onChange={(e) => setCustomStore(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustomStore()}
          placeholder="Add another store..."
          className="flex-1 h-9 px-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        <button
          type="button"
          onClick={addCustomStore}
          disabled={!customStore.trim()}
          className="h-9 px-3 rounded-lg text-white flex items-center gap-1 text-sm disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-muted)',
          }}
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => onConfirm(selected)}
          disabled={selected.length === 0}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          <Check size={14} />
          Confirm
        </button>
      </div>
    </div>
  )
}
