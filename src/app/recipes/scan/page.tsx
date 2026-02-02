'use client'

import { useRouter } from 'next/navigation'
import { RequireAuth } from '@/components/RequireAuth'
import { ArrowLeft, Camera, Construction } from 'lucide-react'

export default function ScanRecipePage() {
  const router = useRouter()

  return (
    <RequireAuth>
      <div
        className="min-h-[calc(100vh-120px)] flex flex-col"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-muted)' }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Content - Coming Soon */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: 'var(--color-primary-tint)' }}
          >
            <Camera size={40} style={{ color: 'var(--color-primary)' }} />
          </div>

          <h1
            className="text-xl font-bold font-heading text-center mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Scan Recipe Card
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <Construction size={16} style={{ color: 'var(--color-warning)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>
              Coming Soon
            </p>
          </div>

          <p
            className="text-sm text-center max-w-xs mb-8"
            style={{ color: 'var(--color-muted)' }}
          >
            Take a photo of your recipe cards and let AI extract the ingredients and instructions automatically.
          </p>

          <div
            className="w-full max-w-sm p-4 rounded-2xl border"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              What you&apos;ll be able to do:
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li>• Take a photo of your recipe card</li>
              <li>• AI extracts title, ingredients, and steps</li>
              <li>• Review and edit with confidence scoring</li>
              <li>• Save to your recipe library</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => router.push('/recipes/add')}
            className="mt-8 px-4 py-3 rounded-xl font-semibold"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            Add Recipe Manually Instead
          </button>
        </div>
      </div>
    </RequireAuth>
  )
}
