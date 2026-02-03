'use client'

import { useState } from 'react'
import { Check, Users, Utensils, Store, Heart, Loader2, Pencil, Plus, X } from 'lucide-react'

interface HouseholdMember {
  name: string
  role?: string
  dietaryNotes?: string
}

interface EditedData {
  householdMembers: HouseholdMember[]
  dietaryRestrictions: string[]
  healthConditions: string[]
  foodValues: string[]
  stores: string[]
  cookingNotes?: string
}

interface OnboardingSummaryProps {
  householdMembers: HouseholdMember[]
  dietaryRestrictions: string[]
  healthConditions: string[]
  foodValues: string[]
  stores: string[]
  cookingNotes?: string
  onConfirm: (editedData: EditedData) => void
  onEdit: () => void
  isLoading?: boolean
}

type EditingSection = 'household' | 'health' | 'stores' | 'cooking' | null

export function OnboardingSummary({
  householdMembers,
  dietaryRestrictions,
  healthConditions,
  foodValues,
  stores,
  cookingNotes,
  onConfirm,
  onEdit,
  isLoading = false,
}: OnboardingSummaryProps) {
  // Editable state
  const [editedMembers, setEditedMembers] = useState<HouseholdMember[]>(householdMembers)
  const [editedRestrictions, setEditedRestrictions] = useState<string[]>(dietaryRestrictions)
  const [editedConditions, setEditedConditions] = useState<string[]>(healthConditions)
  const [editedValues, setEditedValues] = useState<string[]>(foodValues)
  const [editedStores, setEditedStores] = useState<string[]>(stores)
  const [editedCookingNotes, setEditedCookingNotes] = useState(cookingNotes || '')

  const [editingSection, setEditingSection] = useState<EditingSection>(null)

  // Temp state for editing
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberNotes, setNewMemberNotes] = useState('')
  const [newItem, setNewItem] = useState('')

  const handleConfirm = () => {
    onConfirm({
      householdMembers: editedMembers,
      dietaryRestrictions: editedRestrictions,
      healthConditions: editedConditions,
      foodValues: editedValues,
      stores: editedStores,
      cookingNotes: editedCookingNotes || undefined,
    })
  }

  const addMember = () => {
    if (newMemberName.trim()) {
      setEditedMembers([
        ...editedMembers,
        { name: newMemberName.trim(), dietaryNotes: newMemberNotes.trim() || undefined },
      ])
      setNewMemberName('')
      setNewMemberNotes('')
    }
  }

  const removeMember = (index: number) => {
    setEditedMembers(editedMembers.filter((_, i) => i !== index))
  }

  const addToList = (
    list: string[],
    setList: (items: string[]) => void
  ) => {
    if (newItem.trim() && !list.includes(newItem.trim())) {
      setList([...list, newItem.trim()])
      setNewItem('')
    }
  }

  const removeFromList = (
    list: string[],
    setList: (items: string[]) => void,
    index: number
  ) => {
    setList(list.filter((_, i) => i !== index))
  }

  const cardStyle = {
    backgroundColor: 'var(--color-card)',
    borderColor: 'var(--color-border)',
  }

  const editingCardStyle = {
    backgroundColor: 'var(--color-card)',
    borderColor: 'var(--color-primary)',
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto">
        <h2
          className="text-xl font-bold font-heading text-center mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Here&apos;s What I Learned
        </h2>
        <p className="text-center text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
          Tap any section to edit
        </p>

        <div className="space-y-4 mb-6">
          {/* Household */}
          <div
            className="rounded-2xl border p-4 cursor-pointer transition-colors"
            style={editingSection === 'household' ? editingCardStyle : cardStyle}
            onClick={() => editingSection !== 'household' && setEditingSection('household')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && editingSection !== 'household' && setEditingSection('household')}
          >
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 className="font-semibold text-sm flex-1" style={{ color: 'var(--color-text)' }}>
                Your Household
              </h3>
              {editingSection !== 'household' && (
                <Pencil size={14} style={{ color: 'var(--color-muted)' }} />
              )}
            </div>

            {editingSection === 'household' ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                {editedMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)' }}
                  >
                    <span className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>
                      {member.name}
                      {member.dietaryNotes && (
                        <span style={{ color: 'var(--color-muted)' }}> - {member.dietaryNotes}</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="p-1"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Name"
                    className="flex-1 h-8 px-2 rounded text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <input
                    type="text"
                    value={newMemberNotes}
                    onChange={(e) => setNewMemberNotes(e.target.value)}
                    placeholder="Notes"
                    className="flex-1 h-8 px-2 rounded text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={addMember}
                    disabled={!newMemberName.trim()}
                    className="h-8 w-8 rounded flex items-center justify-center text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="w-full h-8 rounded text-sm font-medium text-white mt-2"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {editedMembers.length > 0 ? (
                  editedMembers.map((member, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {member.name}
                      {member.dietaryNotes && (
                        <span style={{ color: 'var(--color-muted)' }}> - {member.dietaryNotes}</span>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Tap to add household members
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Health & Dietary */}
          <div
            className="rounded-2xl border p-4 cursor-pointer transition-colors"
            style={editingSection === 'health' ? editingCardStyle : cardStyle}
            onClick={() => editingSection !== 'health' && setEditingSection('health')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && editingSection !== 'health' && setEditingSection('health')}
          >
            <div className="flex items-center gap-2 mb-3">
              <Utensils size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 className="font-semibold text-sm flex-1" style={{ color: 'var(--color-text)' }}>
                Food & Health
              </h3>
              {editingSection !== 'health' && (
                <Pencil size={14} style={{ color: 'var(--color-muted)' }} />
              )}
            </div>

            {editingSection === 'health' ? (
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                {/* Health conditions */}
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--color-muted)' }}>
                    Health conditions
                  </label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editedConditions.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                      >
                        {item}
                        <button type="button" onClick={() => removeFromList(editedConditions, setEditedConditions, i)}>
                          <X size={12} style={{ color: 'var(--color-danger)' }} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dietary restrictions */}
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--color-muted)' }}>
                    Dietary restrictions
                  </label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editedRestrictions.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                      >
                        {item}
                        <button type="button" onClick={() => removeFromList(editedRestrictions, setEditedRestrictions, i)}>
                          <X size={12} style={{ color: 'var(--color-danger)' }} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Food values */}
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--color-muted)' }}>
                    Food values
                  </label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editedValues.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                      >
                        {item}
                        <button type="button" onClick={() => removeFromList(editedValues, setEditedValues, i)}>
                          <X size={12} style={{ color: 'var(--color-danger)' }} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Add new */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add item..."
                    className="flex-1 h-8 px-2 rounded text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <select
                    className="h-8 px-2 rounded text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                    onChange={(e) => {
                      if (newItem.trim()) {
                        if (e.target.value === 'condition') addToList(editedConditions, setEditedConditions)
                        if (e.target.value === 'restriction') addToList(editedRestrictions, setEditedRestrictions)
                        if (e.target.value === 'value') addToList(editedValues, setEditedValues)
                        e.target.value = ''
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Add to...</option>
                    <option value="condition">Health</option>
                    <option value="restriction">Dietary</option>
                    <option value="value">Values</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="w-full h-8 rounded text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {editedConditions.length > 0 && (
                  <div className="text-sm">
                    <span style={{ color: 'var(--color-muted)' }}>Health: </span>
                    <span style={{ color: 'var(--color-text)' }}>
                      {editedConditions.join(', ')}
                    </span>
                  </div>
                )}
                {editedRestrictions.length > 0 && (
                  <div className="text-sm">
                    <span style={{ color: 'var(--color-muted)' }}>Dietary: </span>
                    <span style={{ color: 'var(--color-text)' }}>
                      {editedRestrictions.join(', ')}
                    </span>
                  </div>
                )}
                {editedValues.length > 0 && (
                  <div className="text-sm">
                    <span style={{ color: 'var(--color-muted)' }}>Values: </span>
                    <span style={{ color: 'var(--color-text)' }}>
                      {editedValues.join(', ')}
                    </span>
                  </div>
                )}
                {editedConditions.length === 0 && editedRestrictions.length === 0 && editedValues.length === 0 && (
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Tap to add health & dietary info
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stores */}
          <div
            className="rounded-2xl border p-4 cursor-pointer transition-colors"
            style={editingSection === 'stores' ? editingCardStyle : cardStyle}
            onClick={() => editingSection !== 'stores' && setEditingSection('stores')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && editingSection !== 'stores' && setEditingSection('stores')}
          >
            <div className="flex items-center gap-2 mb-3">
              <Store size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 className="font-semibold text-sm flex-1" style={{ color: 'var(--color-text)' }}>
                Shopping
              </h3>
              {editingSection !== 'stores' && (
                <Pencil size={14} style={{ color: 'var(--color-muted)' }} />
              )}
            </div>

            {editingSection === 'stores' ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-wrap gap-1">
                  {editedStores.map((store, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-sm flex items-center gap-1"
                      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                    >
                      {store}
                      <button type="button" onClick={() => removeFromList(editedStores, setEditedStores, i)}>
                        <X size={12} style={{ color: 'var(--color-danger)' }} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addToList(editedStores, setEditedStores)}
                    placeholder="Add store..."
                    className="flex-1 h-8 px-2 rounded text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToList(editedStores, setEditedStores)}
                    disabled={!newItem.trim()}
                    className="h-8 w-8 rounded flex items-center justify-center text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="w-full h-8 rounded text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {editedStores.length > 0 ? (
                  editedStores.map((store, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {store}
                    </span>
                  ))
                ) : (
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    Tap to add stores
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Cooking notes */}
          <div
            className="rounded-2xl border p-4 cursor-pointer transition-colors"
            style={editingSection === 'cooking' ? editingCardStyle : cardStyle}
            onClick={() => editingSection !== 'cooking' && setEditingSection('cooking')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && editingSection !== 'cooking' && setEditingSection('cooking')}
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 className="font-semibold text-sm flex-1" style={{ color: 'var(--color-text)' }}>
                Cooking Capacity
              </h3>
              {editingSection !== 'cooking' && (
                <Pencil size={14} style={{ color: 'var(--color-muted)' }} />
              )}
            </div>

            {editingSection === 'cooking' ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <textarea
                  value={editedCookingNotes}
                  onChange={(e) => setEditedCookingNotes(e.target.value)}
                  placeholder="Notes about cooking capacity, preferences..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="w-full h-8 rounded text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <p className="text-sm" style={{ color: editedCookingNotes ? 'var(--color-text)' : 'var(--color-muted)' }}>
                {editedCookingNotes || 'Tap to add cooking notes'}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Setting things up...
              </>
            ) : (
              <>
                <Check size={18} />
                Looks Good, Let&apos;s Go!
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-medium disabled:opacity-50"
            style={{ color: 'var(--color-muted)' }}
          >
            Chat More with Zylo
          </button>
        </div>
      </div>
    </div>
  )
}
