
import { SubjectType, AttendanceStatus } from "@/lib/types";
import { assertSubjectTypeArray, assertAttendanceStatusArray } from "@/lib/type-utils";

/**
 * Utility functions for report hooks to safely handle type conversions
 */

// Use this to safely convert string arrays from database to typed arrays
export function safeConvertSubjects(subjects?: string[]): SubjectType[] {
  if (!subjects) return [];
  return assertSubjectTypeArray(subjects);
}

// Use this to safely convert status arrays from database to typed arrays
export function safeConvertStatus(statusList?: string[]): AttendanceStatus[] {
  if (!statusList) return [];
  return assertAttendanceStatusArray(statusList);
}
