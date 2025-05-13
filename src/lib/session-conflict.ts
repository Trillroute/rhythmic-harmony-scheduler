
import { Session } from "./types";

interface ConflictResult {
  hasConflict: boolean;
  conflictingSession?: Session;
  reason?: string;
}

export type ConflictCheckType = 'teacher' | 'student' | 'room' | 'all';

// Check for conflicts between a new/updated session and existing sessions
export const checkSessionConflicts = (
  sessionData: Partial<Session>,
  existingSessions: Session[],
  checkType: ConflictCheckType = 'all'
): ConflictResult => {
  // If no date or time is set yet, we can't check for conflicts
  if (!sessionData.dateTime || !sessionData.duration) {
    return { hasConflict: false };
  }

  const sessionStart = new Date(sessionData.dateTime);
  const sessionEnd = new Date(sessionStart.getTime() + sessionData.duration * 60000);
  
  // Skip the current session when checking (for edits)
  const sessionsToCheck = sessionData.id 
    ? existingSessions.filter(s => s.id !== sessionData.id)
    : existingSessions;
    
  // Skip cancelled sessions - they don't create conflicts
  const activeSessionsToCheck = sessionsToCheck.filter(
    s => s.status !== 'Cancelled by Student' && 
         s.status !== 'Cancelled by Teacher' && 
         s.status !== 'Cancelled by School'
  );

  // Check for conflicts based on the check type
  for (const existingSession of activeSessionsToCheck) {
    const existingStart = new Date(existingSession.dateTime);
    const existingEnd = new Date(existingStart.getTime() + existingSession.duration * 60000);
    
    // Check if there's a time overlap
    const hasTimeOverlap = 
      (sessionStart < existingEnd && sessionEnd > existingStart);
    
    if (!hasTimeOverlap) {
      continue; // No time overlap, so no conflict
    }
    
    // Check for teacher conflicts
    if ((checkType === 'all' || checkType === 'teacher') && 
        sessionData.teacherId && 
        existingSession.teacherId === sessionData.teacherId) {
      return {
        hasConflict: true,
        conflictingSession: existingSession,
        reason: 'Teacher is already booked for another session during this time'
      };
    }
    
    // Check for student conflicts
    if ((checkType === 'all' || checkType === 'student') && 
        sessionData.studentIds?.length && 
        existingSession.studentIds) {
      const conflictingStudent = sessionData.studentIds.find(
        id => existingSession.studentIds!.includes(id)
      );
      
      if (conflictingStudent) {
        return {
          hasConflict: true,
          conflictingSession: existingSession,
          reason: 'Student is already booked for another session during this time'
        };
      }
    }
    
    // Check for room conflicts (if applicable)
    if ((checkType === 'all' || checkType === 'room') && 
        sessionData.location === 'Offline' && 
        existingSession.location === 'Offline') {
      // Logic for room conflicts would go here if we had room assignments
      // For now, assuming no room conflicts since we don't have specific room assignments
    }
  }
  
  return { hasConflict: false };
};

// Helper function to find available slots for a teacher
export const findAvailableSlotsForTeacher = (
  teacherId: string,
  day: Date,
  existingSessions: Session[],
  slotDuration: number = 60 // minutes
): { start: Date, end: Date }[] => {
  // Filter sessions for the teacher and the specified day
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);
  
  const teacherSessions = existingSessions.filter(session => 
    session.teacherId === teacherId &&
    new Date(session.dateTime) >= dayStart &&
    new Date(session.dateTime) <= dayEnd &&
    session.status !== 'Cancelled by Student' &&
    session.status !== 'Cancelled by Teacher' &&
    session.status !== 'Cancelled by School'
  );
  
  // Sort sessions by start time
  teacherSessions.sort((a, b) => 
    new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );
  
  // Define business hours (e.g., 9 AM to 6 PM)
  const businessStart = new Date(day);
  businessStart.setHours(9, 0, 0, 0);
  
  const businessEnd = new Date(day);
  businessEnd.setHours(18, 0, 0, 0);
  
  // Find available slots
  const availableSlots: { start: Date, end: Date }[] = [];
  let currentStart = new Date(businessStart);
  
  teacherSessions.forEach(session => {
    const sessionStart = new Date(session.dateTime);
    const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60000);
    
    // If there's a gap before this session, it's an available slot
    if (sessionStart.getTime() - currentStart.getTime() >= slotDuration * 60000) {
      availableSlots.push({
        start: new Date(currentStart),
        end: new Date(sessionStart)
      });
    }
    
    // Move the current start to after this session
    currentStart = new Date(sessionEnd);
  });
  
  // Check if there's a gap after the last session until the end of business hours
  if (businessEnd.getTime() - currentStart.getTime() >= slotDuration * 60000) {
    availableSlots.push({
      start: new Date(currentStart),
      end: new Date(businessEnd)
    });
  }
  
  return availableSlots;
};
