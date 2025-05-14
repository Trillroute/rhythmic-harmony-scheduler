
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SessionPack, PackSize, SubjectType, SessionType, LocationType, WeeklyFrequency } from "@/lib/types";
import { assertSubjectType, assertSessionType, assertLocationType, assertWeeklyFrequency } from "@/lib/type-utils";

interface UsePacksOptions {
  studentId?: string;
  active?: boolean;
  withSessions?: boolean;
}

export function usePacks({ studentId, active, withSessions }: UsePacksOptions = {}) {
  const [packs, setPacks] = useState<SessionPack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("session_packs")
        .select(`
          id,
          student_id,
          size,
          subject,
          session_type,
          location,
          purchased_date,
          expiry_date,
          remaining_sessions,
          is_active,
          weekly_frequency,
          created_at,
          updated_at
          ${withSessions ? ', sessions(*)' : ''}
        `);
        
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      if (active !== undefined) {
        query = query.eq('is_active', active);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Transform data to match frontend types
      const transformedPacks: SessionPack[] = data?.map((pack) => ({
        id: pack.id,
        studentId: pack.student_id,
        size: Number(pack.size) as PackSize,
        subject: assertSubjectType(pack.subject),
        sessionType: assertSessionType(pack.session_type),
        location: assertLocationType(pack.location),
        purchasedDate: pack.purchased_date,
        expiryDate: pack.expiry_date || undefined,
        remainingSessions: pack.remaining_sessions,
        isActive: pack.is_active,
        weeklyFrequency: assertWeeklyFrequency(pack.weekly_frequency),
        sessions: pack.sessions ? pack.sessions : undefined,
        createdAt: pack.created_at,
        updatedAt: pack.updated_at
      })) || [];
      
      setPacks(transformedPacks);
    } catch (err) {
      console.error("Error fetching packs:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, active, withSessions]);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const createPack = async (packData: Omit<SessionPack, "id" | "createdAt" | "updatedAt">) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert the data to appropriate DB format
      const dbPackData = {
        student_id: packData.studentId,
        size: String(packData.size) as any, // Convert number to string for enum
        subject: packData.subject,
        session_type: packData.sessionType,
        location: packData.location,
        remaining_sessions: packData.remainingSessions,
        is_active: packData.isActive,
        weekly_frequency: packData.weeklyFrequency,
        purchased_date: packData.purchasedDate instanceof Date 
          ? packData.purchasedDate.toISOString() 
          : packData.purchasedDate,
        expiry_date: packData.expiryDate instanceof Date 
          ? packData.expiryDate.toISOString() 
          : packData.expiryDate,
      };
      
      const { data, error: insertError } = await supabase
        .from("session_packs")
        .insert(dbPackData)
        .select()
        .single();
        
      if (insertError) {
        throw new Error(insertError.message);
      }
      
      // Transform the response to match frontend types
      const newPack: SessionPack = {
        id: data.id,
        studentId: data.student_id,
        size: Number(data.size) as PackSize,
        subject: assertSubjectType(data.subject),
        sessionType: assertSessionType(data.session_type),
        location: assertLocationType(data.location),
        purchasedDate: data.purchased_date,
        expiryDate: data.expiry_date || undefined,
        remainingSessions: data.remaining_sessions,
        isActive: data.is_active,
        weeklyFrequency: assertWeeklyFrequency(data.weekly_frequency),
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setPacks(prevPacks => [...prevPacks, newPack]);
      return newPack;
    } catch (err) {
      console.error("Error creating pack:", err);
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePack = async (id: string, updates: Partial<Omit<SessionPack, "id" | "createdAt" | "updatedAt">>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert to DB format
      const dbUpdates: Record<string, any> = {};
      
      if ('studentId' in updates) dbUpdates.student_id = updates.studentId;
      if ('size' in updates) dbUpdates.size = String(updates.size);
      if ('subject' in updates) dbUpdates.subject = updates.subject;
      if ('sessionType' in updates) dbUpdates.session_type = updates.sessionType;
      if ('location' in updates) dbUpdates.location = updates.location;
      if ('remainingSessions' in updates) dbUpdates.remaining_sessions = updates.remainingSessions;
      if ('isActive' in updates) dbUpdates.is_active = updates.isActive;
      if ('weeklyFrequency' in updates) dbUpdates.weekly_frequency = updates.weeklyFrequency;
      
      if ('purchasedDate' in updates) {
        dbUpdates.purchased_date = updates.purchasedDate instanceof Date 
          ? updates.purchasedDate.toISOString() 
          : updates.purchasedDate;
      }
      
      if ('expiryDate' in updates) {
        dbUpdates.expiry_date = updates.expiryDate instanceof Date 
          ? updates.expiryDate.toISOString() 
          : updates.expiryDate;
      }
      
      const { data, error: updateError } = await supabase
        .from("session_packs")
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // Transform the response
      const updatedPack: SessionPack = {
        id: data.id,
        studentId: data.student_id,
        size: Number(data.size) as PackSize,
        subject: assertSubjectType(data.subject),
        sessionType: assertSessionType(data.session_type),
        location: assertLocationType(data.location),
        purchasedDate: data.purchased_date,
        expiryDate: data.expiry_date || undefined,
        remainingSessions: data.remaining_sessions,
        isActive: data.is_active,
        weeklyFrequency: assertWeeklyFrequency(data.weekly_frequency),
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Update the local state
      setPacks(prevPacks => 
        prevPacks.map(pack => pack.id === id ? updatedPack : pack)
      );
      
      return updatedPack;
    } catch (err) {
      console.error("Error updating pack:", err);
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    packs,
    isLoading,
    error,
    fetchPacks,
    createPack,
    updatePack
  };
}
