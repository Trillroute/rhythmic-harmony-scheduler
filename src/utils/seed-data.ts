
import { supabase } from '@/integrations/supabase/client';
import { SubjectType, SessionType, LocationType, UserRole, PackSize, WeeklyFrequency, AttendanceStatus } from '@/lib/types';
import { addDays, addHours, addWeeks, format, subDays } from 'date-fns';

/**
 * Complete database seeding functionality for the music school application
 */

// Helper to get random item from array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate a random date between two dates
const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Format a date for Supabase
const formatDate = (date: Date): string => {
  return date.toISOString();
};

// Generate random subject from available options
const getRandomSubject = (): SubjectType => {
  return getRandomItem(['Guitar', 'Piano', 'Drums', 'Ukulele', 'Vocal']) as SubjectType;
};

// Generate random session type
const getRandomSessionType = (): SessionType => {
  return getRandomItem(['Solo', 'Duo', 'Focus']) as SessionType;
};

// Generate random location type
const getRandomLocation = (): LocationType => {
  return getRandomItem(['Online', 'Offline']) as LocationType;
};

export interface SeededData {
  teachers: any[];
  students: any[];
  admins: any[];
  courses: any[];
  sessionPlans: any[];
  packs: any[];
  sessions: any[];
  enrollments: any[];
  feePlans: any[];
  invoices: any[];
  payments: any[];
  attendance: any[];
  feedback: any[];
  timeSlots: any[];
  reminders: any[];
  settings: any[];
}

