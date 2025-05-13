
import { supabase } from '@/integrations/supabase/client';
import { SubjectType, SessionType, LocationType, UserRole, PackSize, WeeklyFrequency } from './types';

/**
 * Helper utility functions for testing the application
 * This can be used to generate test data and validate functionality
 */

export const generateTestUsers = async () => {
  // Generate test teacher
  const teacherEmail = `teacher_${Math.random().toString(36).substring(2, 7)}@test.com`;
  const teacherPassword = 'Password123!';
  
  const { data: teacherData, error: teacherError } = await supabase.auth.signUp({
    email: teacherEmail,
    password: teacherPassword,
    options: {
      data: {
        name: 'Test Teacher',
        role: 'teacher'
      }
    }
  });
  
  if (teacherError) {
    console.error('Error creating test teacher:', teacherError.message);
    return null;
  }
  
  // Add teacher subjects
  if (teacherData.user) {
    await supabase
      .from('teachers')
      .update({
        subjects: ['Guitar', 'Piano'],
        max_weekly_sessions: 20
      })
      .eq('id', teacherData.user.id);
  }
  
  // Generate test student
  const studentEmail = `student_${Math.random().toString(36).substring(2, 7)}@test.com`;
  const studentPassword = 'Password123!';
  
  const { data: studentData, error: studentError } = await supabase.auth.signUp({
    email: studentEmail,
    password: studentPassword,
    options: {
      data: {
        name: 'Test Student',
        role: 'student'
      }
    }
  });
  
  if (studentError) {
    console.error('Error creating test student:', studentError.message);
    return null;
  }
  
  // Add student preferences
  if (studentData.user) {
    await supabase
      .from('students')
      .update({
        preferred_subjects: ['Guitar'],
        notes: 'Test student for functional testing'
      })
      .eq('id', studentData.user.id);
  }
  
  return {
    teacher: {
      id: teacherData.user?.id,
      email: teacherEmail,
      password: teacherPassword
    },
    student: {
      id: studentData.user?.id,
      email: studentEmail,
      password: studentPassword
    }
  };
};

export const createTestCourse = async ({ name, teacherId }: { name: string, teacherId: string }) => {
  // Create a course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert([{
      name,
      description: 'Test course for functional testing',
      instrument: 'Guitar' as SubjectType,
      session_type: 'Solo' as SessionType,
      duration_type: 'weeks',
      duration_value: 12,
      session_duration: 60,
      status: 'active'
    }])
    .select()
    .single();
  
  if (courseError) {
    console.error('Error creating test course:', courseError.message);
    return null;
  }
  
  // Assign the teacher to the course
  if (course) {
    await supabase
      .from('course_teachers')
      .insert([{
        course_id: course.id,
        teacher_id: teacherId
      }]);
  }
  
  return course;
};

export const createTestSessionPlan = async ({ 
  name, courseId 
}: { 
  name: string, 
  courseId: string 
}) => {
  const { data: plan, error } = await supabase
    .from('session_plans')
    .insert([{
      name,
      course_id: courseId,
      price: 599,
      sessions_count: 10,
      validity_days: 90,
      status: 'active'
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating test session plan:', error.message);
    return null;
  }
  
  return plan;
};

export const createTestSessionPack = async ({
  studentId,
  size = 10,
  subject = 'Guitar'
}: {
  studentId: string,
  size?: number,
  subject?: string
}) => {
  const { data: pack, error } = await supabase
    .from('session_packs')
    .insert([{
      student_id: studentId,
      size: size.toString() as PackSize,
      subject: subject as SubjectType,
      session_type: 'Solo' as SessionType,
      location: 'Offline' as LocationType,
      remaining_sessions: size,
      is_active: true,
      weekly_frequency: 'once' as WeeklyFrequency
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating test session pack:', error.message);
    return null;
  }
  
  return pack;
};

export const createTestInvoice = async ({
  studentId,
  packId,
  amount = 599
}: {
  studentId: string,
  packId: string,
  amount?: number
}) => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  
  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert([{
      student_id: studentId,
      pack_id: packId,
      amount,
      due_date: dueDate.toISOString(),
      status: 'pending'
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating test invoice:', error.message);
    return null;
  }
  
  return invoice;
};

export const enrollStudentInCourse = async ({
  studentId,
  courseId
}: {
  studentId: string,
  courseId: string
}) => {
  const { data: enrollment, error } = await supabase
    .from('enrollments')
    .insert([{
      student_id: studentId,
      course_id: courseId,
      start_date: new Date().toISOString(),
      status: 'active'
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error enrolling student:', error.message);
    return null;
  }
  
  return enrollment;
};

export const scheduleTestSession = async ({
  teacherId,
  studentId,
  packId,
  dateTime = new Date()
}: {
  teacherId: string,
  studentId: string,
  packId: string,
  dateTime?: Date
}) => {
  // Schedule a session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert([{
      teacher_id: teacherId,
      pack_id: packId,
      subject: 'Guitar' as SubjectType,
      session_type: 'Solo' as SessionType,
      location: 'Offline' as LocationType,
      date_time: dateTime.toISOString(),
      duration: 60,
      status: 'Scheduled'
    }])
    .select()
    .single();
  
  if (sessionError) {
    console.error('Error creating test session:', sessionError.message);
    return null;
  }
  
  // Assign student to session
  if (session) {
    await supabase
      .from('session_students')
      .insert([{
        session_id: session.id,
        student_id: studentId
      }]);
  }
  
  return session;
};

export const runFunctionalHealthCheck = async () => {
  console.log('Starting functional health check...');
  const results = {
    authWorks: false,
    routesWork: false,
    dataQueries: false,
    dataMutations: false,
    errors: [] as string[]
  };
  
  try {
    // 1. Test authentication
    const { data: authData, error: authError } = await supabase.auth.getSession();
    results.authWorks = !!authData.session;
    if (authError) results.errors.push(`Auth error: ${authError.message}`);
    
    // 2. Test data queries
    try {
      const { data: profiles } = await supabase.from('profiles').select('*').limit(1);
      const { data: courses } = await supabase.from('courses').select('*').limit(1);
      const { data: sessions } = await supabase.from('sessions').select('*').limit(1);
      
      results.dataQueries = true;
      console.log('Data queries successful');
    } catch (error: any) {
      results.errors.push(`Data query error: ${error.message}`);
    }
    
    // 3. Record system information for debugging
    const { data: settings } = await supabase.from('system_settings').select('*');
    console.log('System settings count:', settings?.length || 0);
    
    console.log('Functional health check completed');
    return results;
  } catch (error: any) {
    results.errors.push(`Health check error: ${error.message}`);
    return results;
  }
};
