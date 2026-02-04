'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { api } from '../../../convex/_generated/api'
import { RequireAuth } from '@/components/RequireAuth'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import {
  BookOpen,
  MessageCircle,
  Search,
  Grid,
  List,
  Plus,
  Camera,
  Filter,
  X,
} from 'lucide-react'

type ViewMode = 'list' | 'grid'
type EffortFilter = 'all' | 'super-easy' | 'middle' | 'more-prep'

export default function RecipesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [effortFilter, setEffortFilter] = useState<EffortFilter>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Query recipes with search
  const recipes = useQuery(api.recipes.search, {
    query: searchQuery || undefined,
    effortTier: effortFilter === 'all' ? undefined : effortFilter,
  })

  const isLoading = recipes === undefined

  const handleRecipeClick = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`)
  }

  const handleAddRecipe = () => {
    router.push('/recipes/add')
  }

  const handleScanRecipe = () => {
    router.push('/recipes/scan')
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const effortOptions = [
    { value: 'all' as const, label: 'All Efforts' },
    { value: 'super-easy' as const, label: 'Super Easy' },
    { value: 'middle' as const, label: 'Medium' },
    { value: 'more-prep' as const, label: 'More Prep' },
  ]

  return (
    <RequireAuth>
      <div
        className="flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg)',
          minHeight: '100vh',
          paddingBottom: 'var(--bottom-nav-total)',
        }}
      >
        {/* Centered container for consistent width */}
        <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1
                className="text-xl font-bold font-heading"
                style={{ color: 'var(--color-text)' }}
              >
                Recipes
              </h1>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--color-muted)' }}>
                {recipes ? `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}` : 'Loading...'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: viewMode === 'list' ? 'var(--color-primary-tint)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-muted)',
                }}
                aria-label="List view"
              >
                <List size={20} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: viewMode === 'grid' ? 'var(--color-primary-tint)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-muted)',
                }}
                aria-label="Grid view"
              >
                <Grid size={20} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-full h-10 pl-10 pr-10 rounded-xl border text-sm"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="h-10 px-3 rounded-xl border transition-colors"
              style={{
                backgroundColor: showFilters || effortFilter !== 'all' ? 'var(--color-primary-tint)' : 'var(--color-card)',
                borderColor: showFilters || effortFilter !== 'all' ? 'var(--color-primary)' : 'var(--color-border)',
                color: showFilters || effortFilter !== 'all' ? 'var(--color-primary)' : 'var(--color-muted)',
              }}
              aria-label="Filter recipes"
            >
              <Filter size={18} />
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {effortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEffortFilter(option.value)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                  style={{
                    backgroundColor: effortFilter === option.value ? 'var(--color-primary-tint)' : 'var(--color-card)',
                    borderColor: effortFilter === option.value ? 'var(--color-primary)' : 'var(--color-border)',
                    color: effortFilter === option.value ? 'var(--color-primary)' : 'var(--color-text)',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
                <p style={{ color: 'var(--color-muted)' }}>Loading recipes...</p>
              </div>
            </div>
          ) : recipes.length === 0 ? (
            // Empty state
            <div className="flex-1 flex flex-col items-center justify-center py-16">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--color-card)' }}
              >
                <BookOpen size={40} style={{ color: 'var(--color-muted)' }} />
              </div>

              {searchQuery || effortFilter !== 'all' ? (
                <>
                  <h2
                    className="text-lg font-semibold text-center mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    No recipes found
                  </h2>
                  <p
                    className="text-sm text-center max-w-xs mb-6"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Try adjusting your search or filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setEffortFilter('all')
                    }}
                    className="px-4 py-2 rounded-xl font-semibold text-sm"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <h2
                    className="text-lg font-semibold text-center mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Your recipe library is empty
                  </h2>

                  <p
                    className="text-sm text-center max-w-xs mb-8"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Save recipes from meal plans, add your own favorites, or scan recipe cards.
                  </p>

                  {/* Zylo prompt */}
                  <div
                    className="w-full max-w-sm p-4 rounded-2xl border mb-6"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--color-primary-tint)' }}
                      >
                        <MessageCircle size={20} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium mb-1"
                          style={{ color: 'var(--color-text)' }}
                        >
                          Hey, I&apos;m Zylo!
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          Start by adding your favorite recipes. I&apos;ll help you plan meals around them!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add buttons */}
                  <div className="flex flex-col gap-3 w-full max-w-sm">
                    <button
                      type="button"
                      onClick={handleAddRecipe}
                      className="w-full px-4 py-3 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <Plus size={18} />
                      Add Recipe
                    </button>
                    <button
                      type="button"
                      onClick={handleScanRecipe}
                      className="w-full px-4 py-3 rounded-xl font-semibold border inline-flex items-center justify-center gap-2 transition-colors"
                      style={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <Camera size={18} />
                      Scan Recipe Card
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Recipe list/grid
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 gap-3'
                  : 'space-y-3'
              }
            >
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  viewMode={viewMode}
                  onClick={() => handleRecipeClick(recipe._id)}
                />
              ))}
            </div>
          )}
        </div>
        </div>{/* End centered container */}

        {/* Floating action button when recipes exist */}
        {recipes && recipes.length > 0 && (
          <div className="fixed bottom-[calc(var(--bottom-nav-total)+1rem)] right-4 z-40">
            <button
              type="button"
              onClick={handleAddRecipe}
              className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-label="Add recipe"
            >
              <Plus size={24} />
            </button>
          </div>
        )}
      </div>
    </RequireAuth>
  )
}
