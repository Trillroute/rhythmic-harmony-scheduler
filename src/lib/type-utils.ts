
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
  if (!value) return "Guitar"; // Default safe value
  if (["Guitar", "Piano", "Drums", "Ukulele", "Vocal"].includes(value)) {
    return value as SubjectType;
  }
  console.warn(`Invalid subject type: ${value}, defaulting to Guitar`);
  return "Guitar";
}

export function assertSessionType(value: string): SessionType {
  if (!value) return "Solo"; // Default safe value
  if (["Solo", "Duo", "Focus"].includes(value)) {
    return value as SessionType;
  }
  console.warn(`Invalid session type: ${value}, defaulting to Solo`);
  return "Solo";
}

export function assertLocationType(value: string): LocationType {
  if (!value) return "Online"; // Default safe value
  if (["Online", "Offline"].includes(value)) {
    return value as LocationType;
  }
  console.warn(`Invalid location type: ${value}, defaulting to Online`);
  return "Online";
}

export function assertAttendanceStatus(value: string): AttendanceStatus {
  if (!value) return "Scheduled"; // Default safe value
  // Ensure exact string match with what Supabase expects
  const validStatuses = [
    "Present", "Absent", "Scheduled", "Cancelled by Student", 
    "Cancelled by Teacher", "Cancelled by School", "No Show"
  ];
  if (validStatuses.includes(value)) {
    return value as AttendanceStatus;
  }
  console.warn(`Invalid attendance status: ${value}, defaulting to Scheduled`);
  return "Scheduled";
}

export function assertWeeklyFrequency(value: string): WeeklyFrequency {
  if (!value) return "once"; // Default safe value
  if (["once", "twice"].includes(value)) {
    return value as WeeklyFrequency;
  }
  console.warn(`Invalid weekly frequency: ${value}, defaulting to once`);
  return "once";
}

// Helper function to safely cast array of strings to enum array types
export function assertSubjectTypeArray(values?: string[]): SubjectType[] {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => assertSubjectType(v));
}

export function assertSessionTypeArray(values?: string[]): SessionType[] {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => assertSessionType(v));
}

export function assertLocationTypeArray(values?: string[]): LocationType[] {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => assertLocationType(v));
}

export function assertAttendanceStatusArray(values?: string[] | readonly string[]): AttendanceStatus[] {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => assertAttendanceStatus(v)).filter(Boolean) as AttendanceStatus[];
}

export function assertWeeklyFrequencyArray(values?: string[]): WeeklyFrequency[] {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => assertWeeklyFrequency(v));
}

// Safe type assertion for arrays of any type to handle readonly arrays
export function assertStringArray(values?: any[] | readonly any[]): string[] {
  if (!values || !Array.isArray(values)) return [];
  return values.map(v => String(v));
}

// Type assertion for JSON serialization of complex objects
export function prepareForSupabase<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}
