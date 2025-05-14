
import { supabase } from '@/integrations/supabase/client';
import { 
  AttendanceData, 
  SubjectDistributionData, 
  SessionTypeData, 
  SessionsReportData, 
  StudentProgressData,
  ReportPeriod,
  SessionTypeItem,
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
  
  // Create proper distribution object
  const distribution = {
    present,
    absent,
    cancelled,
    noShow
  };
  
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
  
  // Create the required SubjectDistributionData format
  const result: SubjectDistributionData = {
    Guitar: 0,
    Piano: 0,
    Drums: 0,
    Ukulele: 0,
    Vocal: 0,
  };
  
  // Add counts to the result object
  subjectCounts.forEach((count, subject) => {
    result[subject] = count;
  });
  
  // Add chartData separately
  result.chartData = {
    labels: Array.from(subjectCounts.keys()),
    data: Array.from(subjectCounts.values()) as number[]
  };
  
  return result;
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
  
  // Build distribution data for chart
  const result: SessionTypeData = {
    Solo: { type: 'Solo', count: 0, subjects: {} },
    Duo: { type: 'Duo', count: 0, subjects: {} },
    Focus: { type: 'Focus', count: 0, subjects: {} }
  };
  
  typeCounts.forEach((value, key) => {
    const [type, subject] = key.split('-');
    
    if (!result[type]) {
      result[type] = { type, count: 0, subjects: {} };
    }
    
    result[type]!.count += value.count;
    
    if (!result[type]!.subjects[subject]) {
      result[type]!.subjects[subject] = 0;
    }
    
    result[type]!.subjects[subject] += value.count;
  });
  
  return result;
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

  // Calculate statistics
  const total = sessions.length;
  const scheduled = sessions.filter(s => s.status === 'Scheduled').length;
  const completed = sessions.filter(s => s.status === 'Present').length;
  const cancelled = sessions.filter(s => s.status.includes('Cancelled')).length;
  
  return { 
    total,
    scheduled,
    completed,
    cancelled,
    data: sortedResult,
    months, 
    counts
  };
};

/**
 * Generate student progress report
 */
export const generateStudentProgressReport = (progressData: any[]): StudentProgressData => {
  const students = progressData.map(item => {
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
      studentId: item.enrollment?.profiles?.id || 'unknown',
      studentName: item.enrollment?.profiles?.name || 'Unknown Student',
      completionPercentage: item.completion_percentage || 0
    };
  });

  // Calculate average completion
  const averageCompletion = students.length > 0 
    ? students.reduce((sum, s) => sum + s.completionPercentage, 0) / students.length
    : 0;

  return {
    students,
    averageCompletion: Math.round(averageCompletion)
  };
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
      distribution: {
        present: 75,
        absent: 15,
        cancelled: 10,
        noShow: 0
      },
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
    const result: SubjectDistributionData = {
      Guitar: 40,
      Piano: 35,
      Drums: 15,
      Vocal: 8,
      Ukulele: 2
    };
    
    // Add chartData separately
    result.chartData = {
      labels: ['Guitar', 'Piano', 'Drums', 'Vocal', 'Ukulele'],
      data: [40, 35, 15, 8, 2]
    };
    
    return result;
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
    return {
      Solo: { type: 'Solo', count: 30, subjects: { Guitar: 30 } },
      Duo: { type: 'Duo', count: 15, subjects: { Piano: 15 } },
      Focus: { type: 'Focus', count: 10, subjects: { Drums: 10 } }
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
    // Generate data with months and counts arrays
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const countValues = [65, 59, 80, 81, 56, 55];
    
    return {
      total: 396,
      scheduled: 100,
      completed: 296,
      cancelled: 0,
      months: monthNames,
      counts: countValues,
      data: monthNames.map((month, index) => ({ date: month, count: countValues[index] }))
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
    const students = [
      { 
        student: { id: '1', name: 'Alice Johnson' },
        progress: { id: '1', courseName: 'Piano Basics', instrument: 'Piano', completionPercentage: 80 },
        studentId: '1',
        studentName: 'Alice Johnson',
        completionPercentage: 80
      },
      { 
        student: { id: '2', name: 'Bob Smith' },
        progress: { id: '2', courseName: 'Guitar Fundamentals', instrument: 'Guitar', completionPercentage: 60 },
        studentId: '2',
        studentName: 'Bob Smith',
        completionPercentage: 60
      },
      { 
        student: { id: '3', name: 'Charlie Brown' },
        progress: { id: '3', courseName: 'Drum Introduction', instrument: 'Drums', completionPercentage: 50 },
        studentId: '3',
        studentName: 'Charlie Brown',
        completionPercentage: 50
      },
      { 
        student: { id: '4', name: 'Diana White' },
        progress: { id: '4', courseName: 'Vocal Training', instrument: 'Vocal', completionPercentage: 40 },
        studentId: '4',
        studentName: 'Diana White',
        completionPercentage: 40
      },
      { 
        student: { id: '5', name: 'Ethan Miller' },
        progress: { id: '5', courseName: 'Ukulele Basics', instrument: 'Ukulele', completionPercentage: 30 },
        studentId: '5',
        studentName: 'Ethan Miller',
        completionPercentage: 30
      }
    ];
    
    // Return data in the correct format
    return {
      students,
      averageCompletion: 52
    };
  } catch (error) {
    console.error('Error fetching student progress data:', error);
    throw error;
  }
};
