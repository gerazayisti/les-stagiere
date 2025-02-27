import { useEffect } from 'react'
import { realtimeManager, RealtimeEvent } from '@/lib/realtime'

// Hook pour les stages
export function useRealtimeStages(callback: (event: RealtimeEvent) => void) {
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribeToStages(callback)
    return () => unsubscribe()
  }, [callback])
}

// Hook pour les messages
export function useRealtimeMessages(userId: string, callback: (event: RealtimeEvent) => void) {
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribeToMessages(userId, callback)
    return () => unsubscribe()
  }, [userId, callback])
}

// Hook pour les candidatures
export function useRealtimeCandidatures(stageId: string, callback: (event: RealtimeEvent) => void) {
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribeToCandidatures(stageId, callback)
    return () => unsubscribe()
  }, [stageId, callback])
}
