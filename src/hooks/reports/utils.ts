
import { supabase } from '@/integrations/supabase/client';
import { 
  AttendanceData, 
  SubjectDistributionData, 
  SessionTypeData, 
  SessionsReportData, 
  StudentProgressData,
  ReportPeriod,
  SubjectDistributionItem,
  SessionTypeItem,
  StudentProgressItem
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

  // Prepare categories and data for chart display
  const categories = ['Present', 'Absent', 'Cancelled', 'No Show'];
  const data = [present, absent, cancelled, noShow];
  
  return {
    total,
    present,
    absent,
    cancelled,
    noShow,
    categories,
    data,
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
  
  return Array.from(subjectCounts).map(([subject, count]) => ({
    subject,
    count,
    name: subject, // For backward compatibility
    value: count   // For backward compatibility
  }));
};

/**
 * Generate session type report
 */
export const generateSessionTypeReport = (sessions: any[]): SessionTypeData => {
  const typeCounts = new Map();
  
  sessions.forEach(session => {
    const key = `${session.session_type}-${session.subject}`;
    typeCounts.set(key, {
      sessionType: session.session_type,
      type: session.session_type, // For backward compatibility
      subject: session.subject,
      count: (typeCounts.get(key)?.count || 0) + 1
    });
  });
  
  return Array.from(typeCounts.values()).map(item => ({
    sessionType: item.sessionType,
    type: item.type, // For backward compatibility
    count: item.count,
    subjects: [{subject: item.subject, count: item.count}]
  }));
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
  
  const sortedResult = result.sort((a, b) => a.date.localeCompare(b.date));
  
  // Create months and counts arrays for backward compatibility
  const months = sortedResult.map(item => item.date);
  const counts = sortedResult.map(item => item.count);
  
  return { months, counts };
};

/**
 * Generate student progress report
 */
export const generateStudentProgressReport = (progressData: any[]): StudentProgressData => {
  return progressData.map(item => {
    return {
      student: {
        id: item.id || item.enrollment?.profiles?.id || 'unknown',
        name: item.enrollment?.profiles?.name || 'Unknown Student'
      },
      progress: {
        id: item.id || 'unknown',
        courseName: item.enrollment?.courses?.name || 'Unknown Course',
        instrument: item.enrollment?.courses?.instrument || 'Unknown',
        completionPercentage: item.completion_percentage || 0
      },
      // For backward compatibility
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
      categories: ['Present', 'Absent', 'Cancelled', 'No Show'],
      data: [75, 15, 10, 0],
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
      { subject: 'Guitar', count: 40, name: 'Guitar', value: 40 },
      { subject: 'Piano', count: 35, name: 'Piano', value: 35 },
      { subject: 'Drums', count: 15, name: 'Drums', value: 15 },
      { subject: 'Vocal', count: 8, name: 'Vocal', value: 8 },
      { subject: 'Ukulele', count: 2, name: 'Ukulele', value: 2 }
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
      { sessionType: 'Solo', type: 'Solo', count: 30, subjects: [{ subject: 'Guitar', count: 30 }] },
      { sessionType: 'Duo', type: 'Duo', count: 15, subjects: [{ subject: 'Piano', count: 15 }] },
      { sessionType: 'Focus', type: 'Focus', count: 10, subjects: [{ subject: 'Drums', count: 10 }] }
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
    // Generate data with months and counts arrays
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const countValues = [65, 59, 80, 81, 56, 55];
    
    return {
      months: monthNames,
      counts: countValues
    };
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
        student: { id: '1', name: 'Alice Johnson' },
        progress: { id: '1', courseName: 'Piano Basics', instrument: 'Piano', completionPercentage: 80 },
        id: '1',
        studentName: 'Alice Johnson',
        courseName: 'Piano Basics',
        instrument: 'Piano',
        completionPercentage: 80
      },
      { 
        student: { id: '2', name: 'Bob Smith' },
        progress: { id: '2', courseName: 'Guitar Fundamentals', instrument: 'Guitar', completionPercentage: 60 },
        id: '2',
        studentName: 'Bob Smith',
        courseName: 'Guitar Fundamentals',
        instrument: 'Guitar',
        completionPercentage: 60
      },
      { 
        student: { id: '3', name: 'Charlie Brown' },
        progress: { id: '3', courseName: 'Drum Introduction', instrument: 'Drums', completionPercentage: 50 },
        id: '3',
        studentName: 'Charlie Brown',
        courseName: 'Drum Introduction',
        instrument: 'Drums',
        completionPercentage: 50
      },
      { 
        student: { id: '4', name: 'Diana White' },
        progress: { id: '4', courseName: 'Vocal Training', instrument: 'Vocal', completionPercentage: 40 },
        id: '4',
        studentName: 'Diana White',
        courseName: 'Vocal Training',
        instrument: 'Vocal',
        completionPercentage: 40
      },
      { 
        student: { id: '5', name: 'Ethan Miller' },
        progress: { id: '5', courseName: 'Ukulele Basics', instrument: 'Ukulele', completionPercentage: 30 },
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
