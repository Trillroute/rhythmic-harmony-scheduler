
import { supabase } from '@/integrations/supabase/client';
import { 
  SubjectType, SessionType, LocationType, AttendanceStatus,
  PackSize, WeeklyFrequency 
} from '../lib/types';
import { toast } from 'sonner';

/**
 * Utility to seed the database with test data for existing users
 */

// Helper function to generate a random integer between min and max (inclusive)
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to pick random items from an array
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper to format dates properly
const formatDate = (date: Date): string => {
  return date.toISOString();
};

// Helper to get a random future date
const getRandomFutureDate = (minDays: number, maxDays: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + getRandomInt(minDays, maxDays));
  return date;
};

// Helper to get a random past date
const getRandomPastDate = (minDays: number, maxDays: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(minDays, maxDays));
  return date;
};

// Set of available subjects
const SUBJECTS: SubjectType[] = ['Guitar', 'Piano', 'Drums', 'Ukulele', 'Vocal'];

// Set of available session types
const SESSION_TYPES: SessionType[] = ['Solo', 'Duo', 'Focus'];

// Set of available locations
const LOCATIONS: LocationType[] = ['Online', 'Offline'];

// Set of available pack sizes
const PACK_SIZES: PackSize[] = [4, 10, 20, 30];

// Set of available weekly frequencies
const WEEKLY_FREQUENCIES: WeeklyFrequency[] = ['once', 'twice'];

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  name: string;
}

interface SeededData {
  teachers: User[];
  students: User[];
  admins: User[];
  courses: any[];
  sessionPlans: any[];
  packs: any[];
  sessions: any[];
  enrollments: any[];
  feePlans: any[];
  invoices: any[];
  payments: any[];
}

