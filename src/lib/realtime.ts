import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'

// Types pour les événements realtime
export type RealtimeEvent = {
  new: {
    id: string
    [key: string]: any
  }
  old: {
    id: string
    [key: string]: any
  }
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}

// Gestionnaire de canaux realtime
class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()

  // Souscription aux stages
  subscribeToStages(callback: (payload: RealtimeEvent) => void) {
    const channel = supabase
      .channel('stages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stages'
        },
        (payload) => callback(payload as unknown as RealtimeEvent)
      )
      .subscribe()

    this.channels.set('stages', channel)
    return () => {
      channel.unsubscribe()
      this.channels.delete('stages')
    }
  }

  // Souscription aux messages
  subscribeToMessages(userId: string, callback: (payload: RealtimeEvent) => void) {
    const channel = supabase
      .channel(`messages_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `to_user_id=eq.${userId}`
        },
        (payload) => callback(payload as unknown as RealtimeEvent)
      )
      .subscribe()

    this.channels.set(`messages_${userId}`, channel)
    return () => {
      channel.unsubscribe()
      this.channels.delete(`messages_${userId}`)
    }
  }

  // Souscription aux candidatures
  subscribeToCandidatures(stageId: string, callback: (payload: RealtimeEvent) => void) {
    const channel = supabase
      .channel(`candidatures_${stageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidatures',
          filter: `stage_id=eq.${stageId}`
        },
        (payload) => callback(payload as unknown as RealtimeEvent)
      )
      .subscribe()

    this.channels.set(`candidatures_${stageId}`, channel)
    return () => {
      channel.unsubscribe()
      this.channels.delete(`candidatures_${stageId}`)
    }
  }

  // Désinscription de tous les canaux
  unsubscribeAll() {
    this.channels.forEach((channel) => channel.unsubscribe())
    this.channels.clear()
  }
}

export const realtimeManager = new RealtimeManager()
