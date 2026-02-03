'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { RequireAuth } from '@/components/RequireAuth'
import { OnboardingChat } from '@/components/onboarding/OnboardingChat'
import { OnboardingSummary } from '@/components/onboarding/OnboardingSummary'
import {
  HouseholdCheckpoint,
  DietaryCheckpoint,
  StoresCheckpoint,
} from '@/components/onboarding/OnboardingCheckpoint'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ExtractedInsights {
  householdMembers?: Array<{
    name: string
    role?: string
    age?: number
    dietaryNotes?: string
  }>
  dietaryRestrictions?: string[]
  healthConditions?: string[]
  foodValues?: string[]
  stores?: string[]
  cookingNotes?: string
}

type OnboardingPhase =
  | 'chat'
  | 'checkpoint-household'
  | 'checkpoint-dietary'
  | 'checkpoint-stores'
  | 'summary'
  | 'completing'

export default function ConversationalOnboardingPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<OnboardingPhase>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<Id<'onboardingConversations'> | null>(null)
  const [extractedInsights, setExtractedInsights] = useState<ExtractedInsights>({})
  const [isInitializing, setIsInitializing] = useState(true)

  // Convex actions and mutations
  const chatAction = useAction(api.aiOnboarding.chat)
  const getOpeningMessage = useAction(api.aiOnboarding.getOpeningMessage)
  const extractInsights = useAction(api.aiOnboarding.extractInsights)
  const generateZyloNotes = useAction(api.aiOnboarding.generateZyloNotes)

  const startConversation = useMutation(api.onboardingConversation.start)
  const addMessage = useMutation(api.onboardingConversation.addMessage)
  const storeExtractedInsights = useMutation(api.onboardingConversation.storeExtractedInsights)

  const upsertFamilyProfile = useMutation(api.familyProfile.upsert)
  const completeOnboarding = useMutation(api.userPreferences.completeOnboarding)

  const addStore = useMutation(api.stores.add)
  const createHouseholdMember = useMutation(api.householdMembers.create)

  // Check for existing conversation
  const existingConversation = useQuery(api.onboardingConversation.getInProgress)

  // Initialize conversation
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true)

      // If there's an existing in-progress conversation, resume it
      if (existingConversation) {
        setConversationId(existingConversation._id)
        const existingMessages = existingConversation.messages.map((m, i) => ({
          id: `msg-${i}`,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }))
        setMessages(existingMessages)
        setIsInitializing(false)
        return
      }

      // Start new conversation
      try {
        const convId = await startConversation({})
        setConversationId(convId)

        // Get opening message from AI
        const opening = await getOpeningMessage({})
        if (opening.success && opening.content) {
          const openingMsg: Message = {
            id: 'msg-0',
            role: 'assistant',
            content: opening.content,
            timestamp: new Date().toISOString(),
          }
          setMessages([openingMsg])

          // Save to database
          await addMessage({
            conversationId: convId,
            role: 'assistant',
            content: opening.content,
          })
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error)
      }

      setIsInitializing(false)
    }

    // Only init once we know if there's an existing conversation
    if (existingConversation !== undefined) {
      init()
    }
  }, [existingConversation, startConversation, getOpeningMessage, addMessage])

  // Start the extraction process (defined before handleSendMessage since it's used there)
  const handleStartExtraction = useCallback(async () => {
    if (!conversationId) {
      console.error('No conversation ID - cannot extract')
      return
    }

    setIsLoading(true)

    try {
      // Extract insights from conversation
      const result = await extractInsights({
        conversationMessages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      })

      if (result.success && result.insights) {
        setExtractedInsights(result.insights)

        // Move to first checkpoint if we have household info
        if (
          result.insights.householdMembers &&
          result.insights.householdMembers.length > 0
        ) {
          setPhase('checkpoint-household')
        } else if (
          result.insights.dietaryRestrictions &&
          result.insights.dietaryRestrictions.length > 0
        ) {
          setPhase('checkpoint-dietary')
        } else {
          setPhase('summary')
        }
      } else {
        // If extraction failed, go directly to summary with empty data
        setPhase('summary')
      }
    } catch (error) {
      console.error('Failed to extract insights:', error)
      setPhase('summary')
    }

    setIsLoading(false)
  }, [conversationId, messages, extractInsights])

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) return

      // Add user message to UI
      const userMsg: Message = {
        id: `msg-${messages.length}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])

      // Save to database
      await addMessage({
        conversationId,
        role: 'user',
        content,
      })

      setIsLoading(true)

      try {
        // Get AI response
        const response = await chatAction({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        })

        if (response.success && response.content) {
          const assistantMsg: Message = {
            id: `msg-${messages.length + 1}`,
            role: 'assistant',
            content: response.content,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, assistantMsg])

          // Save to database
          await addMessage({
            conversationId,
            role: 'assistant',
            content: response.content,
          })
        }
      } catch (error) {
        console.error('Failed to send message:', error)
      }

      setIsLoading(false)
    },
    [conversationId, messages, chatAction, addMessage]
  )

  // Checkpoint handlers
  const handleHouseholdConfirm = (
    members: Array<{ name: string; dietaryNotes?: string }>
  ) => {
    setExtractedInsights((prev) => ({
      ...prev,
      householdMembers: members.map((m) => ({
        name: m.name,
        dietaryNotes: m.dietaryNotes,
      })),
    }))

    // Move to next checkpoint
    if (
      extractedInsights.dietaryRestrictions &&
      extractedInsights.dietaryRestrictions.length > 0
    ) {
      setPhase('checkpoint-dietary')
    } else if (
      extractedInsights.stores &&
      extractedInsights.stores.length > 0
    ) {
      setPhase('checkpoint-stores')
    } else {
      setPhase('summary')
    }
  }

  const handleDietaryConfirm = (restrictions: string[]) => {
    setExtractedInsights((prev) => ({
      ...prev,
      dietaryRestrictions: restrictions,
    }))

    if (extractedInsights.stores && extractedInsights.stores.length > 0) {
      setPhase('checkpoint-stores')
    } else {
      setPhase('summary')
    }
  }

  const handleStoresConfirm = (stores: string[]) => {
    setExtractedInsights((prev) => ({
      ...prev,
      stores,
    }))
    setPhase('summary')
  }

  // Final confirmation - receives edited data from summary
  const handleFinalConfirm = async (editedData: {
    householdMembers: Array<{ name: string; dietaryNotes?: string }>
    dietaryRestrictions: string[]
    healthConditions: string[]
    foodValues: string[]
    stores: string[]
    cookingNotes?: string
  }) => {
    if (!conversationId) return

    setPhase('completing')

    try {
      // Generate zyloNotes with edited data
      const notesResult = await generateZyloNotes({
        insights: {
          householdMembers: editedData.householdMembers,
          dietaryRestrictions: editedData.dietaryRestrictions,
          healthConditions: editedData.healthConditions,
          foodValues: editedData.foodValues,
          stores: editedData.stores,
          cookingNotes: editedData.cookingNotes,
        },
      })

      // Save family profile with edited data
      await upsertFamilyProfile({
        healthContext: {
          conditions: editedData.healthConditions,
          dietaryRestrictions: editedData.dietaryRestrictions,
          foodValues: editedData.foodValues,
        },
        shoppingPreferences: {
          primaryStores: editedData.stores,
        },
        zyloNotes: notesResult.success ? notesResult.zyloNotes : undefined,
      })

      // Add household members
      if (editedData.householdMembers) {
        for (const member of editedData.householdMembers) {
          await createHouseholdMember({
            name: member.name,
            isAdmin: false,
          })
        }
      }

      // Add stores
      if (editedData.stores) {
        for (const store of editedData.stores) {
          await addStore({ name: store })
        }
      }

      // Store extracted insights (original + edits for history)
      await storeExtractedInsights({
        conversationId,
        insights: editedData,
      })

      // Complete onboarding
      await completeOnboarding({
        dietaryRestrictions: editedData.dietaryRestrictions,
        effortPreference: 'mixed', // Default, can be refined later
        onboardingType: 'conversational',
      })

      // Navigate to weekly planning
      router.push('/weekly-planning')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      setPhase('summary') // Go back to summary on error
    }
  }

  // Go back to chat
  const handleEditFromSummary = () => {
    setPhase('chat')
  }

  // Skip checkpoint handlers
  const handleSkipHousehold = () => {
    if (
      extractedInsights.dietaryRestrictions &&
      extractedInsights.dietaryRestrictions.length > 0
    ) {
      setPhase('checkpoint-dietary')
    } else if (
      extractedInsights.stores &&
      extractedInsights.stores.length > 0
    ) {
      setPhase('checkpoint-stores')
    } else {
      setPhase('summary')
    }
  }

  const handleSkipDietary = () => {
    setExtractedInsights((prev) => ({
      ...prev,
      dietaryRestrictions: [],
    }))
    if (extractedInsights.stores && extractedInsights.stores.length > 0) {
      setPhase('checkpoint-stores')
    } else {
      setPhase('summary')
    }
  }

  const handleSkipStores = () => {
    setExtractedInsights((prev) => ({
      ...prev,
      stores: [],
    }))
    setPhase('summary')
  }

  return (
    <RequireAuth>
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* Header - sticky so Done button stays visible */}
        <header
          className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        >
          <button
            type="button"
            onClick={() => router.push('/onboarding')}
            className="p-2 -ml-2 rounded-lg"
            style={{ color: 'var(--color-muted)' }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-heading font-semibold" style={{ color: 'var(--color-text)' }}>
              Chat with Zylo
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {phase === 'chat'
                ? 'Tell me about your family'
                : phase === 'summary'
                  ? 'Review your profile'
                  : 'Confirm details'}
            </p>
          </div>
          {/* Finish Setup button - shows after 3+ user messages */}
          {phase === 'chat' &&
            !isLoading &&
            messages.filter((m) => m.role === 'user').length >= 1 && (
              <button
                type="button"
                onClick={handleStartExtraction}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <CheckCircle size={14} />
                Done
              </button>
            )}
        </header>

        {/* Main content */}
        {isInitializing ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2
                size={32}
                className="animate-spin mx-auto mb-3"
                style={{ color: 'var(--color-primary)' }}
              />
              <p style={{ color: 'var(--color-muted)' }}>Starting conversation...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat phase */}
            {phase === 'chat' && (
              <OnboardingChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            )}

            {/* Checkpoint phases */}
            {phase === 'checkpoint-household' && (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                  <HouseholdCheckpoint
                    members={
                      extractedInsights.householdMembers?.map((m) => ({
                        name: m.name,
                        dietaryNotes: m.dietaryNotes,
                      })) || []
                    }
                    onConfirm={handleHouseholdConfirm}
                    onSkip={handleSkipHousehold}
                  />
                </div>
              </div>
            )}

            {phase === 'checkpoint-dietary' && (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                  <DietaryCheckpoint
                    initialRestrictions={extractedInsights.dietaryRestrictions || []}
                    onConfirm={handleDietaryConfirm}
                    onSkip={handleSkipDietary}
                  />
                </div>
              </div>
            )}

            {phase === 'checkpoint-stores' && (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                  <StoresCheckpoint
                    initialStores={extractedInsights.stores || []}
                    onConfirm={handleStoresConfirm}
                    onSkip={handleSkipStores}
                  />
                </div>
              </div>
            )}

            {/* Summary phase */}
            {(phase === 'summary' || phase === 'completing') && (
              <div className="flex-1 overflow-y-auto">
                <OnboardingSummary
                  householdMembers={extractedInsights.householdMembers || []}
                  dietaryRestrictions={extractedInsights.dietaryRestrictions || []}
                  healthConditions={extractedInsights.healthConditions || []}
                  foodValues={extractedInsights.foodValues || []}
                  stores={extractedInsights.stores || []}
                  cookingNotes={extractedInsights.cookingNotes}
                  onConfirm={handleFinalConfirm}
                  onEdit={handleEditFromSummary}
                  isLoading={phase === 'completing'}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  )
}
