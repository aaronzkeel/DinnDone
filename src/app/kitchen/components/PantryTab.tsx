'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { Plus, Trash2, Package, Refrigerator, Snowflake } from 'lucide-react'

type PantryLocation = 'fridge' | 'freezer' | 'pantry'

interface PantryItem {
  _id: Id<'pantryItems'>
  name: string
  location: PantryLocation
  quantity?: string
}

const locationConfig: Record<PantryLocation, { label: string; icon: typeof Package; color: string }> = {
  fridge: { label: 'Fridge', icon: Refrigerator, color: 'var(--color-secondary)' },
  freezer: { label: 'Freezer', icon: Snowflake, color: 'var(--color-info)' },
  pantry: { label: 'Pantry', icon: Package, color: 'var(--color-primary)' },
}

export function PantryTab() {
  const [activeLocation, setActiveLocation] = useState<PantryLocation | 'all'>('all')
  const [isAdding, setIsAdding] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemLocation, setNewItemLocation] = useState<PantryLocation>('pantry')
  const [newItemQuantity, setNewItemQuantity] = useState('')

  // Query pantry items
  const pantryItemsData = useQuery(api.pantryItems.list)

  // Mutations
  const addPantryItem = useMutation(api.pantryItems.add)
  const removePantryItem = useMutation(api.pantryItems.remove)
  const updatePantryItem = useMutation(api.pantryItems.update)

  const isLoading = pantryItemsData === undefined

  const items: PantryItem[] = pantryItemsData ?? []

  // Filter items by location
  const filteredItems = activeLocation === 'all'
    ? items
    : items.filter(item => item.location === activeLocation)

  // Group items by location for display
  const groupedItems = (activeLocation === 'all' ? ['fridge', 'freezer', 'pantry'] as PantryLocation[] : [activeLocation])
    .map(loc => ({
      location: loc,
      items: items.filter(item => item.location === loc),
    }))
    .filter(group => group.items.length > 0 || activeLocation !== 'all')

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newItemName.trim()
    if (!name) return

    try {
      await addPantryItem({
        name,
        location: newItemLocation,
        quantity: newItemQuantity.trim() || undefined,
      })
      setNewItemName('')
      setNewItemQuantity('')
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to add pantry item:', error)
    }
  }

  const handleDeleteItem = async (id: Id<'pantryItems'>) => {
    try {
      await removePantryItem({ id })
    } catch (error) {
      console.error('Failed to delete pantry item:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <p style={{ color: 'var(--color-muted)' }}>Loading pantry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Location filter tabs */}
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveLocation('all')}
            className="px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap flex-shrink-0"
            style={{
              backgroundColor: activeLocation === 'all' ? 'var(--color-primary-tint)' : 'var(--color-card)',
              borderColor: activeLocation === 'all' ? 'var(--color-primary)' : 'var(--color-border)',
              color: activeLocation === 'all' ? 'var(--color-primary)' : 'var(--color-text)',
            }}
          >
            All
          </button>
          {(['fridge', 'freezer', 'pantry'] as PantryLocation[]).map(loc => {
            const config = locationConfig[loc]
            const Icon = config.icon
            const count = items.filter(i => i.location === loc).length
            return (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLocation(loc)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap flex-shrink-0"
                style={{
                  backgroundColor: activeLocation === loc ? 'var(--color-primary-tint)' : 'var(--color-card)',
                  borderColor: activeLocation === loc ? 'var(--color-primary)' : 'var(--color-border)',
                  color: activeLocation === loc ? 'var(--color-primary)' : 'var(--color-text)',
                }}
              >
                <Icon size={14} />
                {config.label}
                {count > 0 && (
                  <span className="ml-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                    ({count})
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <Package size={32} style={{ color: 'var(--color-muted)' }} />
            </div>
            <p className="font-medium" style={{ color: 'var(--color-muted)' }}>
              Your pantry is empty
            </p>
            <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-muted)' }}>
              Add items to track what you have on hand
            </p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Plus size={18} />
              Add first item
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedItems.map(group => {
              const config = locationConfig[group.location]
              const Icon = config.icon
              return (
                <div key={group.location}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={16} style={{ color: config.color }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                      {config.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      ({group.items.length})
                    </span>
                  </div>
                  {group.items.length === 0 ? (
                    <p className="text-sm py-4" style={{ color: 'var(--color-muted)' }}>
                      No items in {config.label.toLowerCase()}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {group.items.map(item => (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 p-3 rounded-xl border"
                          style={{
                            backgroundColor: 'var(--color-card)',
                            borderColor: 'var(--color-border)',
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                              {item.name}
                            </span>
                            {item.quantity && (
                              <span className="ml-2 text-sm" style={{ color: 'var(--color-muted)' }}>
                                ({item.quantity})
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item._id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--color-danger)' }}
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add item button (fixed at bottom when not in adding mode) */}
      {!isAdding && items.length > 0 && (
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus size={18} />
            Add item
          </button>
        </div>
      )}

      {/* Add item form modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setIsAdding(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            style={{
              backgroundColor: 'var(--color-card)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <form onSubmit={handleAddItem}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  Add to Pantry
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Item name
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g., Olive oil"
                    autoFocus
                    className="w-full h-11 px-3 rounded-xl border text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Location
                  </label>
                  <div className="flex gap-2">
                    {(['fridge', 'freezer', 'pantry'] as PantryLocation[]).map(loc => {
                      const config = locationConfig[loc]
                      const Icon = config.icon
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setNewItemLocation(loc)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors"
                          style={{
                            backgroundColor: newItemLocation === loc ? 'var(--color-primary-tint)' : 'var(--color-bg)',
                            borderColor: newItemLocation === loc ? 'var(--color-primary)' : 'var(--color-border)',
                            color: newItemLocation === loc ? 'var(--color-primary)' : 'var(--color-text)',
                          }}
                        >
                          <Icon size={14} />
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Quantity (optional)
                  </label>
                  <input
                    type="text"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="e.g., 2 bottles"
                    className="w-full h-11 px-3 rounded-xl border text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="w-full px-4 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Add to {locationConfig[newItemLocation].label}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
