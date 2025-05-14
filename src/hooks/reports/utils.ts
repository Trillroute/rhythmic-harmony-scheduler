
import { supabase } from '@/integrations/supabase/client';
import { 
  AttendanceData, 
  SubjectDistributionData, 
  SessionTypeData, 
  SessionsReportData, 
  StudentProgressData,
  ReportPeriod
} from './types';

/**
 * Fetch attendance data from the database
 */
export const fetchAttendanceData = async (period: ReportPeriod): Promise<AttendanceData> => {
  try {
    // For now returning dummy data until we implement the actual query
    return {
      present: 75,
      absent: 15,
      cancelled: 10
    };
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    throw error;
  }
};

/**
 * Fetch subject distribution data from the database
 */
export const fetchSubjectDistributionData = async (period: ReportPeriod): Promise<SubjectDistributionData> => {
  try {
    // For now returning dummy data until we implement the actual query
    return {
      Guitar: 40,
      Piano: 35,
      Drums: 15,
      Vocal: 8,
      Ukulele: 2
    };
  } catch (error) {
    console.error('Error fetching subject distribution data:', error);
    throw error;
  }
};

/**
 * Fetch session type data from the database
 */
export const fetchSessionTypeData = async (period: ReportPeriod): Promise<SessionTypeData> => {
  try {
    // For now returning dummy data until we implement the actual query
    return {
      Solo: 60,
      Duo: 25,
      Focus: 15
    };
  } catch (error) {
    console.error('Error fetching session type data:', error);
    throw error;
  }
};

/**
 * Fetch sessions over time data from the database
 */
export const fetchSessionsOverTimeData = async (period: ReportPeriod): Promise<SessionsReportData> => {
  try {
    // For now returning dummy data until we implement the actual query
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: {
        completed: [65, 59, 80, 81, 56, 55],
        scheduled: [28, 48, 40, 19, 86, 27],
        cancelled: [10, 8, 12, 9, 7, 11]
      }
    };
  } catch (error) {
    console.error('Error fetching sessions over time data:', error);
    throw error;
  }
};

/**
 * Fetch student progress data from the database
 */
export const fetchStudentProgressData = async (period: ReportPeriod): Promise<StudentProgressData[]> => {
  try {
    // For now returning dummy data until we implement the actual query
    return [
      { id: '1', name: 'Alice Johnson', subject: 'Piano', completedSessions: 24, progress: 80 },
      { id: '2', name: 'Bob Smith', subject: 'Guitar', completedSessions: 18, progress: 60 },
      { id: '3', name: 'Charlie Brown', subject: 'Drums', completedSessions: 15, progress: 50 },
      { id: '4', name: 'Diana White', subject: 'Vocal', completedSessions: 12, progress: 40 },
      { id: '5', name: 'Ethan Miller', subject: 'Ukulele', completedSessions: 9, progress: 30 }
    ];
  } catch (error) {
    console.error('Error fetching student progress data:', error);
    throw error;
  }
};
