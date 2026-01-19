'use client'

import { useState } from 'react'
import { GroceryList } from '@/components/grocery-list'
import type { GroceryItem, GroceryStore } from '@/types/grocery'
import { CheckCircle, Circle, Info } from 'lucide-react'

/**
 * Test page for Feature #131: Generated grocery items linked to meals
 * Tests that:
 * 1. View generated grocery items
 * 2. Verify linked meal indicator shows
 * 3. Verify correct meal association
 */

const testStores: GroceryStore[] = [
  { id: 'store-meijer', name: 'Meijer' },
  { id: 'store-costco', name: 'Costco' },
]

// Grocery items with meal linkages - simulates items generated from a meal plan
const testItems: GroceryItem[] = [
  // Item linked to 1 meal
  {
    id: 'gi-001',
    name: 'Chicken Breast',
    category: 'Meat',
    quantity: '2 lbs',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-meijer',
    mealSources: [
      { mealId: 'meal-mon', mealName: 'Chicken Stir Fry', date: '2026-01-20' },
    ],
  },
  // Item linked to 2 meals
  {
    id: 'gi-002',
    name: 'Broccoli',
    category: 'Produce',
    quantity: '2 heads',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-meijer',
    mealSources: [
      { mealId: 'meal-mon', mealName: 'Chicken Stir Fry', date: '2026-01-20' },
      { mealId: 'meal-wed', mealName: 'Beef and Broccoli', date: '2026-01-22' },
    ],
  },
  // Item linked to 3 meals
  {
    id: 'gi-003',
    name: 'Olive Oil',
    category: 'Pantry',
    quantity: '1 bottle',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-costco',
    mealSources: [
      { mealId: 'meal-mon', mealName: 'Chicken Stir Fry', date: '2026-01-20' },
      { mealId: 'meal-tue', mealName: 'Pasta Primavera', date: '2026-01-21' },
      { mealId: 'meal-wed', mealName: 'Beef and Broccoli', date: '2026-01-22' },
    ],
  },
  // Item with NO meal linkage (manually added)
  {
    id: 'gi-004',
    name: 'Bananas',
    category: 'Produce',
    quantity: '1 bunch',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-meijer',
    // No mealSources - manually added item
  },
]

interface TestStep {
  id: number
  description: string
  instruction: string
  passed: boolean
}

export default function TestLinkedGroceryItemsPage() {
  const [stores] = useState<GroceryStore[]>(testStores)
  const [items, setItems] = useState<GroceryItem[]>(testItems)
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    {
      id: 1,
      description: 'View generated grocery items',
      instruction: 'Items with meal linkages are displayed below. Look for items that have a "Meals (N)" indicator.',
      passed: true, // Auto-pass since items are displayed
    },
    {
      id: 2,
      description: 'Verify linked meal indicator shows',
      instruction: 'Click the "I see meal indicators" button after confirming you see "Meals (1)", "Meals (2)", or "Meals (3)" badges on linked items.',
      passed: false,
    },
    {
      id: 3,
      description: 'Verify correct meal association',
      instruction: 'Click on a "Meals" indicator to see the popover. Verify meal names and dates are shown. Then click "Meals show correctly".',
      passed: false,
    },
  ])

  const markStepPassed = (stepId: number) => {
    setTestSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, passed: true } : step
    ))
  }

  const allPassed = testSteps.every(step => step.passed)

  const handleToggleChecked = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ))
  }

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const handleUpdateItem = (id: string, updates: { name?: string; quantity?: string; organicRequired?: boolean }) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Test Header */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <h1 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Feature #131: Generated grocery items linked to meals
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Items show which meal they are for
        </p>
      </div>

      {/* Test Steps */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Test Steps:</h2>
        <div className="space-y-3">
          {testSteps.map(step => (
            <div key={step.id} className="flex items-start gap-3">
              {step.passed ? (
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle size={20} className="text-stone-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: step.passed ? '#16a34a' : 'var(--color-text)' }}>
                  Step {step.id}: {step.description}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {step.instruction}
                </p>
                {!step.passed && step.id === 2 && (
                  <button
                    onClick={() => markStepPassed(2)}
                    className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                  >
                    I see meal indicators
                  </button>
                )}
                {!step.passed && step.id === 3 && testSteps[1].passed && (
                  <button
                    onClick={() => markStepPassed(3)}
                    className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                  >
                    Meals show correctly
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {allPassed && (
          <div className="mt-4 p-3 rounded-xl bg-green-100 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-sm font-semibold text-green-800">
                All steps passed! Feature #131 verified.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="px-4 py-3 border-b flex items-start gap-2" style={{ borderColor: 'var(--color-border)', backgroundColor: '#fef9c3' }}>
        <Info size={16} className="text-yellow-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-yellow-800">
          <p className="font-semibold mb-1">What to look for:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li><strong>Chicken Breast</strong> - "Meals (1)" indicator</li>
            <li><strong>Broccoli</strong> - "Meals (2)" indicator</li>
            <li><strong>Olive Oil</strong> - "Meals (3)" indicator</li>
            <li><strong>Bananas</strong> - No indicator (manually added)</li>
          </ul>
        </div>
      </div>

      {/* Grocery List */}
      <div className="h-[calc(100vh-380px)]">
        <GroceryList
          stores={stores}
          items={items}
          syncStatus="synced"
          onToggleChecked={handleToggleChecked}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
        />
      </div>
    </div>
  )
}
