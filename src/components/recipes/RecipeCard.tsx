'use client'

import { Clock, ChefHat, Sparkles, FileText, Camera } from 'lucide-react'
import type { Id } from '../../../convex/_generated/dataModel'

interface Recipe {
  _id: Id<'recipes'>
  name: string
  description?: string
  effortTier: 'super-easy' | 'middle' | 'more-prep'
  prepTime: number
  cookTime: number
  photoUrl?: string
  source?: 'ai' | 'manual' | 'scanned'
  cuisineTags?: string[]
}

interface RecipeCardProps {
  recipe: Recipe
  onClick?: () => void
  viewMode?: 'list' | 'grid'
}

const effortLabels: Record<string, string> = {
  'super-easy': 'Super Easy',
  'middle': 'Medium',
  'more-prep': 'More Prep',
}

const sourceIcons: Record<string, typeof Sparkles> = {
  ai: Sparkles,
  manual: FileText,
  scanned: Camera,
}

export function RecipeCard({ recipe, onClick, viewMode = 'list' }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime
  const SourceIcon = recipe.source ? sourceIcons[recipe.source] : null

  if (viewMode === 'grid') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-left w-full rounded-2xl overflow-hidden border transition-transform active:scale-[0.98]"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Photo area */}
        <div
          className="aspect-[4/3] relative"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          {recipe.photoUrl ? (
            <img
              src={recipe.photoUrl}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat size={32} style={{ color: 'var(--color-muted)' }} />
            </div>
          )}
          {/* Source indicator */}
          {SourceIcon && (
            <div
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <SourceIcon size={12} style={{ color: 'var(--color-primary)' }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3
            className="font-semibold text-sm line-clamp-2 mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            {recipe.name}
          </h3>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
            <Clock size={12} />
            <span>{totalTime} min</span>
            <span>·</span>
            <span>{effortLabels[recipe.effortTier]}</span>
          </div>
        </div>
      </button>
    )
  }

  // List view
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full flex gap-3 p-3 rounded-2xl border transition-transform active:scale-[0.99]"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Thumbnail */}
      <div
        className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {recipe.photoUrl ? (
          <img
            src={recipe.photoUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ChefHat size={24} style={{ color: 'var(--color-muted)' }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-sm line-clamp-1"
            style={{ color: 'var(--color-text)' }}
          >
            {recipe.name}
          </h3>
          {SourceIcon && (
            <SourceIcon size={14} className="flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
          )}
        </div>
        {recipe.description && (
          <p
            className="text-xs line-clamp-1 mt-0.5"
            style={{ color: 'var(--color-muted)' }}
          >
            {recipe.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
          <Clock size={12} />
          <span>{totalTime} min</span>
          <span>·</span>
          <span>{effortLabels[recipe.effortTier]}</span>
          {recipe.cuisineTags && recipe.cuisineTags.length > 0 && (
            <>
              <span>·</span>
              <span>{recipe.cuisineTags[0]}</span>
            </>
          )}
        </div>
      </div>
    </button>
  )
}
