// =============================================================================
// Data Types
// =============================================================================

export type GroceryCategory =
  | 'Produce'
  | 'Dairy'
  | 'Meat'
  | 'Pantry'
  | 'Frozen'
  | 'Bakery'
  | 'Beverages'
  | 'Other'

export interface GroceryStore {
  id: string
  name: string
}

export interface MealSource {
  mealId: string
  mealName: string
  /** Date the meal is planned for */
  date: string
}

export interface GroceryItem {
  id: string
  name: string
  category: GroceryCategory
  quantity: string
  isChecked: boolean
  organicRequired: boolean
  storeId?: string
  /** Which meal(s) this item is for (empty/undefined if manually added) */
  mealSources?: MealSource[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface GroceryListProps {
  /** Stores the household typically shops at */
  stores: GroceryStore[]
  /** The list of grocery items to display */
  items: GroceryItem[]
  /** Sync status indicator */
  syncStatus?: 'synced' | 'syncing' | 'offline'
  /** Called when user adds a new item via text input */
  onAddItem?: (name: string, options?: { storeId?: string; quantity?: string }) => void
  /** Called when user taps the mic button to add via voice */
  onVoiceInput?: () => void
  /** Called when user checks or unchecks an item */
  onToggleChecked?: (id: string) => void
  /** Called when user deletes an item */
  onDeleteItem?: (id: string) => void

  /** Called when user edits an item (name/quantity) */
  onUpdateItem?: (id: string, updates: { name?: string; quantity?: string }) => void

  /** Called when user changes the store for an item */
  onChangeItemStore?: (id: string, storeId?: string) => void

  /**
   * Move/reorder an item.
   * - If storeId changes, the item moves to a different store section.
   * - If beforeId is provided, the item is inserted before that item within the store.
   * - If beforeId is null/undefined, the item moves to the end of that store.
   */
  onMoveItem?: (id: string, options: { storeId?: string; beforeId?: string | null }) => void

  /** Store management */
  onAddStore?: (name: string) => void
  onRenameStore?: (id: string, name: string) => void
  onDeleteStore?: (id: string) => void
}
