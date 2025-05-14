
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAttendanceData,
  fetchSubjectDistributionData,
  fetchSessionTypeData,
  fetchSessionsOverTimeData,
  fetchStudentProgressData
} from './utils';
import { 
  ReportPeriod, 
  AttendanceData, 
  SubjectDistributionData,
  SessionTypeData,
  SessionsReportData,
  StudentProgressData 
} from './types';

export function useReports() {
  const [currentPeriod, setCurrentPeriod] = useState<ReportPeriod>('month');
  const [attendanceData, setAttendanceData] = useState<{
    isLoading: boolean;
    error: string;
    data: AttendanceData;
  }>({
    isLoading: true,
    error: '',
    data: {
      total: 0,
      present: 0,
      absent: 0,
      cancelled: 0,
      noShow: 0,
      distribution: [],
      chartData: []
    }
  });
  
  const [sessionTypeData, setSessionTypeData] = useState<{
    isLoading: boolean;
    error: string;
    data: SessionTypeData;
  }>({
    isLoading: true,
    error: '',
    data: []
  });
  
  const [sessionsData, setSessionsData] = useState<{
    isLoading: boolean;
    error: string;
    data: SessionsReportData;
  }>({
    isLoading: true,
    error: '',
    data: []
  });
  
  const subjectDistribution = useQuery<SubjectDistributionData>({
    queryKey: ['subjectDistribution', currentPeriod],
    queryFn: () => fetchSubjectDistributionData(currentPeriod)
  });
  
  const studentProgress = useQuery<StudentProgressData>({
    queryKey: ['studentProgress', currentPeriod],
    queryFn: () => fetchStudentProgressData(currentPeriod)
  });
  
  const fetchAttendanceReportData = async () => {
    setAttendanceData(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      const data = await fetchAttendanceData(currentPeriod);
      setAttendanceData({ isLoading: false, error: '', data });
    } catch (error) {
      setAttendanceData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch attendance data' 
      }));
    }
  };
  
  const fetchSessionTypeReportData = async () => {
    setSessionTypeData(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      const data = await fetchSessionTypeData(currentPeriod);
      setSessionTypeData({ isLoading: false, error: '', data });
    } catch (error) {
      setSessionTypeData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch session type data' 
      }));
    }
  };
  
  const fetchSessionsReportData = async () => {
    setSessionsData(prev => ({ ...prev, isLoading: true, error: '' }));
    try {
      const data = await fetchSessionsOverTimeData(currentPeriod);
      setSessionsData({ isLoading: false, error: '', data });
    } catch (error) {
      setSessionsData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch sessions data' 
      }));
    }
  };
  
  const refetch = () => {
    fetchAttendanceReportData();
    fetchSessionTypeReportData();
    fetchSessionsReportData();
    subjectDistribution.refetch();
    studentProgress.refetch();
  };
  
  useEffect(() => {
    fetchAttendanceReportData();
    fetchSessionTypeReportData();
    fetchSessionsReportData();
  }, [currentPeriod]);
  
  return {
    attendance: attendanceData,
    subjectDistribution,
    sessionType: sessionTypeData,
    sessions: sessionsData,
    studentProgress,
    isLoading: attendanceData.isLoading || 
               subjectDistribution.isLoading || 
               sessionTypeData.isLoading || 
               sessionsData.isLoading || 
               studentProgress.isLoading,
    isError: !!attendanceData.error || 
             !!subjectDistribution.error || 
             !!sessionTypeData.error || 
             !!sessionsData.error || 
             !!studentProgress.error,
    refetch
  };
}
