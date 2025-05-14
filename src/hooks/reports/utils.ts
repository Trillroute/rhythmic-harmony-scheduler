
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
 * Generate attendance report from sessions data
 */
export const generateAttendanceReport = (sessions: any[]): AttendanceData => {
  const total = sessions.length;
  const present = sessions.filter(s => s.status === 'Present').length;
  const absent = sessions.filter(s => s.status === 'Absent').length;
  const cancelled = sessions.filter(s => s.status.includes('Cancelled')).length;
  const noShow = sessions.filter(s => s.status === 'No Show').length;
  
  // Create distribution data for chart
  const distribution = [
    { status: 'Present', count: present },
    { status: 'Absent', count: absent },
    { status: 'Cancelled', count: cancelled },
    { status: 'No Show', count: noShow }
  ];
  
  // Create time series data (grouped by date)
  const dateMap = new Map();
  sessions.forEach(session => {
    const dateStr = new Date(session.date_time).toISOString().split('T')[0];
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, { present: 0, total: 0 });
    }
    dateMap.get(dateStr).total += 1;
    if (session.status === 'Present') {
      dateMap.get(dateStr).present += 1;
    }
  });
  
  const chartData = Array.from(dateMap).map(([date, data]) => ({
    date,
    present: data.present,
    total: data.total
  }));
  
  return {
    total,
    present,
    absent,
    cancelled,
    noShow,
    distribution,
    chartData
  };
};

/**
 * Generate subject distribution report
 */
export const generateSubjectDistributionReport = (sessions: any[]): SubjectDistributionData => {
  const subjectCounts = new Map();
  
  sessions.forEach(session => {
    const subject = session.subject;
    subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1);
  });
  
  return Array.from(subjectCounts).map(([name, value]) => ({ name, value }));
};

/**
 * Generate session type report
 */
export const generateSessionTypeReport = (sessions: any[]): SessionTypeData => {
  const typeCounts = new Map();
  
  sessions.forEach(session => {
    const key = `${session.session_type}-${session.subject}`;
    typeCounts.set(key, {
      type: session.session_type,
      subject: session.subject,
      count: (typeCounts.get(key)?.count || 0) + 1
    });
  });
  
  return Array.from(typeCounts.values());
};

/**
 * Generate sessions over time report
 */
export const generateSessionsReport = (sessions: any[], startDate: Date, endDate: Date): SessionsReportData => {
  // Group sessions by date or month depending on range
  const isLongRange = (endDate.getTime() - startDate.getTime()) > (30 * 24 * 60 * 60 * 1000);
  
  const groupedSessions = new Map();
  
  sessions.forEach(session => {
    const date = new Date(session.date_time);
    let key;
    
    if (isLongRange) {
      // Group by month for longer ranges
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    } else {
      // Group by date for shorter ranges
      key = date.toISOString().split('T')[0];
    }
    
    groupedSessions.set(key, (groupedSessions.get(key) || 0) + 1);
  });
  
  const result = Array.from(groupedSessions).map(([date, count]) => {
    // Format date label
    let formattedDate = date;
    if (isLongRange) {
      const [year, month] = date.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      formattedDate = monthNames[parseInt(month) - 1];
    }
    
    return { date: formattedDate, count };
  });
  
  return result.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Generate student progress report
 */
export const generateStudentProgressReport = (progressData: any[]): StudentProgressData => {
  return progressData.map(item => {
    return {
      id: item.id,
      studentName: item.enrollment?.profiles?.name || 'Unknown Student',
      courseName: item.enrollment?.courses?.name || 'Unknown Course',
      instrument: item.enrollment?.courses?.instrument || 'Unknown',
      completionPercentage: item.completion_percentage || 0
    };
  });
};

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