export const populateDatabase = async (): Promise<SeededData> => {
  try {
    // Step 0: Fetch existing users from auth.users via profiles table 
    // (we cannot access auth.users directly with the client)
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, role')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching existing profiles:', profilesError);
      throw profilesError;
    }

    if (!existingProfiles || existingProfiles.length === 0) {
      throw new Error('No existing user profiles found. Please create users first.');
    }

    console.log(`Found ${existingProfiles.length} existing profiles`);

    // Split users by role
    const adminUsers = existingProfiles.filter(user => user.role === 'admin');
    const teacherUsers = existingProfiles.filter(user => user.role === 'teacher');
    const studentUsers = existingProfiles.filter(user => user.role === 'student');

    console.log(`Found ${adminUsers.length} admins, ${teacherUsers.length} teachers, ${studentUsers.length} students`);

    // Make sure we have users of each role
    if (adminUsers.length === 0 || teacherUsers.length === 0 || studentUsers.length === 0) {
      throw new Error('Please make sure you have at least one admin, teacher, and student user');
    }

    // Step 2: Add role-specific information
    // Add teacher subjects (2-3 per teacher)
    for (const teacher of teacherUsers) {
      const randomSubjects = getRandomItems(SUBJECTS, getRandomInt(2, 3)) as SubjectType[];
      const maxWeeklySessions = getRandomInt(15, 25);

      const { error: teacherError } = await supabase
        .from('teachers')
        .upsert({
          id: teacher.id,
          subjects: randomSubjects,
          max_weekly_sessions: maxWeeklySessions
        });

      if (teacherError) {
        console.error(`Error adding teacher data for ${teacher.email}:`, teacherError);
        throw teacherError;
      }
    }

    // Add student preferences
    for (const student of studentUsers) {
      const preferredSubjects = getRandomItems(SUBJECTS, getRandomInt(1, 2)) as SubjectType[];
      const preferredTeachers = getRandomInt(0, 1) === 1 
        ? [teacherUsers[getRandomInt(0, teacherUsers.length - 1)].id] 
        : [];
      const notes = getRandomInt(0, 1) === 1 
        ? `Student notes for ${student.name}` 
        : null;

      const { error: studentError } = await supabase
        .from('students')
        .upsert({
          id: student.id,
          preferred_subjects: preferredSubjects,
          preferred_teachers: preferredTeachers,
          notes: notes
        });

      if (studentError) {
        console.error(`Error adding student data for ${student.email}:`, studentError);
        throw studentError;
      }
    }

    // Add admin permissions
    for (const admin of adminUsers) {
      const permissions = ['manage_users', 'manage_courses', 'manage_payments', 'view_reports'];

      const { error: adminError } = await supabase
        .from('admins')
        .upsert({
          id: admin.id,
          permissions: permissions
        });

      if (adminError) {
        console.error(`Error adding admin data for ${admin.email}:`, adminError);
        throw adminError;
      }
    }

    // Step 3: Create courses and session plans
    const courses = [];
    
    // Course 1: Beginner Guitar
    const course1 = {
      name: 'Beginner Guitar',
      description: 'Introduction to guitar basics',
      instrument: 'Guitar' as SubjectType,
      session_type: 'Solo' as SessionType,
      duration_type: 'weeks',
      duration_value: 12,
      session_duration: 60,
      status: 'active'
    };

    // Course 2: Intermediate Piano
    const course2 = {
      name: 'Intermediate Piano',
      description: 'For students who know the basics',
      instrument: 'Piano' as SubjectType,
      session_type: 'Solo' as SessionType,
      duration_type: 'weeks',
      duration_value: 16,
      session_duration: 60,
      status: 'active'
    };

    // Course 3: Drum Basics
    const course3 = {
      name: 'Drum Basics',
      description: 'Learn the fundamentals of percussion',
      instrument: 'Drums' as SubjectType,
      session_type: 'Solo' as SessionType,
      duration_type: 'weeks',
      duration_value: 10,
      session_duration: 60,
      status: 'active'
    };

    // Course 4: Vocal Techniques
    const course4 = {
      name: 'Vocal Techniques',
      description: 'Improve your singing abilities',
      instrument: 'Vocal' as SubjectType,
      session_type: 'Solo' as SessionType,
      duration_type: 'weeks',
      duration_value: 12,
      session_duration: 60,
      status: 'active'
    };

    // Course 5: Group Ukulele
    const course5 = {
      name: 'Group Ukulele',
      description: 'Learn ukulele in a fun group setting',
      instrument: 'Ukulele' as SubjectType,
      session_type: 'Duo' as SessionType,
      duration_type: 'weeks',
      duration_value: 8,
      session_duration: 60,
      status: 'active'
    };

    // Insert courses
    const { data: createdCourses, error: coursesError } = await supabase
      .from('courses')
      .insert([course1, course2, course3, course4, course5])
      .select();

    if (coursesError || !createdCourses) {
      console.error('Error creating courses:', coursesError);
      throw coursesError;
    }

    courses.push(...createdCourses);
    console.log(`Created ${createdCourses.length} courses`);

    // Assign teachers to courses
    const courseTeachers = [];
    for (const course of createdCourses) {
      // Get 1-2 teachers that can teach the course subject
      const eligibleTeachers = teacherUsers.filter(teacher => {
        return supabase.from('teachers').select('subjects').eq('id', teacher.id).then(({ data }) => {
          return data && data[0] && data[0].subjects && data[0].subjects.includes(course.instrument);
        });
      });

      const numTeachers = Math.min(getRandomInt(1, 2), eligibleTeachers.length);
      const selectedTeachers = getRandomItems(eligibleTeachers, numTeachers);

      for (const teacher of selectedTeachers) {
        courseTeachers.push({
          course_id: course.id,
          teacher_id: teacher.id
        });
      }
    }

    if (courseTeachers.length > 0) {
      const { error: courseTeachersError } = await supabase
        .from('course_teachers')
        .insert(courseTeachers);

      if (courseTeachersError) {
        console.error('Error assigning teachers to courses:', courseTeachersError);
        throw courseTeachersError;
      }
      console.log(`Assigned ${courseTeachers.length} teachers to courses`);
    }

    // Create session plans
    const sessionPlans = [];
    for (const course of createdCourses) {
      // Create 1-2 plans per course
      const numPlans = getRandomInt(1, 2);
      
      for (let i = 0; i < numPlans; i++) {
        const sessionCount = getRandomInt(8, 16);
        const price = sessionCount * getRandomInt(50, 80);
        const validityDays = sessionCount * 7;
        
        sessionPlans.push({
          name: `${course.name} ${i === 0 ? 'Basic' : 'Premium'} Plan`,
          description: `${i === 0 ? 'Standard' : 'Advanced'} plan for ${course.name}`,
          course_id: course.id,
          price: price,
          sessions_count: sessionCount,
          validity_days: validityDays,
          status: 'active'
        });
      }
    }

    const { data: createdPlans, error: plansError } = await supabase
      .from('session_plans')
      .insert(sessionPlans)
      .select();

    if (plansError || !createdPlans) {
      console.error('Error creating session plans:', plansError);
      throw plansError;
    }
    console.log(`Created ${createdPlans.length} session plans`);

    // Step 4: Create session packs for each student
    const packs = [];
    for (const student of studentUsers) {
      // Get student preferences to align with pack subject
      const { data: studentData } = await supabase
        .from('students')
        .select('preferred_subjects, preferred_teachers')
        .eq('id', student.id)
        .single();

      let preferredSubject: SubjectType = 'Guitar';
      let preferredTeacherId = null;
      
      if (studentData && studentData.preferred_subjects && studentData.preferred_subjects.length > 0) {
        preferredSubject = studentData.preferred_subjects[0];
      } else {
        // Fallback to random subject
        preferredSubject = SUBJECTS[getRandomInt(0, SUBJECTS.length - 1)];
      }

      if (studentData && studentData.preferred_teachers && studentData.preferred_teachers.length > 0) {
        preferredTeacherId = studentData.preferred_teachers[0];
      }

      // Create a pack matching student's preference
      const packSize = PACK_SIZES[getRandomInt(0, PACK_SIZES.length - 1)] as PackSize;
      const sessionType = SESSION_TYPES[getRandomInt(0, SESSION_TYPES.length - 1)] as SessionType;
      const location = LOCATIONS[getRandomInt(0, LOCATIONS.length - 1)] as LocationType;
      const weeklyFrequency = WEEKLY_FREQUENCIES[getRandomInt(0, WEEKLY_FREQUENCIES.length - 1)] as WeeklyFrequency;
      const purchasedDate = getRandomPastDate(30, 60);
      const expiryDate = new Date(purchasedDate);
      expiryDate.setDate(expiryDate.getDate() + (packSize * 7)); // Expiry date based on pack size
      
      packs.push({
        student_id: student.id,
        size: packSize.toString(),
        subject: preferredSubject,
        session_type: sessionType,
        location: location,
        purchased_date: formatDate(purchasedDate),
        expiry_date: formatDate(expiryDate),
        remaining_sessions: packSize,
        is_active: true,
        weekly_frequency: weeklyFrequency
      });
    }

    const { data: createdPacks, error: packsError } = await supabase
      .from('session_packs')
      .insert(packs)
      .select();

    if (packsError || !createdPacks) {
      console.error('Error creating session packs:', packsError);
      throw packsError;
    }
    console.log(`Created ${createdPacks.length} session packs`);

    // Create sessions for each pack
    const sessions = [];
    const sessionsStudents = [];

    for (const pack of createdPacks) {
      // Find teachers who can teach this subject
      const { data: eligibleTeachers } = await supabase
        .from('teachers')
        .select('id, profiles(name)')
        .contains('subjects', [pack.subject]);

      if (!eligibleTeachers || eligibleTeachers.length === 0) {
        console.warn(`No eligible teachers found for subject ${pack.subject}, skipping sessions for pack ${pack.id}`);
        continue;
      }

      // Create 2-3 future sessions per pack
      const numSessions = getRandomInt(2, 3);
      
      for (let i = 0; i < numSessions; i++) {
        const teacherIndex = getRandomInt(0, eligibleTeachers.length - 1);
        const sessionDate = getRandomFutureDate(i * 7 + 1, i * 7 + 7); // Spread sessions across weeks
        
        const session = {
          teacher_id: eligibleTeachers[teacherIndex].id,
          pack_id: pack.id,
          subject: pack.subject,
          session_type: pack.session_type,
          location: pack.location,
          date_time: formatDate(sessionDate),
          duration: pack.session_type === 'Focus' ? 45 : 60, // Focus sessions are 45 minutes
          status: 'Scheduled',
          notes: `Session ${i + 1} for ${pack.subject}`,
          reschedule_count: 0
        };
        
        sessions.push(session);
      }

      // Create 1-2 past sessions per pack
      const numPastSessions = getRandomInt(1, 2);
      
      for (let i = 0; i < numPastSessions; i++) {
        const teacherIndex = getRandomInt(0, eligibleTeachers.length - 1);
        const sessionDate = getRandomPastDate(i * 7 + 1, i * 7 + 7); // Spread past sessions
        
        const session = {
          teacher_id: eligibleTeachers[teacherIndex].id,
          pack_id: pack.id,
          subject: pack.subject,
          session_type: pack.session_type,
          location: pack.location,
          date_time: formatDate(sessionDate),
          duration: pack.session_type === 'Focus' ? 45 : 60, // Focus sessions are 45 minutes
          status: 'Present', // Past sessions are marked as attended
          notes: `Completed session for ${pack.subject}`,
          reschedule_count: 0
        };
        
        sessions.push(session);
      }
    }

    const { data: createdSessions, error: sessionsError } = await supabase
      .from('sessions')
      .insert(sessions)
      .select();

    if (sessionsError || !createdSessions) {
      console.error('Error creating sessions:', sessionsError);
      throw sessionsError;
    }
    console.log(`Created ${createdSessions.length} sessions`);

    // Link sessions to students
    for (const session of createdSessions) {
      // Get the student associated with this pack
      const { data: packData } = await supabase
        .from('session_packs')
        .select('student_id')
        .eq('id', session.pack_id)
        .single();

      if (packData) {
        sessionsStudents.push({
          session_id: session.id,
          student_id: packData.student_id
        });
      }
    }

    if (sessionsStudents.length > 0) {
      const { error: sessionsStudentsError } = await supabase
        .from('session_students')
        .insert(sessionsStudents);

      if (sessionsStudentsError) {
        console.error('Error linking sessions to students:', sessionsStudentsError);
        throw sessionsStudentsError;
      }
      console.log(`Created ${sessionsStudents.length} session-student links`);
    }

    // Step 5: Create enrollments and progress records
    const enrollments = [];
    
    // For each student, enroll in 1-2 courses
    for (const student of studentUsers) {
      // Find the student's preferred subjects
      const { data: studentData } = await supabase
        .from('students')
        .select('preferred_subjects')
        .eq('id', student.id)
        .single();

      let preferredSubjects: SubjectType[] = [];
      
      if (studentData && studentData.preferred_subjects) {
        preferredSubjects = studentData.preferred_subjects;
      }
      
      // Find courses that match the preferred subjects
      let eligibleCourses = createdCourses;
      if (preferredSubjects.length > 0) {
        eligibleCourses = createdCourses.filter(course => 
          preferredSubjects.includes(course.instrument)
        );
      }

      if (eligibleCourses.length === 0) {
        eligibleCourses = createdCourses; // Fallback to all courses
      }

      const numEnrollments = Math.min(getRandomInt(1, 2), eligibleCourses.length);
      const selectedCourses = getRandomItems(eligibleCourses, numEnrollments);
      
      for (const course of selectedCourses) {
        // Find session plans for this course
        const { data: coursePlans } = await supabase
          .from('session_plans')
          .select('id')
          .eq('course_id', course.id);

        let planId = null;
        if (coursePlans && coursePlans.length > 0) {
          planId = coursePlans[getRandomInt(0, coursePlans.length - 1)].id;
        }

        const startDate = getRandomPastDate(10, 60);
        const completionPercentage = getRandomInt(5, 80);
        
        enrollments.push({
          student_id: student.id,
          course_id: course.id,
          plan_id: planId,
          start_date: formatDate(startDate),
          status: 'active',
          completion_percentage: completionPercentage,
          notes: `${student.name}'s enrollment in ${course.name}`
        });
      }
    }

    const { data: createdEnrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .insert(enrollments)
      .select();

    if (enrollmentsError || !createdEnrollments) {
      console.error('Error creating enrollments:', enrollmentsError);
      throw enrollmentsError;
    }
    console.log(`Created ${createdEnrollments.length} enrollments`);

    // Create student progress records
    const progressRecords = [];
    for (const enrollment of createdEnrollments) {
      // Find the course details for this enrollment
      const { data: course } = await supabase
        .from('courses')
        .select('duration_value')
        .eq('id', enrollment.course_id)
        .single();

      // Find a teacher for this course to update progress
      const { data: courseTeachers } = await supabase
        .from('course_teachers')
        .select('teacher_id')
        .eq('course_id', enrollment.course_id);

      let teacherId;
      if (courseTeachers && courseTeachers.length > 0) {
        teacherId = courseTeachers[getRandomInt(0, courseTeachers.length - 1)].teacher_id;
      } else {
        // Fallback to any teacher
        teacherId = teacherUsers[getRandomInt(0, teacherUsers.length - 1)].id;
      }

      // Calculate current module and session based on completion percentage
      const totalDuration = course ? course.duration_value : 12;
      const currentModule = Math.max(1, Math.floor((enrollment.completion_percentage / 100) * totalDuration / 2));
      const currentSession = Math.max(1, Math.floor((enrollment.completion_percentage / 100) * totalDuration));
      
      progressRecords.push({
        enrollment_id: enrollment.id,
        completion_percentage: enrollment.completion_percentage,
        last_updated_by: teacherId,
        module_number: currentModule,
        session_number: currentSession,
        teacher_notes: getRandomInt(0, 1) ? `Teacher notes for enrollment ${enrollment.id}` : null,
        student_notes: getRandomInt(0, 1) ? `Student notes for enrollment ${enrollment.id}` : null
      });
    }

    if (progressRecords.length > 0) {
      const { error: progressError } = await supabase
        .from('student_progress')
        .insert(progressRecords);

      if (progressError) {
        console.error('Error creating progress records:', progressError);
        throw progressError;
      }
      console.log(`Created ${progressRecords.length} progress records`);
    }

    // Step 6: Create fee plans, invoices, and payments
    const feePlans = [];
    const invoices = [];
    const payments = [];
    
    for (const student of studentUsers) {
      // Create fee plan for the student
      const totalAmount = getRandomInt(500, 1500);
      const numPayments = getRandomInt(1, 3); // 1-3 installments
      const installmentAmount = Math.floor(totalAmount / numPayments);
      const dueDates = [];
      
      // Create due dates for installments
      for (let i = 0; i < numPayments; i++) {
        let dueDate;
        if (i === 0) {
          dueDate = getRandomPastDate(0, 15); // First payment due recently or already
        } else {
          dueDate = getRandomFutureDate(i * 30, i * 30 + 15); // Future payments every ~30 days
        }
        
        // Last payment might need adjustment to match the total
        const amount = i === numPayments - 1 
          ? totalAmount - (installmentAmount * (numPayments - 1)) 
          : installmentAmount;

        dueDates.push({
          date: formatDate(dueDate),
          amount: amount
        });
      }
      
      // Create fee plan
      feePlans.push({
        student_id: student.id,
        plan_title: `${student.name}'s Payment Plan`,
        total_amount: totalAmount,
        due_dates: dueDates,
        late_fee_policy: {
          rate_per_day: 5,
          maximum: 50
        }
      });
    }

    const { data: createdFeePlans, error: feePlansError } = await supabase
      .from('fee_plans')
      .insert(feePlans)
      .select();

    if (feePlansError || !createdFeePlans) {
      console.error('Error creating fee plans:', feePlansError);
      throw feePlansError;
    }
    console.log(`Created ${createdFeePlans.length} fee plans`);
    
    // Create invoices for each fee plan
    for (const feePlan of createdFeePlans) {
      // Create 1 invoice per fee plan
      const { data: packData } = await supabase
        .from('session_packs')
        .select('id')
        .eq('student_id', feePlan.student_id)
        .limit(1)
        .single();

      const packId = packData ? packData.id : null;
      
      // Get first due date from fee plan
      const firstDueDate = feePlan.due_dates[0];
      
      invoices.push({
        student_id: feePlan.student_id,
        pack_id: packId,
        amount: feePlan.total_amount,
        status: getRandomInt(0, 1) ? 'paid' : 'pending',
        due_date: firstDueDate.date,
        notes: `Invoice for ${feePlan.plan_title}`
      });
    }

    const { data: createdInvoices, error: invoicesError } = await supabase
      .from('invoices')
      .insert(invoices)
      .select();

    if (invoicesError || !createdInvoices) {
      console.error('Error creating invoices:', invoicesError);
      throw invoicesError;
    }
    console.log(`Created ${createdInvoices.length} invoices`);

    // Create payment records for paid invoices
    for (const invoice of createdInvoices) {
      if (invoice.status === 'paid') {
        // Choose a random admin to record the payment
        const adminId = adminUsers[getRandomInt(0, adminUsers.length - 1)].id;
        const paymentMethods = ['cash', 'card', 'bank_transfer', 'upi'];
        const paymentMethod = paymentMethods[getRandomInt(0, paymentMethods.length - 1)];
        const paymentDate = getRandomPastDate(1, 10); // Payment made 1-10 days ago
        
        payments.push({
          invoice_id: invoice.id,
          amount: invoice.amount,
          payment_date: formatDate(paymentDate),
          payment_method: paymentMethod,
          reference_number: `REF-${Math.floor(Math.random() * 10000)}`,
          recorded_by_user_id: adminId,
          notes: `Payment for invoice ${invoice.id}`
        });
      }
    }

    if (payments.length > 0) {
      const { error: paymentsError } = await supabase
        .from('payment_records')
        .insert(payments);

      if (paymentsError) {
        console.error('Error creating payment records:', paymentsError);
        throw paymentsError;
      }
      console.log(`Created ${payments.length} payment records`);
    }

    // Step 7: Create attendance events and student feedback
    const attendanceEvents = [];
    const feedback = [];
    
    // Create attendance records for past sessions
    const pastSessions = createdSessions.filter(session => 
      new Date(session.date_time) < new Date() && session.status === 'Present'
    );
    
    for (const session of pastSessions) {
      // Get the teacher for this session
      const { data: sessionTeacher } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.teacher_id)
        .single();

      const teacherId = sessionTeacher ? sessionTeacher.id : adminUsers[0].id;
      
      attendanceEvents.push({
        session_id: session.id,
        status: 'Present',
        marked_by_user_id: teacherId,
        marked_at: session.date_time,
        notes: `Student attended the ${session.subject} session.`
      });

      // Create feedback for some sessions (50% chance)
      if (getRandomInt(0, 1) === 1) {
        // Get the student for this session
        const { data: sessionStudent } = await supabase
          .from('session_students')
          .select('student_id')
          .eq('session_id', session.id)
          .single();

        if (sessionStudent) {
          feedback.push({
            student_id: sessionStudent.student_id,
            teacher_id: session.teacher_id,
            session_id: session.id,
            feedback_text: `Feedback for the ${session.subject} session. The teacher was very helpful.`,
            rating: getRandomInt(3, 5) // 3-5 stars
          });
        }
      }
    }

    if (attendanceEvents.length > 0) {
      const { error: attendanceError } = await supabase
        .from('attendance_events')
        .insert(attendanceEvents);

      if (attendanceError) {
        console.error('Error creating attendance events:', attendanceError);
        throw attendanceError;
      }
      console.log(`Created ${attendanceEvents.length} attendance events`);
    }

    if (feedback.length > 0) {
      const { error: feedbackError } = await supabase
        .from('student_feedback')
        .insert(feedback);

      if (feedbackError) {
        console.error('Error creating student feedback:', feedbackError);
        throw feedbackError;
      }
      console.log(`Created ${feedback.length} feedback entries`);
    }

    // Step 8: Create time slots, reminders, and system settings
    const timeSlots = [];
    
    // Create 2-3 time slots per teacher
    for (const teacher of teacherUsers) {
      const daysOfWeek = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
      const numSlots = getRandomInt(2, 3);
      const selectedDays = getRandomItems(daysOfWeek, numSlots);
      
      for (const day of selectedDays) {
        // Morning or afternoon slot
        const isMorning = getRandomInt(0, 1) === 0;
        const startHour = isMorning ? getRandomInt(9, 12) : getRandomInt(13, 16);
        const endHour = startHour + getRandomInt(2, 4);
        
        timeSlots.push({
          teacher_id: teacher.id,
          day: day,
          start_time: `${startHour}:00:00`,
          end_time: `${endHour}:00:00`,
          location: LOCATIONS[getRandomInt(0, 1)] as LocationType,
          is_recurring: true
        });
      }
    }

    if (timeSlots.length > 0) {
      const { error: timeSlotsError } = await supabase
        .from('time_slots')
        .insert(timeSlots);

      if (timeSlotsError) {
        console.error('Error creating time slots:', timeSlotsError);
        throw timeSlotsError;
      }
      console.log(`Created ${timeSlots.length} time slots`);
    }

    // Create reminders
    const reminders = [];
    // Session reminders for future sessions
    const futureSessions = createdSessions.filter(session => 
      new Date(session.date_time) > new Date() && session.status === 'Scheduled'
    ).slice(0, 5); // Just create reminders for a few sessions
    
    for (const session of futureSessions) {
      // Get the student for this session
      const { data: sessionStudent } = await supabase
        .from('session_students')
        .select('student_id')
        .eq('session_id', session.id)
        .single();

      if (sessionStudent) {
        // Reminder sent a day before the session
        const sessionDate = new Date(session.date_time);
        const reminderDate = new Date(sessionDate);
        reminderDate.setDate(sessionDate.getDate() - 1);

        reminders.push({
          type: 'session',
          recipient_id: sessionStudent.student_id,
          related_id: session.id,
          message: `Reminder: You have a ${session.subject} lesson tomorrow at ${new Date(session.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
          send_at: formatDate(reminderDate),
          status: 'pending',
          channel: 'email'
        });
      }
    }

    // Payment reminders
    const pendingInvoices = createdInvoices.filter(invoice => invoice.status === 'pending');
    
    for (const invoice of pendingInvoices) {
      // Reminder sent 3 days before due date
      const dueDate = new Date(invoice.due_date);
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(dueDate.getDate() - 3);

      reminders.push({
        type: 'payment',
        recipient_id: invoice.student_id,
        related_id: invoice.id,
        message: `Payment reminder: Your payment of $${invoice.amount} is due on ${new Date(invoice.due_date).toLocaleDateString()}`,
        send_at: formatDate(reminderDate),
        status: 'pending',
        channel: 'email'
      });
    }

    if (reminders.length > 0) {
      const { error: remindersError } = await supabase
        .from('reminders')
        .insert(reminders);

      if (remindersError) {
        console.error('Error creating reminders:', remindersError);
        throw remindersError;
      }
      console.log(`Created ${reminders.length} reminders`);
    }

    // Create system settings if they don't exist
    const { data: existingSettings } = await supabase
      .from('system_settings')
      .select('key')
      .limit(1);

    if (!existingSettings || existingSettings.length === 0) {
      const systemSettings = [
        {
          key: 'session_durations',
          category: 'sessions',
          value: {
            solo: 60,
            duo: 60,
            focus: 45
          }
        },
        {
          key: 'session_limits',
          category: 'sessions', 
          value: {
            max_weekly_per_teacher: 25,
            max_daily_per_teacher: 5,
            advance_booking_days: 60
          }
        },
        {
          key: 'pack_sizes',
          category: 'pricing',
          value: {
            "4": 250,
            "10": 600,
            "20": 1100,
            "30": 1500
          }
        },
        {
          key: 'school_info',
          category: 'general',
          value: {
            name: "Harmony Music School",
            address: "123 Music Ave, Melodytown",
            phone: "555-123-4567",
            email: "contact@harmonymusic.com"
          }
        }
      ];

      const { error: settingsError } = await supabase
        .from('system_settings')
        .insert(systemSettings);

      if (settingsError) {
        console.error('Error creating system settings:', settingsError);
        throw settingsError;
      }
      console.log(`Created ${systemSettings.length} system settings`);
    }

    return {
      teachers: teacherUsers,
      students: studentUsers,
      admins: adminUsers,
      courses: createdCourses,
      sessionPlans: createdPlans,
      packs: createdPacks,
      sessions: createdSessions,
      enrollments: createdEnrollments,
      feePlans: createdFeePlans,
      invoices: createdInvoices,
      payments
    };

  } catch (error) {
    console.error('Error populating database:', error);
    throw error;
  }
};

// Export a function to be called from UI
export const runDatabaseSeeding = async (): Promise<void> => {
  try {
    toast.info('Starting to populate database with test data...');
    const data = await populateDatabase();
    toast.success(`Successfully populated database with test data!`);
    
    // Log results
    console.log(`
      Data seeding completed successfully:
      - Teachers: ${data.teachers.length}
      - Students: ${data.students.length}
      - Admins: ${data.admins.length}
      - Courses: ${data.courses.length}
      - Session Plans: ${data.sessionPlans.length}
      - Session Packs: ${data.packs.length}
      - Sessions: ${data.sessions.length}
      - Enrollments: ${data.enrollments.length}
      - Fee Plans: ${data.feePlans.length}
      - Invoices: ${data.invoices.length}
      - Payments: ${data.payments.length}
    `);
    
    return data;
  } catch (error) {
    console.error('Error running database seeding:', error);
    toast.error('Failed to populate database. Check the console for details.');
    throw error;
  }
};
