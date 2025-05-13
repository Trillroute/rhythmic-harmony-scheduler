
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, SubjectType, SessionType, LocationType, AttendanceStatus, FilterOptions } from "@/lib/types";

export const useSessions = (filters?: FilterOptions) => {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ["sessions", filters],
    queryFn: async () => {
      let query = supabase
        .from("sessions")
        .select(
          `
          *,
          teachers:teacher_id (
            id, 
            profiles:id (
              id, name, email
            )
          ),
          session_students (
            student_id,
            students:student_id (
              id, 
              profiles:id (
                id, name, email
              )
            )
          ),
          session_packs:pack_id (
            id, size, remaining_sessions, subject, session_type, location
          )
        `
        )
        .order("date_time", { ascending: true });

      // Apply filters if provided
      if (filters?.teacherId) {
        query = query.eq("teacher_id", filters.teacherId);
      }

      if (filters?.startDate) {
        const startDateStr = typeof filters.startDate === 'object' && 'getTime' in filters.startDate 
          ? filters.startDate.toISOString()
          : filters.startDate;
        query = query.gte("date_time", startDateStr);
      }

      if (filters?.endDate) {
        const endDateStr = typeof filters.endDate === 'object' && 'getTime' in filters.endDate
          ? filters.endDate.toISOString()
          : filters.endDate;
        query = query.lte("date_time", endDateStr);
      }

      if (filters?.subject) {
        query = query.eq("subject", filters.subject);
      }

      if (filters?.sessionType) {
        query = query.eq("session_type", filters.sessionType);
      }

      if (filters?.location) {
        query = query.eq("location", filters.location);
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in("status", filters.status);
        } else {
          query = query.eq("status", filters.status);
        }
      }

      // Filter by student if needed
      if (filters?.studentId) {
        query = query.eq("session_students.student_id", filters.studentId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to match our Session interface
      return data.map((session) => {
        const teacherName =
          session.teachers?.profiles?.name || "Unknown Teacher";
        const studentIds =
          session.session_students?.map((student) => student.student_id) || [];
        const studentNames =
          session.session_students?.map(
            (student) => student.students?.profiles?.name || "Unknown Student"
          ) || [];

        return {
          id: session.id,
          teacherId: session.teacher_id,
          teacherName,
          packId: session.pack_id,
          subject: session.subject as SubjectType,
          sessionType: session.session_type as SessionType,
          location: session.location as LocationType,
          dateTime: session.date_time,
          duration: session.duration,
          status: session.status as AttendanceStatus,
          notes: session.notes || "",
          rescheduleCount: session.reschedule_count,
          studentIds,
          studentNames,
          createdAt: session.created_at,
          updatedAt: session.updated_at,
        } as Session;
      });
    },
  });

  const createSessions = useMutation({
    mutationFn: async (sessionsData: Array<{
      pack_id: string;
      teacher_id: string;
      subject: SubjectType;
      session_type: SessionType;
      location: LocationType;
      date_time: any;
      duration: number;
      status: AttendanceStatus;
      notes: string;
      studentIds?: string[];
    }>) => {
      // Transform the array of session data to ensure dates are properly formatted
      const formattedSessions = sessionsData.map(session => {
        // Make sure required fields are present
        if (!session.pack_id || !session.teacher_id || !session.subject || 
            !session.session_type || !session.location || !session.date_time) {
          throw new Error("Missing required session fields");
        }

        return {
          pack_id: session.pack_id,
          teacher_id: session.teacher_id,
          subject: session.subject,
          session_type: session.session_type,
          location: session.location,
          date_time: typeof session.date_time === 'object' && 'getTime' in session.date_time 
            ? session.date_time.toISOString()
            : session.date_time,
          duration: session.duration,
          status: session.status,
          notes: session.notes || ''
        };
      });
      
      const { data, error } = await supabase
        .from("sessions")
        .insert(formattedSessions)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // Link students to sessions if provided
      const sessionStudentLinks = [];
      for (let i = 0; i < data.length; i++) {
        const sessionId = data[i].id;
        const studentIds = sessionsData[i].studentIds || [];

        for (const studentId of studentIds) {
          sessionStudentLinks.push({
            session_id: sessionId,
            student_id: studentId,
          });
        }
      }

      if (sessionStudentLinks.length > 0) {
        const { error: linkError } = await supabase
          .from("session_students")
          .insert(sessionStudentLinks);

        if (linkError) {
          throw new Error(linkError.message);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Sessions created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create sessions: ${error.message}`);
    },
  });

  // Function to update a single session
  const updateSession = useMutation({
    mutationFn: async (sessionData: Partial<Session> & { id: string }) => {
      const { id, studentIds, studentNames, teacherName, ...updateFields } = sessionData;

      // Format date fields
      if (updateFields.dateTime) {
        updateFields.dateTime = typeof updateFields.dateTime === 'object' && 'getTime' in updateFields.dateTime
          ? updateFields.dateTime.toISOString()
          : updateFields.dateTime;
      }

      // Format Supabase column names
      const formattedData = {
        date_time: updateFields.dateTime,
        duration: updateFields.duration,
        status: updateFields.status,
        notes: updateFields.notes,
        teacher_id: updateFields.teacherId,
        subject: updateFields.subject,
        session_type: updateFields.sessionType,
        location: updateFields.location,
      };

      // Remove undefined fields
      Object.keys(formattedData).forEach(
        (key) => formattedData[key] === undefined && delete formattedData[key]
      );

      const { error } = await supabase
        .from("sessions")
        .update(formattedData)
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      // Update student links if provided
      if (studentIds) {
        // First delete existing links
        const { error: deleteError } = await supabase
          .from("session_students")
          .delete()
          .eq("session_id", id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        // Then insert new links
        const sessionStudentLinks = studentIds.map((studentId) => ({
          session_id: id,
          student_id: studentId,
        }));

        if (sessionStudentLinks.length > 0) {
          const { error: insertError } = await supabase
            .from("session_students")
            .insert(sessionStudentLinks);

          if (insertError) {
            throw new Error(insertError.message);
          }
        }
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update session: ${error.message}`);
    },
  });

  const updateSessionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AttendanceStatus }) => {
      const { error } = await supabase
        .from("sessions")
        .update({ status })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update session status: ${error.message}`);
    }
  });

  const rescheduleSession = useMutation({
    mutationFn: async ({ id, dateTime }: { id: string; dateTime: Date }) => {
      const formattedDateTime = typeof dateTime === 'object' && 'getTime' in dateTime
        ? dateTime.toISOString()
        : dateTime;

      const { error } = await supabase
        .from("sessions")
        .update({ 
          date_time: formattedDateTime,
          status: 'Scheduled' 
        })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session rescheduled successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to reschedule session: ${error.message}`);
    }
  });

  return {
    sessions,
    isLoading,
    error,
    createSessions: createSessions.mutateAsync,
    updateSession: updateSession.mutateAsync,
    updateSessionStatus: updateSessionStatus.mutateAsync,
    rescheduleSession: rescheduleSession.mutateAsync,
    isPendingCreate: createSessions.isPending,
    isPendingUpdate: updateSession.isPending,
    isPendingStatusUpdate: updateSessionStatus.isPending,
    isPendingReschedule: rescheduleSession.isPending,
  };
};

