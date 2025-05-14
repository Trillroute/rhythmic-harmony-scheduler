
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SessionCreateProps } from "./types";
import { SubjectType, SessionType, LocationType } from "@/lib/types";

export function useCreateSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);

  const createSession = async (sessionData: SessionCreateProps) => {
    setLoading(true);
    setError(null);
    setCreatedSessionId(null);

    try {
      // 1. Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          teacher_id: sessionData.teacherId,
          pack_id: sessionData.packId,
          subject: sessionData.subject,
          session_type: sessionData.sessionType,
          location: sessionData.location,
          date_time: sessionData.dateTime.toISOString(),
          duration: sessionData.duration,
          notes: sessionData.notes || null,
          status: "Scheduled",
          reschedule_count: 0
        })
        .select()
        .single();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      // 2. If students are provided, link them to the session
      if (sessionData.studentIds && sessionData.studentIds.length > 0) {
        const studentSessionLinks = sessionData.studentIds.map(studentId => ({
          session_id: sessionData.id,
          student_id: studentId
        }));

        const { error: linkError } = await supabase
          .from("session_students")
          .insert(studentSessionLinks);

        if (linkError) {
          throw new Error(`Error linking students: ${linkError.message}`);
        }
      }

      // 3. Update session pack to decrement remaining_sessions
      const { error: packUpdateError } = await supabase
        .from("session_packs")
        .update({ remaining_sessions: supabase.rpc('decrement', { x: 1 }) })
        .eq('id', sessionData.packId);

      if (packUpdateError) {
        console.warn(`Warning: Could not update pack remaining sessions: ${packUpdateError.message}`);
        // Continue even if this fails
      }

      setCreatedSessionId(sessionData.id);
      return sessionData;
    } catch (err: any) {
      console.error("Error creating session:", err);
      setError(err.message || "An error occurred while creating the session");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Bulk create sessions with the same configuration on different dates
  const createBulkSessions = async (sessionsData: SessionCreateProps[]) => {
    setLoading(true);
    setError(null);

    try {
      // Create array of session objects
      const sessionObjects = sessionsData.map(session => ({
        teacher_id: session.teacherId,
        pack_id: session.packId,
        subject: session.subject,
        session_type: session.sessionType,
        location: session.location,
        date_time: session.dateTime.toISOString(),
        duration: session.duration,
        notes: session.notes || null,
        status: "Scheduled",
        reschedule_count: 0
      }));

      // Insert all sessions
      const { data: createdSessions, error: sessionsError } = await supabase
        .from("sessions")
        .insert(sessionObjects)
        .select();

      if (sessionsError) {
        throw new Error(sessionsError.message);
      }

      // For each session, link the student(s)
      for (let i = 0; i < createdSessions.length; i++) {
        const session = createdSessions[i];
        const studentIds = sessionsData[i].studentIds || [];

        if (studentIds.length > 0) {
          const studentSessionLinks = studentIds.map(studentId => ({
            session_id: session.id,
            student_id: studentId
          }));

          const { error: linkError } = await supabase
            .from("session_students")
            .insert(studentSessionLinks);

          if (linkError) {
            console.error(`Error linking students for session ${i}:`, linkError);
            // Continue with next session
          }
        }

        // Update session pack to decrement remaining_sessions
        const { error: packUpdateError } = await supabase
          .from("session_packs")
          .update({ remaining_sessions: supabase.rpc('decrement', { x: 1 }) })
          .eq('id', session.pack_id);

        if (packUpdateError) {
          console.warn(`Warning: Could not update pack for session ${i}:`, packUpdateError);
          // Continue with next session
        }
      }

      return createdSessions;
    } catch (err: any) {
      console.error("Error creating bulk sessions:", err);
      setError(err.message || "An error occurred while creating sessions");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createdSessionId,
    createSession,
    createBulkSessions
  };
}
