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
      <div className="flex flex-col h-[calc(100vh-120px)]" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Sub-tab bar */}
        <div
          className="flex border-b"
          style={{ borderColor: 'var(--color-border)' }}
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

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'shopping' && <ShoppingTab />}
          {activeTab === 'pantry' && <PantryTab />}
        </div>
      </div>
    </RequireAuth>
  )
}
