'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { RequireAuth } from '@/components/RequireAuth'
import {
  ArrowLeft,
  Clock,
  ChefHat,
  Sparkles,
  FileText,
  Camera,
  Edit,
  Printer,
  Trash2,
  Calendar,
} from 'lucide-react'
import { useState } from 'react'

const effortLabels: Record<string, string> = {
  'super-easy': 'Super Easy',
  'middle': 'Medium',
  'more-prep': 'More Prep',
}

const sourceLabels: Record<string, { label: string; icon: typeof Sparkles }> = {
  ai: { label: 'AI Suggested', icon: Sparkles },
  manual: { label: 'Added Manually', icon: FileText },
  scanned: { label: 'Scanned Card', icon: Camera },
}

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Query recipe
  const recipe = useQuery(api.recipes.get, { id: recipeId as Id<'recipes'> })

  // Mutations
  const deleteRecipe = useMutation(api.recipes.remove)

  const handleBack = () => {
    router.back()
  }

  const handleEdit = () => {
    router.push(`/recipes/${recipeId}/edit`)
  }

  const handlePrint = () => {
    // TODO: Implement print preview
    router.push(`/recipes/${recipeId}/print`)
  }

  const handleDelete = async () => {
    try {
      await deleteRecipe({ id: recipeId as Id<'recipes'> })
      router.push('/recipes')
    } catch (error) {
      console.error('Failed to delete recipe:', error)
    }
  }

  const handleUseinMealPlan = () => {
    // TODO: Navigate to meal planning with this recipe pre-selected
    router.push('/weekly-planning')
  }

  if (recipe === undefined) {
    return (
      <RequireAuth>
        <div
          className="min-h-[calc(100vh-120px)] flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
            <p style={{ color: 'var(--color-muted)' }}>Loading recipe...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  if (recipe === null) {
    return (
      <RequireAuth>
        <div
          className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <ChefHat size={48} style={{ color: 'var(--color-muted)' }} />
          <h2
            className="text-lg font-semibold mt-4"
            style={{ color: 'var(--color-text)' }}
          >
            Recipe not found
          </h2>
          <button
            type="button"
            onClick={() => router.push('/recipes')}
            className="mt-4 px-4 py-2 rounded-xl font-semibold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            Back to Recipes
          </button>
        </div>
      </RequireAuth>
    )
  }

  const totalTime = recipe.prepTime + recipe.cookTime
  const sourceInfo = recipe.source ? sourceLabels[recipe.source] : null
  const SourceIcon = sourceInfo?.icon

  return (
    <RequireAuth>
      <div
        className="min-h-[calc(100vh-120px)]"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--color-muted)' }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleEdit}
                className="p-2 rounded-lg"
                style={{ color: 'var(--color-muted)' }}
                aria-label="Edit recipe"
              >
                <Edit size={20} />
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 rounded-lg"
                style={{ color: 'var(--color-muted)' }}
                aria-label="Print recipe"
              >
                <Printer size={20} />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg"
                style={{ color: 'var(--color-danger)' }}
                aria-label="Delete recipe"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-8">
          {/* Photo */}
          {recipe.photoUrl ? (
            <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-4">
              <img
                src={recipe.photoUrl}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-full aspect-[16/9] rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <ChefHat size={48} style={{ color: 'var(--color-muted)' }} />
            </div>
          )}

          {/* Title and source */}
          <h1
            className="text-2xl font-bold font-heading mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            {recipe.name}
          </h1>

          {sourceInfo && SourceIcon && (
            <div
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-3"
              style={{
                backgroundColor: 'var(--color-primary-tint)',
                color: 'var(--color-primary)',
              }}
            >
              <SourceIcon size={12} />
              {sourceInfo.label}
            </div>
          )}

          {recipe.description && (
            <p className="mb-4" style={{ color: 'var(--color-muted)' }}>
              {recipe.description}
            </p>
          )}

          {/* Stats */}
          <div
            className="flex items-center gap-4 p-3 rounded-xl border mb-4"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ color: 'var(--color-muted)' }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Total Time</p>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                  {totalTime} min
                </p>
              </div>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: 'var(--color-border)' }} />
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Effort</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                {effortLabels[recipe.effortTier]}
              </p>
            </div>
            {recipe.cuisineTags && recipe.cuisineTags.length > 0 && (
              <>
                <div className="w-px h-8" style={{ backgroundColor: 'var(--color-border)' }} />
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Cuisine</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                    {recipe.cuisineTags[0]}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Ingredients */}
          <section className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted)' }}
            >
              Ingredients
            </h2>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    borderBottom: index < recipe.ingredients.length - 1 ? '1px solid var(--color-border)' : undefined,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <span style={{ color: 'var(--color-text)' }}>
                    {ingredient.quantity} {ingredient.unit && `${ingredient.unit} `}{ingredient.name}
                    {ingredient.isOrganic && (
                      <span
                        className="ml-1 text-xs px-1 rounded"
                        style={{
                          backgroundColor: 'var(--color-secondary-tint)',
                          color: 'var(--color-secondary)',
                        }}
                      >
                        organic
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-muted)' }}
            >
              Instructions
            </h2>
            <div className="space-y-3">
              {recipe.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold text-white"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {index + 1}
                  </div>
                  <p style={{ color: 'var(--color-text)' }}>{step}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Notes */}
          {recipe.notes && (
            <section className="mb-6">
              <h2
                className="text-sm font-bold uppercase tracking-wide mb-3"
                style={{ color: 'var(--color-muted)' }}
              >
                Notes
              </h2>
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <p style={{ color: 'var(--color-text)' }}>{recipe.notes}</p>
              </div>
            </section>
          )}

          {/* Action button */}
          <button
            type="button"
            onClick={handleUseinMealPlan}
            className="w-full px-4 py-3 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Calendar size={18} />
            Use in Meal Plan
          </button>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              onClick={() => setShowDeleteConfirm(false)}
            />
            <div
              className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto rounded-2xl p-5"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                Delete recipe?
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                &quot;{recipe.name}&quot; will be permanently removed from your library.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white"
                  style={{ backgroundColor: 'var(--color-danger)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  )
}