export async function runDatabaseSeeding(): Promise<SeededData> {
  // Initialize results object
  const results: SeededData = {
    teachers: [],
    students: [],
    admins: [],
    courses: [],
    sessionPlans: [],
    packs: [],
    sessions: [],
    enrollments: [],
    feePlans: [],
    invoices: [],
    payments: [],
    attendance: [],
    feedback: [],
    timeSlots: [],
    reminders: [],
    settings: []
  };
  
  try {
    // Step 1: Get existing users from Supabase Auth
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email, role');
      
    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }
    
    if (!existingProfiles || existingProfiles.length === 0) {
      throw new Error('No existing user profiles found. Please create users first.');
    }
    
    console.log(`Found ${existingProfiles.length} existing users`);
    
    // Group users by role
    const teachers = existingProfiles.filter(p => p.role === 'teacher');
    const students = existingProfiles.filter(p => p.role === 'student');
    const admins = existingProfiles.filter(p => p.role === 'admin');
    
    if (teachers.length === 0) {
      throw new Error('No teacher profiles found. Please create at least one teacher user.');
    }
    
    if (students.length === 0) {
      throw new Error('No student profiles found. Please create at least one student user.');
    }
    
    // Step 2: Add role-specific data for teachers and students
    // Add teacher subjects
    for (const teacher of teachers) {
      const subjects = [getRandomSubject()];
      // Add 1-2 more random subjects
      for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
        const subject = getRandomSubject();
        if (!subjects.includes(subject)) {
          subjects.push(subject);
        }
      }
      
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .update({
          subjects,
          max_weekly_sessions: 15 + Math.floor(Math.random() * 10) // 15-25
        })
        .eq('id', teacher.id)
        .select();
        
      if (teacherError) {
        console.error(`Error updating teacher ${teacher.id}: ${teacherError.message}`);
        continue;
      }
      
      results.teachers.push(teacherData?.[0] || { id: teacher.id, subjects });
    }
    
    // Add student preferences
    for (const student of students) {
      const preferredSubjects = [getRandomSubject()];
      if (Math.random() > 0.5) {
        const extraSubject = getRandomSubject();
        if (!preferredSubjects.includes(extraSubject)) {
          preferredSubjects.push(extraSubject);
        }
      }
      
      // Randomly assign a preferred teacher
      const preferredTeachers = Math.random() > 0.5 
        ? [getRandomItem(teachers).id] 
        : [];
        
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .update({
          preferred_subjects: preferredSubjects,
          preferred_teachers: preferredTeachers,
          notes: Math.random() > 0.7 
            ? `Student interested in ${preferredSubjects.join(' and ')}. Prefers lessons in the evening.` 
            : null
        })
        .eq('id', student.id)
        .select();
        
      if (studentError) {
        console.error(`Error updating student ${student.id}: ${studentError.message}`);
        continue;
      }
      
      results.students.push(studentData?.[0] || { id: student.id, preferred_subjects: preferredSubjects });
    }
    
    // Step 3: Create courses and session plans
    const instruments = ['Guitar', 'Piano', 'Drums', 'Ukulele', 'Vocal'];
    const sessionTypes = ['Solo', 'Duo', 'Focus'];
    const coursesToCreate = 5;
    
    for (let i = 0; i < coursesToCreate; i++) {
      const instrument = instruments[i % instruments.length] as SubjectType;
      const sessionType = sessionTypes[i % sessionTypes.length] as SessionType;
      const durationWeeks = [8, 10, 12, 16][Math.floor(Math.random() * 4)];
      const sessionDuration = sessionType === 'Focus' ? 45 : 60;
      
      // Create a course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert([{
          name: `${instrument} ${sessionType} ${durationWeeks}-Week Course`,
          description: `Complete ${instrument} course for ${sessionType} learning over ${durationWeeks} weeks`,
          instrument,
          session_type: sessionType,
          duration_type: 'weeks',
          duration_value: durationWeeks,
          session_duration: sessionDuration,
          status: 'active',
          syllabus: `Weekly sessions covering fundamentals of ${instrument} technique and theory`
        }])
        .select();
        
      if (courseError) {
        console.error(`Error creating course: ${courseError.message}`);
        continue;
      }
      
      const courseId = courseData?.[0]?.id;
      results.courses.push(courseData?.[0]);
      
      // Assign 1-2 teachers to the course
      const assignedTeacherIds = [getRandomItem(teachers).id];
      if (teachers.length > 1 && Math.random() > 0.6) {
        const secondTeacher = getRandomItem(teachers);
        if (secondTeacher.id !== assignedTeacherIds[0]) {
          assignedTeacherIds.push(secondTeacher.id);
        }
      }
      
      for (const teacherId of assignedTeacherIds) {
        const { error: teacherError } = await supabase
          .from('course_teachers')
          .insert([{
            course_id: courseId,
            teacher_id: teacherId
          }]);
          
        if (teacherError) {
          console.error(`Error assigning teacher to course: ${teacherError.message}`);
        }
      }
      
      // Create a session plan for the course
      const sessionsCount = durationWeeks;
      const price = 500 + Math.floor(Math.random() * 500); // $500-$1000
      const validityDays = durationWeeks * 7 + 14; // Course duration plus 2 weeks
      
      const { data: planData, error: planError } = await supabase
        .from('session_plans')
        .insert([{
          name: `${instrument} ${sessionType} Standard Plan`,
          description: `${sessionsCount} sessions of ${sessionDuration} minutes each`,
          course_id: courseId,
          price,
          sessions_count: sessionsCount,
          validity_days: validityDays,
          status: 'active'
        }])
        .select();
        
      if (planError) {
        console.error(`Error creating session plan: ${planError.message}`);
      } else {
        results.sessionPlans.push(planData?.[0]);
      }
    }
    
    // Step 4: Create session packs and scheduled sessions
    for (const student of students) {
      // Create a session pack for each student
      const subject = getRandomItem(results.students.find(s => s.id === student.id)?.preferred_subjects || ['Guitar']) as SubjectType;
      const sessionType = getRandomItem(['Solo', 'Duo']) as SessionType;
      const location = getRandomItem(['Online', 'Offline']) as LocationType;
      const size = getRandomItem(['10', '20']) as PackSize;
      const remainingSessions = Math.floor(Math.random() * parseInt(size));
      const weeklyFrequency = getRandomItem(['once', 'twice']) as WeeklyFrequency;
      
      const purchasedDate = subDays(new Date(), Math.floor(Math.random() * 60)); // 0-60 days ago
      const expiryDate = addDays(purchasedDate, 90); // 90 days validity
      
      const { data: packData, error: packError } = await supabase
        .from('session_packs')
        .insert([{
          student_id: student.id,
          size,
          subject,
          session_type: sessionType,
          location,
          remaining_sessions: remainingSessions,
          is_active: true,
          weekly_frequency: weeklyFrequency,
          purchased_date: formatDate(purchasedDate),
          expiry_date: formatDate(expiryDate)
        }])
        .select();
        
      if (packError) {
        console.error(`Error creating session pack for student ${student.id}: ${packError.message}`);
        continue;
      }
      
      const packId = packData?.[0]?.id;
      results.packs.push(packData?.[0]);
      
      // Create sessions for this pack
      const sessionCount = Math.min(3, remainingSessions); // Create up to 3 sessions
      const assignedTeacher = getRandomItem(teachers.filter(t => {
        const teacherSubjects = results.teachers.find(rt => rt.id === t.id)?.subjects || [];
        return teacherSubjects.includes(subject);
      }));
      
      if (!assignedTeacher) continue;
      
      for (let i = 0; i < sessionCount; i++) {
        const sessionDate = addDays(new Date(), i * 7 + Math.floor(Math.random() * 3)); // Next few weeks
        const sessionTime = new Date(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate(),
          13 + Math.floor(Math.random() * 6), // 1 PM - 6 PM
          0
        );
        
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .insert([{
            teacher_id: assignedTeacher.id,
            pack_id: packId,
            subject,
            session_type: sessionType,
            location,
            date_time: formatDate(sessionTime),
            duration: sessionType === 'Focus' ? 45 : 60,
            status: 'Scheduled',
            notes: Math.random() > 0.7 ? `Regular session for ${subject}` : null
          }])
          .select();
          
        if (sessionError) {
          console.error(`Error creating session: ${sessionError.message}`);
          continue;
        }
        
        const sessionId = sessionData?.[0]?.id;
        results.sessions.push(sessionData?.[0]);
        
        // Link student to session
        const { error: linkError } = await supabase
          .from('session_students')
          .insert([{
            session_id: sessionId,
            student_id: student.id
          }]);
          
        if (linkError) {
          console.error(`Error linking student to session: ${linkError.message}`);
        }
        
        // Create attendance records for some past sessions
        if (sessionTime < new Date()) {
          const status = getRandomItem([
            'Present', 'Present', 'Present', 'Present', 'Absent', 
            'Cancelled by Student', 'Cancelled by Teacher'
          ]) as AttendanceStatus;
          
          const { data: updatedSession, error: statusError } = await supabase
            .from('sessions')
            .update({ status })
            .eq('id', sessionId)
            .select();
            
          if (statusError) {
            console.error(`Error updating session status: ${statusError.message}`);
          } else {
            // Log attendance event
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('attendance_events')
              .insert([{
                session_id: sessionId,
                status,
                marked_by_user_id: getRandomItem(admins).id || assignedTeacher.id,
                notes: status === 'Present' 
                  ? 'Student attended on time' 
                  : (status === 'Absent' 
                    ? 'Student did not show up' 
                    : `Session ${status.toLowerCase()}`)
              }])
              .select();
              
            if (attendanceError) {
              console.error(`Error creating attendance event: ${attendanceError.message}`);
            } else {
              results.attendance.push(attendanceData?.[0]);
            }
            
            // Add student feedback for completed sessions
            if (status === 'Present' && Math.random() > 0.5) {
              const rating = 3 + Math.floor(Math.random() * 3); // 3-5 stars
              const { data: feedbackData, error: feedbackError } = await supabase
                .from('student_feedback')
                .insert([{
                  student_id: student.id,
                  teacher_id: assignedTeacher.id,
                  session_id: sessionId,
                  feedback_text: `Great ${subject} session! Learned a lot about technique.`,
                  rating
                }])
                .select();
                
              if (feedbackError) {
                console.error(`Error creating feedback: ${feedbackError.message}`);
              } else {
                results.feedback.push(feedbackData?.[0]);
              }
            }
          }
        }
      }
    }
    
    // Step 5: Create enrollments and progress records
    const availableCourses = results.courses;
    for (const student of students) {
      // Enroll each student in 1-2 courses
      const enrollmentCount = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < Math.min(enrollmentCount, availableCourses.length); i++) {
        const course = availableCourses[i];
        const startDate = subDays(new Date(), 30 + Math.floor(Math.random() * 60));
        
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .insert([{
            student_id: student.id,
            course_id: course.id,
            start_date: formatDate(startDate),
            status: 'active',
            completion_percentage: Math.floor(Math.random() * 101), // 0-100%
            notes: Math.random() > 0.7 ? 'Student is progressing well' : null
          }])
          .select();
          
        if (enrollmentError) {
          console.error(`Error creating enrollment: ${enrollmentError.message}`);
          continue;
        }
        
        results.enrollments.push(enrollmentData?.[0]);
        
        // Add progress records
        const enrollmentId = enrollmentData?.[0]?.id;
        const maxModules = 10;
        const completedModules = Math.floor(Math.random() * maxModules);
        
        for (let module = 1; module <= completedModules; module++) {
          const { data: progressData, error: progressError } = await supabase
            .from('student_progress')
            .insert([{
              enrollment_id: enrollmentId,
              module_number: module,
              session_number: module,
              completion_percentage: Math.round((module / maxModules) * 100),
              last_updated_by: getRandomItem([...teachers, ...admins]).id,
              teacher_notes: Math.random() > 0.6 ? `Completed module ${module} successfully` : null,
              student_notes: Math.random() > 0.8 ? `I found this module challenging but rewarding` : null
            }])
            .select();
            
          if (progressError) {
            console.error(`Error creating progress record: ${progressError.message}`);
          } else {
            results.progress = results.progress || [];
            results.progress.push(progressData?.[0]);
          }
        }
      }
    }
    
    // Step 6: Create fee plans, invoices and payments
    for (const student of students) {
      // Create a fee plan with 3 payment installments
      const totalAmount = 800 + Math.floor(Math.random() * 400); // $800-$1200
      const installmentAmount = Math.round(totalAmount / 3);
      const remainder = totalAmount - (installmentAmount * 2);
      
      const firstDueDate = subDays(new Date(), 60);
      const secondDueDate = addDays(firstDueDate, 30);
      const thirdDueDate = addDays(secondDueDate, 30);
      
      const dueDates = [
        { date: formatDate(firstDueDate), amount: installmentAmount },
        { date: formatDate(secondDueDate), amount: installmentAmount },
        { date: formatDate(thirdDueDate), amount: remainder }
      ];
      
      const lateFeePolicy = {
        rate_per_day: 1,
        maximum: 50
      };
      
      const { data: feePlanData, error: feePlanError } = await supabase
        .from('fee_plans')
        .insert([{
          student_id: student.id,
          plan_title: `Music Lessons ${format(new Date(), 'yyyy')} - ${student.name}`,
          total_amount: totalAmount,
          due_dates: dueDates,
          late_fee_policy: lateFeePolicy
        }])
        .select();
        
      if (feePlanError) {
        console.error(`Error creating fee plan: ${feePlanError.message}`);
        continue;
      }
      
      const feePlanId = feePlanData?.[0]?.id;
      results.feePlans.push(feePlanData?.[0]);
      
      // Create invoices for each due date
      for (let i = 0; i < dueDates.length; i++) {
        const dueDate = new Date(dueDates[i].date);
        const amount = dueDates[i].amount;
        
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .insert([{
            student_id: student.id,
            plan_id: feePlanId,
            amount,
            due_date: formatDate(dueDate),
            status: dueDate < new Date() ? 'paid' : 'pending',
            notes: `Installment ${i + 1} of 3`
          }])
          .select();
          
        if (invoiceError) {
          console.error(`Error creating invoice: ${invoiceError.message}`);
          continue;
        }
        
        results.invoices.push(invoiceData?.[0]);
        
        // Add payment for past due invoices
        if (dueDate < new Date()) {
          const paymentDate = addDays(dueDate, -1 * Math.floor(Math.random() * 5)); // Paid 0-5 days before due date
          
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .insert([{
              student_id: student.id,
              fee_plan_id: feePlanId,
              amount_paid: amount,
              paid_at: formatDate(paymentDate),
              payment_mode: getRandomItem(['Credit Card', 'Bank Transfer', 'Cash']),
              notes: `Payment for installment ${i + 1}`
            }])
            .select();
            
          if (paymentError) {
            console.error(`Error creating payment: ${paymentError.message}`);
          } else {
            results.payments.push(paymentData?.[0]);
          }
        }
      }
    }
    
    // Step 7: Create teacher time slots
    for (const teacher of teachers) {
      // Create 3-5 weekly time slots
      const slotCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < slotCount; i++) {
        const day = i % 5; // Monday (0) to Friday (4)
        const startHour = 13 + Math.floor(Math.random() * 6); // 1 PM - 6 PM
        
        const { data: slotData, error: slotError } = await supabase
          .from('time_slots')
          .insert([{
            teacher_id: teacher.id,
            day,
            start_time: `${startHour}:00:00`,
            end_time: `${startHour + 1}:00:00`,
            location: getRandomLocation(),
            is_recurring: true
          }])
          .select();
          
        if (slotError) {
          console.error(`Error creating time slot: ${slotError.message}`);
        } else {
          results.timeSlots.push(slotData?.[0]);
        }
      }
    }
    
    // Step 8: Create reminders
    for (const student of students) {
      const sessionReminder = {
        recipient_id: student.id,
        type: 'session',
        channel: 'email',
        send_at: formatDate(addDays(new Date(), 1)),
        message: 'Reminder: You have a music lesson scheduled tomorrow',
        status: 'pending',
        related_id: results.sessions.find(s => 
          results.sessions.find(ss => ss.id === s.id)?.students?.some(
            st => st.student_id === student.id
          )
        )?.id
      };
      
      const paymentReminder = {
        recipient_id: student.id,
        type: 'payment',
        channel: 'email',
        send_at: formatDate(addDays(new Date(), 3)),
        message: 'Reminder: Your next payment is due in 3 days',
        status: 'pending',
        related_id: results.invoices.find(i => i.student_id === student.id && i.status === 'pending')?.id
      };
      
      const { data: reminderData, error: reminderError } = await supabase
        .from('reminders')
        .insert([sessionReminder, paymentReminder])
        .select();
        
      if (reminderError) {
        console.error(`Error creating reminders: ${reminderError.message}`);
      } else {
        results.reminders.push(...(reminderData || []));
      }
    }
    
    // Step 9: Add system settings
    const systemSettings = [
      {
        category: 'email',
        key: 'reminder_template',
        value: { subject: 'Reminder: Upcoming Lesson', body: 'Hello {{student_name}}, this is a reminder about your lesson.' }
      },
      {
        category: 'fees',
        key: 'default_late_fee',
        value: { rate_per_day: 1, maximum: 50 }
      },
      {
        category: 'dashboard',
        key: 'default_view',
        value: { role: 'admin', page: 'overview' }
      }
    ];
    
    for (const setting of systemSettings) {
      const { data: settingData, error: settingError } = await supabase
        .from('system_settings')
        .insert([setting])
        .select();
        
      if (settingError) {
        console.error(`Error creating system setting: ${settingError.message}`);
      } else {
        results.settings.push(settingData?.[0]);
      }
    }
    
    console.log('Database seeding completed successfully');
    return results;
    
  } catch (error: any) {
    console.error('Database seeding failed:', error.message);
    throw error;
  }
}
