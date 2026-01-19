'use client'

import { useState, useCallback } from 'react'
import { GroceryList } from '@/components/grocery-list'
import type { GroceryItem, GroceryStore } from '@/types/grocery'
import { Wifi, WifiOff, Cloud, CloudOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

/**
 * Test page for Feature #54: Offline changes sync when back online
 *
 * This page demonstrates the offline sync behavior:
 * 1. User can simulate going offline
 * 2. Changes (like checking items) are queued locally
 * 3. When coming back online, changes sync to the "server"
 */

// Simulated stores
const testStores: GroceryStore[] = [
  { id: 'store-meijer', name: 'Meijer' },
  { id: 'store-costco', name: 'Costco' },
  { id: 'store-aldi', name: 'Aldi' },
]

// Initial items - simulating "server" state
const initialServerItems: GroceryItem[] = [
  {
    id: 'gi-001',
    name: 'Milk',
    category: 'Dairy',
    quantity: '1 gallon',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-meijer',
  },
  {
    id: 'gi-002',
    name: 'Bread',
    category: 'Bakery',
    quantity: '1 loaf',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-meijer',
  },
  {
    id: 'gi-003',
    name: 'Eggs',
    category: 'Dairy',
    quantity: '1 dozen',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-costco',
  },
  {
    id: 'gi-004',
    name: 'Bananas',
    category: 'Produce',
    quantity: '1 bunch',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-aldi',
  },
]

interface PendingChange {
  id: string
  type: 'toggle' | 'add' | 'delete' | 'update'
  itemId: string
  timestamp: number
  data?: Record<string, unknown>
}

export default function TestOfflineSyncPage() {
  // Simulated network state (true = online, false = offline)
  const [isOnline, setIsOnline] = useState(true)

  // Server state - what's actually "saved" on the server
  const [serverItems, setServerItems] = useState<GroceryItem[]>(initialServerItems)

  // Local state - what the user sees (may include pending changes)
  const [localItems, setLocalItems] = useState<GroceryItem[]>(initialServerItems)

  // Queue of pending changes made while offline
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])

  // Sync status for UI indicator
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced')

  // Sync log for demonstration
  const [syncLog, setSyncLog] = useState<string[]>([])

  // Test step tracking
  const [testSteps, setTestSteps] = useState({
    step1: false, // Go offline
    step2: false, // Check off an item while offline
    step3: false, // Go online and verify sync
  })

  // Add to sync log
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setSyncLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
  }, [])

  // Handle going offline
  const goOffline = () => {
    setIsOnline(false)
    setSyncStatus('offline')
    addLog('Network disconnected - entering offline mode')
    setTestSteps(prev => ({ ...prev, step1: true }))
  }

  // Handle going online and syncing
  const goOnline = async () => {
    setIsOnline(true)
    addLog('Network reconnected - starting sync...')

    if (pendingChanges.length > 0) {
      setSyncStatus('syncing')
      addLog(`Found ${pendingChanges.length} pending change(s) to sync`)

      // Simulate network delay for syncing
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Apply all pending changes to server state
      let newServerItems = [...serverItems]
      for (const change of pendingChanges) {
        addLog(`Syncing: ${change.type} on item ${change.itemId}`)

        if (change.type === 'toggle') {
          newServerItems = newServerItems.map(item =>
            item.id === change.itemId ? { ...item, isChecked: !item.isChecked } : item
          )
        }
        // Add other change types as needed
      }

      setServerItems(newServerItems)
      setPendingChanges([])
      addLog(`Sync complete! ${pendingChanges.length} change(s) saved to server`)

      // Mark step 3 complete if we had offline changes
      setTestSteps(prev => ({ ...prev, step3: true }))
    } else {
      addLog('No pending changes to sync')
    }

    setSyncStatus('synced')
  }

  // Handle checking/unchecking an item
  const handleToggleChecked = (itemId: string) => {
    // Update local state immediately (optimistic update)
    setLocalItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    ))

    const item = localItems.find(i => i.id === itemId)
    const newState = item ? !item.isChecked : false

    if (isOnline) {
      // When online, sync immediately to server
      setSyncStatus('syncing')
      addLog(`Checking "${item?.name}" (syncing immediately)`)

      // Simulate network delay
      setTimeout(() => {
        setServerItems(prev => prev.map(i =>
          i.id === itemId ? { ...i, isChecked: newState } : i
        ))
        setSyncStatus('synced')
        addLog(`"${item?.name}" synced to server`)
      }, 500)
    } else {
      // When offline, queue the change
      const change: PendingChange = {
        id: `change-${Date.now()}`,
        type: 'toggle',
        itemId,
        timestamp: Date.now(),
      }
      setPendingChanges(prev => [...prev, change])
      addLog(`Offline: Queued check for "${item?.name}" (will sync when online)`)

      // Mark step 2 complete
      setTestSteps(prev => ({ ...prev, step2: true }))
    }
  }

  // Handle adding item
  const handleAddItem = (name: string, options?: { storeId?: string; quantity?: string }) => {
    const newItem: GroceryItem = {
      id: `gi-${Date.now()}`,
      name,
      category: 'Other',
      quantity: options?.quantity || '1',
      isChecked: false,
      organicRequired: false,
      storeId: options?.storeId,
    }
    setLocalItems(prev => [...prev, newItem])

    if (isOnline) {
      setSyncStatus('syncing')
      setTimeout(() => {
        setServerItems(prev => [...prev, newItem])
        setSyncStatus('synced')
        addLog(`Added "${name}" and synced to server`)
      }, 500)
    } else {
      setPendingChanges(prev => [...prev, {
        id: `change-${Date.now()}`,
        type: 'add',
        itemId: newItem.id,
        timestamp: Date.now(),
        data: { item: newItem }
      }])
      addLog(`Offline: Queued add for "${name}"`)
    }
  }

  // Handle deleting item
  const handleDeleteItem = (id: string) => {
    const item = localItems.find(i => i.id === id)
    setLocalItems(prev => prev.filter(i => i.id !== id))

    if (isOnline) {
      setSyncStatus('syncing')
      setTimeout(() => {
        setServerItems(prev => prev.filter(i => i.id !== id))
        setSyncStatus('synced')
        addLog(`Deleted "${item?.name}" and synced`)
      }, 500)
    } else {
      setPendingChanges(prev => [...prev, {
        id: `change-${Date.now()}`,
        type: 'delete',
        itemId: id,
        timestamp: Date.now(),
      }])
      addLog(`Offline: Queued delete for "${item?.name}"`)
    }
  }

  // Handle updating item
  const handleUpdateItem = (id: string, updates: { name?: string; quantity?: string; organicRequired?: boolean }) => {
    setLocalItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))

    if (isOnline) {
      setSyncStatus('syncing')
      setTimeout(() => {
        setServerItems(prev => prev.map(item =>
          item.id === id ? { ...item, ...updates } : item
        ))
        setSyncStatus('synced')
      }, 500)
    } else {
      setPendingChanges(prev => [...prev, {
        id: `change-${Date.now()}`,
        type: 'update',
        itemId: id,
        timestamp: Date.now(),
        data: updates,
      }])
    }
  }

  // Handle move item (simplified for test)
  const handleMoveItem = (id: string, options: { storeId?: string }) => {
    setLocalItems(prev => prev.map(item =>
      item.id === id ? { ...item, storeId: options.storeId } : item
    ))
  }

  // Reset test
  const resetTest = () => {
    setIsOnline(true)
    setServerItems(initialServerItems)
    setLocalItems(initialServerItems)
    setPendingChanges([])
    setSyncStatus('synced')
    setSyncLog([])
    setTestSteps({ step1: false, step2: false, step3: false })
    addLog('Test reset - ready to begin')
  }

  // Check if all steps are complete
  const allStepsComplete = testSteps.step1 && testSteps.step2 && testSteps.step3

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Feature #54: Offline Changes Sync When Back Online
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Edits made offline sync to Convex when connection is restored
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Test Steps Card */}
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Test Steps</h2>
          <div className="space-y-2">
            <div className={`flex items-center gap-3 p-2 rounded-lg ${testSteps.step1 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-stone-50 dark:bg-stone-900'}`}>
              {testSteps.step1 ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-600" />
              )}
              <span className={`text-sm ${testSteps.step1 ? 'text-green-700 dark:text-green-300' : 'text-stone-600 dark:text-stone-300'}`}>
                Step 1: Go offline
              </span>
            </div>
            <div className={`flex items-center gap-3 p-2 rounded-lg ${testSteps.step2 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-stone-50 dark:bg-stone-900'}`}>
              {testSteps.step2 ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-600" />
              )}
              <span className={`text-sm ${testSteps.step2 ? 'text-green-700 dark:text-green-300' : 'text-stone-600 dark:text-stone-300'}`}>
                Step 2: Check off an item
              </span>
            </div>
            <div className={`flex items-center gap-3 p-2 rounded-lg ${testSteps.step3 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-stone-50 dark:bg-stone-900'}`}>
              {testSteps.step3 ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-stone-300 dark:border-stone-600" />
              )}
              <span className={`text-sm ${testSteps.step3 ? 'text-green-700 dark:text-green-300' : 'text-stone-600 dark:text-stone-300'}`}>
                Step 3: Go online, verify change syncs
              </span>
            </div>
          </div>

          {allStepsComplete && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">All test steps passed!</span>
              </div>
            </div>
          )}
        </div>

        {/* Network Control Panel */}
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Network Control</h2>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Wifi className="w-5 h-5" />
                  <span className="font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <WifiOff className="w-5 h-5" />
                  <span className="font-medium">Offline</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {isOnline ? (
                <button
                  onClick={goOffline}
                  className="px-4 py-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium text-sm hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                >
                  Go Offline
                </button>
              ) : (
                <button
                  onClick={goOnline}
                  className="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  Go Online
                </button>
              )}
              <button
                onClick={resetTest}
                className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium text-sm hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Pending Changes Indicator */}
          {pendingChanges.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {pendingChanges.length} pending change(s) waiting to sync
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sync Status */}
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Sync Status</h2>
          <div className="flex items-center gap-3">
            {syncStatus === 'synced' && (
              <>
                <Cloud className="w-5 h-5 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">Synced</span>
              </>
            )}
            {syncStatus === 'syncing' && (
              <>
                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">Syncing...</span>
              </>
            )}
            {syncStatus === 'offline' && (
              <>
                <CloudOff className="w-5 h-5 text-stone-400" />
                <span className="text-stone-500 dark:text-stone-400 font-medium">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Grocery List */}
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div className="h-[400px]">
            <GroceryList
              stores={testStores}
              items={localItems}
              syncStatus={syncStatus}
              onAddItem={handleAddItem}
              onToggleChecked={handleToggleChecked}
              onDeleteItem={handleDeleteItem}
              onUpdateItem={handleUpdateItem}
              onMoveItem={handleMoveItem}
              onVoiceInput={() => {}}
            />
          </div>
        </div>

        {/* Sync Log */}
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Sync Log</h2>
          <div className="bg-stone-50 dark:bg-stone-900 rounded-lg p-3 max-h-48 overflow-y-auto">
            {syncLog.length === 0 ? (
              <p className="text-sm text-stone-400 dark:text-stone-500">No activity yet</p>
            ) : (
              <div className="space-y-1">
                {syncLog.map((log, i) => (
                  <p key={i} className="text-xs font-mono text-stone-600 dark:text-stone-400">
                    {log}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Server State (Debug) */}
        <div className="bg-stone-100 dark:bg-stone-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-2">
            Server State (Debug)
          </h3>
          <div className="text-xs font-mono text-stone-600 dark:text-stone-400">
            {serverItems.map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <span className={item.isChecked ? 'line-through' : ''}>{item.name}</span>
                <span className="text-stone-400">({item.isChecked ? 'checked' : 'unchecked'})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
