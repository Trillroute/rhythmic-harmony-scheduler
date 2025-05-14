
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
      total: 100,
      present: 75,
      absent: 15,
      cancelled: 10,
      noShow: 0,
      distribution: [
        { status: 'Present', count: 75 },
        { status: 'Absent', count: 15 },
        { status: 'Cancelled', count: 10 }
      ],
      chartData: [
        { date: '2023-05-01', present: 15, total: 20 },
        { date: '2023-05-02', present: 18, total: 20 },
        { date: '2023-05-03', present: 12, total: 15 }
      ]
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
    // Return data in the correct format
    return [
      { name: 'Guitar', value: 40 },
      { name: 'Piano', value: 35 },
      { name: 'Drums', value: 15 },
      { name: 'Vocal', value: 8 },
      { name: 'Ukulele', value: 2 }
    ];
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
    // Return data in the correct format
    return [
      { type: 'Solo', subject: 'Guitar', count: 30 },
      { type: 'Duo', subject: 'Piano', count: 15 },
      { type: 'Focus', subject: 'Drums', count: 10 }
    ];
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
    // Return data in the correct format
    return [
      { date: 'Jan', count: 65 },
      { date: 'Feb', count: 59 },
      { date: 'Mar', count: 80 },
      { date: 'Apr', count: 81 },
      { date: 'May', count: 56 },
      { date: 'Jun', count: 55 }
    ];
  } catch (error) {
    console.error('Error fetching sessions over time data:', error);
    throw error;
  }
};

/**
 * Fetch student progress data from the database
 */
export const fetchStudentProgressData = async (period: ReportPeriod): Promise<StudentProgressData> => {
  try {
    // Return data in the correct format
    return [
      { 
        id: '1', 
        studentName: 'Alice Johnson', 
        courseName: 'Piano Basics', 
        instrument: 'Piano', 
        completionPercentage: 80 
      },
      { 
        id: '2', 
        studentName: 'Bob Smith', 
        courseName: 'Guitar Fundamentals', 
        instrument: 'Guitar', 
        completionPercentage: 60 
      },
      { 
        id: '3', 
        studentName: 'Charlie Brown', 
        courseName: 'Drum Introduction', 
        instrument: 'Drums', 
        completionPercentage: 50 
      },
      { 
        id: '4', 
        studentName: 'Diana White', 
        courseName: 'Vocal Training', 
        instrument: 'Vocal', 
        completionPercentage: 40 
      },
      { 
        id: '5', 
        studentName: 'Ethan Miller', 
        courseName: 'Ukulele Basics', 
        instrument: 'Ukulele', 
        completionPercentage: 30 
      }
    ];
  } catch (error) {
    console.error('Error fetching student progress data:', error);
    throw error;
  }
};