// Export functions that match what components are expecting
export const useCreateSession = () => {
  const { createSessions, isPendingCreate } = useSessions();
  return {
    mutate: async (sessionData, options) => createSessions([sessionData], options),
    mutateAsync: async (sessionData, options) => createSessions([sessionData], options),
    isPending: isPendingCreate
  };
};

export const useUpdateSession = () => {
  const { updateSession, isPendingUpdate } = useSessions();
  return {
    mutate: updateSession,
    mutateAsync: updateSession,
    isPending: isPendingUpdate
  };
};

export const useUpdateSessionStatus = () => {
  const { updateSessionStatus, isPendingStatusUpdate } = useSessions();
  return {
    mutate: updateSessionStatus,
    mutateAsync: updateSessionStatus,
    isPending: isPendingStatusUpdate
  };
};

export const useRescheduleSession = () => {
  const { rescheduleSession, isPendingReschedule } = useSessions();
  return {
    mutate: rescheduleSession,
    mutateAsync: rescheduleSession,
    isPending: isPendingReschedule
  };
};

export const useSessionById = (sessionId?: string) => {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;

      const { data, error } = await supabase
        .from("sessions")
        .select(
          `
          *,
          teachers:teacher_id (
            id, 
            profiles:id (
              id, name, email
            )
          ),
          session_students (
            student_id,
            students:student_id (
              id, 
              profiles:id (
                id, name, email
              )
            )
          ),
          session_packs:pack_id (
            id, size, remaining_sessions, subject, session_type, location
          )
        `
        )
        .eq("id", sessionId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }
      
      if (!data) return null;

      const teacherName = data.teachers?.profiles?.name || "Unknown Teacher";
      const studentIds =
        data.session_students?.map((student) => student.student_id) || [];
      const studentNames =
        data.session_students?.map(
          (student) => student.students?.profiles?.name || "Unknown Student"
        ) || [];

      return {
        id: data.id,
        teacherId: data.teacher_id,
        teacherName,
        packId: data.pack_id,
        subject: data.subject as SubjectType,
        sessionType: data.session_type as SessionType,
        location: data.location as LocationType,
        dateTime: data.date_time,
        duration: data.duration,
        status: data.status as AttendanceStatus,
        notes: data.notes || "",
        rescheduleCount: data.reschedule_count,
        studentIds,
        studentNames,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as Session;
    },
    enabled: !!sessionId,
  });
};
