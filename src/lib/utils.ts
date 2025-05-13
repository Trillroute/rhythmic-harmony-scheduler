
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Session } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Check if two sessions overlap in time
export function doSessionsOverlap(session1: Session, session2: Session): boolean {
  const session1Start = new Date(session1.dateTime)
  const session1End = new Date(session1Start)
  session1End.setMinutes(session1End.getMinutes() + session1.duration)
  
  const session2Start = new Date(session2.dateTime)
  const session2End = new Date(session2Start)
  session2End.setMinutes(session2End.getMinutes() + session2.duration)
  
  // Sessions overlap if one starts before the other ends and vice versa
  return session1Start < session2End && session2Start < session1End
}

// Check if a session conflicts with existing sessions
export function checkSessionConflicts(
  newSession: Partial<Session>, 
  existingSessions: Session[],
  conflictType: 'teacher' | 'student' | 'duo' = 'teacher'
): { hasConflict: boolean; conflictingSession?: Session } {
  if (!newSession.dateTime || !newSession.duration) {
    return { hasConflict: false }
  }
  
  const newSessionStart = new Date(newSession.dateTime)
  const newSessionEnd = new Date(newSessionStart)
  newSessionEnd.setMinutes(newSessionEnd.getMinutes() + newSession.duration)
  
  // Filter out cancelled sessions and the current session if it's being updated
  const activeSessions = existingSessions.filter(session => 
    session.status === 'Scheduled' || session.status === 'Present' && 
    (newSession.id ? session.id !== newSession.id : true)
  )
  
  // Check for conflicts based on conflict type
  const conflictingSession = activeSessions.find(session => {
    // Skip if not a valid comparison
    if (!session.dateTime || !session.duration) return false
    
    const sessionStart = new Date(session.dateTime)
    const sessionEnd = new Date(sessionStart)
    sessionEnd.setMinutes(sessionEnd.getMinutes() + session.duration)
    
    // Check for time overlap
    const timeOverlap = newSessionStart < sessionEnd && sessionStart < newSessionEnd
    
    if (!timeOverlap) return false
    
    // Check specific conflict type
    if (conflictType === 'teacher') {
      return newSession.teacherId === session.teacherId
    }
    
    if (conflictType === 'student') {
      return newSession.studentIds?.some(id => session.studentIds.includes(id))
    }
    
    if (conflictType === 'duo') {
      // For duo sessions, check if adding this student would exceed the limit of 2
      return newSession.sessionType === 'Duo' && 
             session.id === newSession.id && 
             session.studentIds.length + (newSession.studentIds?.length || 0) > 2
    }
    
    return false
  })
  
  return {
    hasConflict: !!conflictingSession,
    conflictingSession
  }
}

// Format date and time for display
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
