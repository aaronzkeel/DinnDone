'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// TypeScript definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

export type VoiceInputStatus = 'idle' | 'listening' | 'processing' | 'error'

export interface UseVoiceInputOptions {
  /** Called when voice input successfully captures text */
  onResult?: (transcript: string) => void
  /** Called when an error occurs */
  onError?: (error: string) => void
  /** Language for speech recognition (default: 'en-US') */
  lang?: string
}

export interface UseVoiceInputReturn {
  /** Current status of voice input */
  status: VoiceInputStatus
  /** Whether voice input is currently listening */
  isListening: boolean
  /** Whether voice input is supported in this browser */
  isSupported: boolean
  /** Current transcript (interim results while speaking) */
  transcript: string
  /** Error message if status is 'error' */
  error: string | null
  /** Start listening for voice input */
  startListening: () => void
  /** Stop listening for voice input */
  stopListening: () => void
  /** Clear any error state */
  clearError: () => void
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { onResult, onError, lang = 'en-US' } = options

  const [status, setStatus] = useState<VoiceInputStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check for browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognitionAPI)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      setError('Voice input is not supported in this browser')
      setStatus('error')
      onError?.('Voice input is not supported in this browser')
      return
    }

    // Clean up any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    const recognition = new SpeechRecognitionAPI()
    recognitionRef.current = recognition

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onstart = () => {
      setStatus('listening')
      setTranscript('')
      setError(null)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript)
        setStatus('processing')
        onResult?.(finalTranscript.trim())
      } else if (interimTranscript) {
        setTranscript(interimTranscript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'An error occurred during voice input'

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech was detected. Please try again.'
          break
        case 'audio-capture':
          errorMessage = 'No microphone was found or microphone access was denied.'
          break
        case 'not-allowed':
          errorMessage = 'Microphone access was denied. Please allow microphone access and try again.'
          break
        case 'network':
          errorMessage = 'A network error occurred. Please check your connection.'
          break
        case 'aborted':
          // User or system aborted, not really an error
          setStatus('idle')
          return
        default:
          errorMessage = `Voice input error: ${event.error}`
      }

      setError(errorMessage)
      setStatus('error')
      onError?.(errorMessage)
    }

    recognition.onend = () => {
      // Only set to idle if not already in error or processing state
      setStatus((currentStatus) => {
        if (currentStatus === 'listening') {
          return 'idle'
        }
        // If we're in processing state, stay there briefly then go idle
        if (currentStatus === 'processing') {
          setTimeout(() => setStatus('idle'), 500)
          return currentStatus
        }
        return currentStatus
      })
      recognitionRef.current = null
    }

    try {
      recognition.start()
    } catch (err) {
      setError('Failed to start voice input')
      setStatus('error')
      onError?.('Failed to start voice input')
    }
  }, [lang, onResult, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
    setStatus('idle')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  return {
    status,
    isListening: status === 'listening',
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    clearError,
  }
}
