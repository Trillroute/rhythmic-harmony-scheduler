
import { 
  SubjectType, 
  SessionType, 
  LocationType, 
  AttendanceStatus, 
  WeeklyFrequency 
} from "./types";

/**
 * Type assertion utilities to convert between database strings and frontend enum types
 */

export function assertSubjectType(value: string): SubjectType {
  return value as SubjectType;
}

export function assertSessionType(value: string): SessionType {
  return value as SessionType;
}

export function assertLocationType(value: string): LocationType {
  return value as LocationType;
}

export function assertAttendanceStatus(value: string): AttendanceStatus {
  return value as AttendanceStatus;
}

export function assertWeeklyFrequency(value: string): WeeklyFrequency {
  return value as WeeklyFrequency;
}

// Helper function to safely cast array of strings to enum array types
export function assertSubjectTypeArray(values?: string[]): SubjectType[] {
  if (!values) return [];
  return values.map(v => assertSubjectType(v));
}

export function assertSessionTypeArray(values?: string[]): SessionType[] {
  if (!values) return [];
  return values.map(v => assertSessionType(v));
}

export function assertAttendanceStatusArray(values?: string[]): AttendanceStatus[] {
  if (!values) return [];
  return values.map(v => assertAttendanceStatus(v));
}
