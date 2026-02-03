'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'
import { RequireAuth } from '@/components/RequireAuth'
import {
  ArrowLeft,
  Plus,
  X,
  Save,
} from 'lucide-react'

type EffortTier = 'super-easy' | 'middle' | 'more-prep'
type CleanupRating = 1 | 2 | 3

interface IngredientInput {
  name: string
  quantity: string
  unit?: string
}

export default function EditRecipePage() {
  const params = useParams()
  const router = useRouter()
  // Cast safe: single-segment dynamic route, not catch-all
  const recipeId = params.id as string

  // Query existing recipe
  const recipe = useQuery(api.recipes.get, { id: recipeId as Id<'recipes'> })

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [effortTier, setEffortTier] = useState<EffortTier>('middle')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [cleanupRating, setCleanupRating] = useState<CleanupRating>(2)
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: '', quantity: '', unit: '' },
  ])
  const [steps, setSteps] = useState<string[]>([''])
  const [cuisineTags, setCuisineTags] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Mutation
  const updateRecipe = useMutation(api.recipes.update)

  // Initialize form when recipe loads
  useEffect(() => {
    if (recipe && !isInitialized) {
      setName(recipe.name)
      setDescription(recipe.description || '')
      setEffortTier(recipe.effortTier)
      setPrepTime(String(recipe.prepTime))
      setCookTime(String(recipe.cookTime))
      setCleanupRating(recipe.cleanupRating)
      setIngredients(
        recipe.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit || '',
        }))
      )
      setSteps(recipe.steps)
      setCuisineTags(recipe.cuisineTags?.join(', ') || '')
      setNotes(recipe.notes || '')
      setIsInitialized(true)
    }
  }, [recipe, isInitialized])

  const effortOptions = [
    { value: 'super-easy' as const, label: 'Super Easy', desc: '15 min or less' },
    { value: 'middle' as const, label: 'Medium', desc: '15-45 min' },
    { value: 'more-prep' as const, label: 'More Prep', desc: '45+ min' },
  ]

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }])
  }

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const handleIngredientChange = (index: number, field: keyof IngredientInput, value: string) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const handleAddStep = () => {
    setSteps([...steps, ''])
  }

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index))
    }
  }

  const handleStepChange = (index: number, value: string) => {
    const updated = [...steps]
    updated[index] = value
    setSteps(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)

    try {
      // Filter out empty ingredients and steps
      const validIngredients = ingredients
        .filter((i) => i.name.trim() && i.quantity.trim())
        .map((i) => ({
          name: i.name.trim(),
          quantity: i.quantity.trim(),
          unit: i.unit?.trim() || undefined,
        }))

      const validSteps = steps.filter((s) => s.trim())

      // Parse cuisine tags
      const tags = cuisineTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t)

      await updateRecipe({
        id: recipeId as Id<'recipes'>,
        name: name.trim(),
        description: description.trim() || undefined,
        effortTier,
        prepTime: parseInt(prepTime) || 0,
        cookTime: parseInt(cookTime) || 0,
        cleanupRating,
        ingredients: validIngredients.length > 0 ? validIngredients : [{ name: 'See notes', quantity: '1' }],
        steps: validSteps.length > 0 ? validSteps : ['See notes'],
        cuisineTags: tags.length > 0 ? tags : undefined,
        notes: notes.trim() || undefined,
      })

      router.push(`/recipes/${recipeId}`)
    } catch (error) {
      console.error('Failed to update recipe:', error)
      setIsSubmitting(false)
    }
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
          <h2
            className="text-lg font-semibold"
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

  return (
    <RequireAuth>
      <div
        className="min-h-[calc(100vh-120px)]"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--color-muted)' }}
            >
              <ArrowLeft size={16} />
              Cancel
            </button>
            <h1 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              Edit Recipe
            </h1>
            <div style={{ width: '60px' }} /> {/* Spacer */}
          </div>
        </div>

        {/* Form - same structure as Add page */}
        <form onSubmit={handleSubmit} className="px-4 pb-8 space-y-6">
          {/* Name */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text)' }}
            >
              Recipe Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grandma's Chicken Soup"
              required
              className="w-full h-11 px-3 rounded-xl border text-sm"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text)' }}
            >
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this recipe..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border text-sm resize-none"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {/* Effort tier */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Effort Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {effortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEffortTier(option.value)}
                  className="p-3 rounded-xl border text-center transition-colors"
                  style={{
                    backgroundColor: effortTier === option.value ? 'var(--color-primary-tint)' : 'var(--color-card)',
                    borderColor: effortTier === option.value ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: effortTier === option.value ? 'var(--color-primary)' : 'var(--color-text)' }}
                  >
                    {option.label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {option.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-text)' }}
              >
                Prep Time (min)
              </label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15"
                min="0"
                className="w-full h-11 px-3 rounded-xl border text-sm"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-text)' }}
              >
                Cook Time (min)
              </label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="30"
                min="0"
                className="w-full h-11 px-3 rounded-xl border text-sm"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </div>

          {/* Cleanup rating */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Cleanup Effort
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setCleanupRating(rating as CleanupRating)}
                  className="flex-1 py-2 rounded-xl border text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: cleanupRating === rating ? 'var(--color-primary-tint)' : 'var(--color-card)',
                    borderColor: cleanupRating === rating ? 'var(--color-primary)' : 'var(--color-border)',
                    color: cleanupRating === rating ? 'var(--color-primary)' : 'var(--color-text)',
                  }}
                >
                  {rating === 1 ? 'Easy' : rating === 2 ? 'Medium' : 'More'}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Ingredients
            </label>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    placeholder="1"
                    className="w-16 h-10 px-2 rounded-xl border text-sm text-center"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <input
                    type="text"
                    value={ingredient.unit || ''}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    placeholder="cup"
                    className="w-16 h-10 px-2 rounded-xl border text-sm text-center"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    placeholder="flour"
                    className="flex-1 h-10 px-3 rounded-xl border text-sm"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="p-2"
                      style={{ color: 'var(--color-danger)' }}
                      aria-label="Remove ingredient"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddIngredient}
                className="inline-flex items-center gap-1 text-sm font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                <Plus size={16} />
                Add ingredient
              </button>
            </div>
          </div>

          {/* Steps */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Instructions
            </label>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div
                    className="w-6 h-10 flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {index + 1}.
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder="Describe this step..."
                    rows={2}
                    className="flex-1 px-3 py-2 rounded-xl border text-sm resize-none"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="p-2 self-start"
                      style={{ color: 'var(--color-danger)' }}
                      aria-label="Remove step"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddStep}
                className="inline-flex items-center gap-1 text-sm font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                <Plus size={16} />
                Add step
              </button>
            </div>
          </div>

          {/* Cuisine tags */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text)' }}
            >
              Cuisine Tags (optional)
            </label>
            <input
              type="text"
              value={cuisineTags}
              onChange={(e) => setCuisineTags(e.target.value)}
              placeholder="Italian, Comfort Food, etc."
              className="w-full h-11 px-3 rounded-xl border text-sm"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Separate multiple tags with commas
            </p>
          </div>

          {/* Notes */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text)' }}
            >
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tips, variations, or personal notes..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border text-sm resize-none"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full px-4 py-3 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </RequireAuth>
  )
}
