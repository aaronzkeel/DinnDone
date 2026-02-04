'use client'

import { useState } from 'react'
import { ShoppingCart, Package } from 'lucide-react'
import { RequireAuth } from '@/components/RequireAuth'
import { ShoppingTab } from './components/ShoppingTab'
import { PantryTab } from './components/PantryTab'

type KitchenTab = 'shopping' | 'pantry'

export default function KitchenPage() {
  const [activeTab, setActiveTab] = useState<KitchenTab>('shopping')

  return (
    <RequireAuth>
      {/*
        Main container: fills available viewport height above the bottom nav.
        Uses CSS custom property --bottom-nav-total for proper spacing.
      */}
      <div
        className="flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg)',
          minHeight: 'calc(100vh - var(--bottom-nav-total))',
          paddingBottom: 'var(--bottom-nav-total)',
        }}
      >
        {/* Sub-tab bar - sticky at top */}
        <div
          className="sticky top-0 z-20 flex border-b"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('shopping')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors relative"
            style={{
              color: activeTab === 'shopping' ? 'var(--color-primary)' : 'var(--color-muted)',
            }}
          >
            <ShoppingCart size={18} />
            Shopping
            {activeTab === 'shopping' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pantry')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors relative"
            style={{
              color: activeTab === 'pantry' ? 'var(--color-primary)' : 'var(--color-muted)',
            }}
          >
            <Package size={18} />
            Pantry
            {activeTab === 'pantry' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
            )}
          </button>
        </div>

        {/* Tab content - grows to fill space */}
        <div className="flex-1">
          {activeTab === 'shopping' && <ShoppingTab />}
          {activeTab === 'pantry' && <PantryTab />}
        </div>
      </div>
    </RequireAuth>
  )
}
