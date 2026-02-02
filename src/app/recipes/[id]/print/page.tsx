'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'
import { RequireAuth } from '@/components/RequireAuth'
import { ArrowLeft, Printer, Construction, FileText } from 'lucide-react'

export default function PrintRecipePage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string

  const recipe = useQuery(api.recipes.get, { id: recipeId as Id<'recipes'> })

  if (recipe === undefined) {
    return (
      <RequireAuth>
        <div
          className="min-h-[calc(100vh-120px)] flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
            <p style={{ color: 'var(--color-muted)' }}>Loading...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

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
            <Printer size={40} style={{ color: 'var(--color-primary)' }} />
          </div>

          <h1
            className="text-xl font-bold font-heading text-center mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Print Recipe Card
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <Construction size={16} style={{ color: 'var(--color-warning)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>
              Coming Soon
            </p>
          </div>

          {recipe && (
            <p
              className="text-sm text-center mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Recipe: <strong>{recipe.name}</strong>
            </p>
          )}

          <p
            className="text-sm text-center max-w-xs mb-8"
            style={{ color: 'var(--color-muted)' }}
          >
            Download your recipe as a PDF formatted for 4x6 card stock printing.
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
              Template Options:
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li className="flex items-center gap-2">
                <FileText size={14} />
                Classic: Front/back layout
              </li>
              <li className="flex items-center gap-2">
                <FileText size={14} />
                Compact: Everything on front
              </li>
              <li className="flex items-center gap-2">
                <FileText size={14} />
                Photo-forward: Large photo
              </li>
              <li className="flex items-center gap-2">
                <FileText size={14} />
                Text-only: No photo, larger text
              </li>
            </ul>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
