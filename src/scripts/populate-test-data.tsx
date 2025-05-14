
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AttendanceStatus, SubjectType } from '@/lib/types';

// Data generation page for admins to populate test data
const PopulateTestData: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ step: string; success: boolean; message?: string }[]>([]);

  const addResult = (step: string, success: boolean, message?: string) => {
    setResults(prev => [...prev, { step, success, message }]);
  };

  const handlePopulateData = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      // Step 1: Create users and profiles
      await createUsersAndProfiles();
      
      // Step 2: Create teachers and students
      await createTeachersAndStudents();
      
      // Step 3: Create courses
      await createCourses();
      
      // Step 4: Create session plans
      await createSessionPlans();
      
      // Step 5: Create session packs
      await createSessionPacks();
      
      // Step 6: Create enrollments
      await createEnrollments();
      
      // Step 7: Create sessions
      await createSessions();
      
      // Step 8: Create fee plans and payments
      await createFeePayments();
      
      // Step 9: Create system settings
      await createSystemSettings();
      
      toast.success("Test data successfully populated!");
    } catch (error) {
      console.error("Error populating test data:", error);
      toast.error("Failed to populate test data: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for creating users and profiles
  const createUsersAndProfiles = async () => {
    addResult("Creating users and profiles", true, "Starting...");
    
    try {
      // Create admin users
      const adminUsers = [
        { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
        { name: 'Sarah Admin', email: 'sarah@example.com', password: 'password123', role: 'admin' },
        { name: 'Tech Admin', email: 'tech@example.com', password: 'password123', role: 'admin' },
      ];
      
      // Create teacher users
      const teacherUsers = [
        { name: 'John Teacher', email: 'john@example.com', password: 'password123', role: 'teacher' },
        { name: 'Lisa Smith', email: 'lisa@example.com', password: 'password123', role: 'teacher' },
        { name: 'Mark Wilson', email: 'mark@example.com', password: 'password123', role: 'teacher' },
        { name: 'Anna Johnson', email: 'anna@example.com', password: 'password123', role: 'teacher' },
        { name: 'Robert Davis', email: 'robert@example.com', password: 'password123', role: 'teacher' },
      ];
      
      // Create student users
      const studentUsers = [
        { name: 'Alice Student', email: 'alice@example.com', password: 'password123', role: 'student' },
        { name: 'Bob Johnson', email: 'bob@example.com', password: 'password123', role: 'student' },
        { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123', role: 'student' },
        { name: 'Diana Prince', email: 'diana@example.com', password: 'password123', role: 'student' },
        { name: 'Edward Martin', email: 'edward@example.com', password: 'password123', role: 'student' },
        { name: 'Fiona Campbell', email: 'fiona@example.com', password: 'password123', role: 'student' },
        { name: 'George Miller', email: 'george@example.com', password: 'password123', role: 'student' },
        { name: 'Hannah White', email: 'hannah@example.com', password: 'password123', role: 'student' },
        { name: 'Ian Black', email: 'ian@example.com', password: 'password123', role: 'student' },
        { name: 'Julia Green', email: 'julia@example.com', password: 'password123', role: 'student' },
      ];
      
      // Create users through service role APIs
      const adminIds: string[] = [];
      for (const admin of adminUsers) {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', admin.email)
          .single();
        
        if (existingUser) {
          adminIds.push(existingUser.id);
          addResult(`Admin ${admin.name}`, true, "User already exists");
          continue;
        }
        
        // Create user through auth
        const { data: user, error: userError } = await supabase.auth.signUp({
          email: admin.email,
          password: admin.password,
          options: {
            data: {
              name: admin.name,
              role: admin.role,
            }
          }
        });
        
        if (userError) throw userError;
        if (user.user?.id) {
          adminIds.push(user.user.id);
          addResult(`Admin ${admin.name}`, true, "Created successfully");
        }
      }
      
      // Create teacher users
      const teacherIds: string[] = [];
      for (const teacher of teacherUsers) {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', teacher.email)
          .single();
        
        if (existingUser) {
          teacherIds.push(existingUser.id);
          addResult(`Teacher ${teacher.name}`, true, "User already exists");
          continue;
        }
        
        // Create user through auth
        const { data: user, error: userError } = await supabase.auth.signUp({
          email: teacher.email,
          password: teacher.password,
          options: {
            data: {
              name: teacher.name,
              role: teacher.role,
            }
          }
        });
        
        if (userError) throw userError;
        if (user.user?.id) {
          teacherIds.push(user.user.id);
          addResult(`Teacher ${teacher.name}`, true, "Created successfully");
        }
      }
      
      // Create student users
      const studentIds: string[] = [];
      for (const student of studentUsers) {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', student.email)
          .single();
        
        if (existingUser) {
          studentIds.push(existingUser.id);
          addResult(`Student ${student.name}`, true, "User already exists");
          continue;
        }
        
        // Create user through auth
        const { data: user, error: userError } = await supabase.auth.signUp({
          email: student.email,
          password: student.password,
          options: {
            data: {
              name: student.name,
              role: student.role,
            }
          }
        });
        
        if (userError) throw userError;
        if (user.user?.id) {
          studentIds.push(user.user.id);
          addResult(`Student ${student.name}`, true, "Created successfully");
        }
      }
      
      // Store IDs for further use
      localStorage.setItem('testData_adminIds', JSON.stringify(adminIds));
      localStorage.setItem('testData_teacherIds', JSON.stringify(teacherIds));
      localStorage.setItem('testData_studentIds', JSON.stringify(studentIds));
      
      addResult("Users and profiles created", true, `Created ${adminIds.length} admins, ${teacherIds.length} teachers, and ${studentIds.length} students`);
      
      return { adminIds, teacherIds, studentIds };
    } catch (error) {
      console.error("Error creating users:", error);
      addResult("Creating users and profiles", false, (error as Error).message);
      throw error;
    }
  };

  // Helper function for setting up teacher and student data
  const createTeachersAndStudents = async () => {
    try {
      addResult("Setting up teachers and students", true, "Starting...");
      
      // Get stored IDs
      const adminIds = JSON.parse(localStorage.getItem('testData_adminIds') || '[]');
      const teacherIds = JSON.parse(localStorage.getItem('testData_teacherIds') || '[]');
      const studentIds = JSON.parse(localStorage.getItem('testData_studentIds') || '[]');
      
      // Set up admin permissions
      const adminPermissions = [
        { id: adminIds[0], permissions: ['manage_users', 'manage_courses', 'view_reports'] },
        { id: adminIds[1], permissions: ['manage_users', 'manage_payments', 'view_reports'] },
        { id: adminIds[2], permissions: ['manage_courses', 'view_reports', 'system_settings'] },
      ];
      
      for (const admin of adminPermissions) {
        if (!admin.id) continue;
        
        // Check if admin entry already exists
        const { data: existingAdmin } = await supabase
          .from('admins')
          .select('id')
          .eq('id', admin.id)
          .maybeSingle();
          
        if (existingAdmin) {
          // Update existing admin
          await supabase
            .from('admins')
            .update({ permissions: admin.permissions })
            .eq('id', admin.id);
        } else {
          // Create new admin entry
          await supabase
            .from('admins')
            .insert({ id: admin.id, permissions: admin.permissions });
        }
      }
      
      // Set up teacher subjects and max sessions
      const teacherSubjects = [
        { id: teacherIds[0], subjects: ['Guitar', 'Piano'], maxWeeklySessions: 20 },
        { id: teacherIds[1], subjects: ['Drums', 'Vocal', 'Ukulele'], maxWeeklySessions: 15 },
        { id: teacherIds[2], subjects: ['Guitar', 'Ukulele'], maxWeeklySessions: 18 },
        { id: teacherIds[3], subjects: ['Piano', 'Vocal'], maxWeeklySessions: 22 },
        { id: teacherIds[4], subjects: ['Drums', 'Guitar'], maxWeeklySessions: 16 },
      ];
      
      for (const teacher of teacherSubjects) {
        if (!teacher.id) continue;
        
        // Check if teacher entry already exists
        const { data: existingTeacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('id', teacher.id)
          .maybeSingle();
          
        if (existingTeacher) {
          // Update existing teacher
          await supabase
            .from('teachers')
            .update({ 
              subjects: teacher.subjects,
              max_weekly_sessions: teacher.maxWeeklySessions
            })
            .eq('id', teacher.id);
        } else {
          // Create new teacher entry
          await supabase
            .from('teachers')
            .insert({
              id: teacher.id,
              subjects: teacher.subjects,
              max_weekly_sessions: teacher.maxWeeklySessions
            });
        }
      }
      
      // Set up student preferences and notes
      const studentPreferences = [
        { id: studentIds[0], subjects: ['Guitar'], preferredTeachers: [teacherIds[0]], notes: 'Interested in advanced techniques' },
        { id: studentIds[1], subjects: ['Piano', 'Guitar'], preferredTeachers: null, notes: 'Beginner level, needs patience' },
        { id: studentIds[2], subjects: ['Drums'], preferredTeachers: [teacherIds[1]], notes: 'Has own equipment' },
        { id: studentIds[3], subjects: ['Vocal', 'Ukulele'], preferredTeachers: [teacherIds[1]], notes: 'Previous choir experience' },
        { id: studentIds[4], subjects: ['Guitar'], preferredTeachers: [teacherIds[2]], notes: 'Practices regularly' },
        { id: studentIds[5], subjects: ['Piano'], preferredTeachers: [teacherIds[3]], notes: 'Has keyboard at home' },
        { id: studentIds[6], subjects: ['Drums', 'Guitar'], preferredTeachers: null, notes: 'Interested in rock music' },
        { id: studentIds[7], subjects: ['Vocal'], preferredTeachers: [teacherIds[3]], notes: 'Soprano, choir experience' },
        { id: studentIds[8], subjects: ['Ukulele', 'Guitar'], preferredTeachers: [teacherIds[2]], notes: 'Complete beginner' },
        { id: studentIds[9], subjects: ['Piano', 'Vocal'], preferredTeachers: null, notes: 'Interested in musical theater' },
      ];
      
      for (const student of studentPreferences) {
        if (!student.id) continue;
        
        // Check if student entry already exists
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id')
          .eq('id', student.id)
          .maybeSingle();
          
        if (existingStudent) {
          // Update existing student
          await supabase
            .from('students')
            .update({
              preferred_subjects: student.subjects,
              preferred_teachers: student.preferredTeachers,
              notes: student.notes
            })
            .eq('id', student.id);
        } else {
          // Create new student entry
          await supabase
            .from('students')
            .insert({
              id: student.id,
              preferred_subjects: student.subjects,
              preferred_teachers: student.preferredTeachers,
              notes: student.notes
            });
        }
      }
      
      addResult("Teachers and students setup", true, "Successfully set up teacher specializations and student preferences");
      
    } catch (error) {
      console.error("Error setting up teachers and students:", error);
      addResult("Setting up teachers and students", false, (error as Error).message);
      throw error;
    }
  };

  // Helper function for creating courses
  const createCourses = async () => {
    try {
      addResult("Creating courses", true, "Starting...");
      
      // Get stored IDs
      const teacherIds = JSON.parse(localStorage.getItem('testData_teacherIds') || '[]');
      
      // Define courses
      const courses = [
        { 
          name: 'Beginner Guitar', 
          description: 'Introduction to guitar basics', 
          instrument: 'Guitar' as SubjectType, 
          sessionType: 'Solo', 
          durationType: 'weeks', 
          durationValue: 12, 
          sessionDuration: 60,
          syllabus: 'Weekly progression through basic chords and techniques',
          teachers: [teacherIds[0], teacherIds[2]]
        },
        { 
          name: 'Intermediate Piano', 
          description: 'For students who know the basics', 
          instrument: 'Piano' as SubjectType, 
          sessionType: 'Solo', 
          durationType: 'weeks', 
          durationValue: 16, 
          sessionDuration: 60,
          syllabus: 'Focus on advanced chord progressions and sight reading',
          teachers: [teacherIds[3]]
        },
        { 
          name: 'Drum Basics', 
          description: 'Learn the fundamentals of percussion', 
          instrument: 'Drums' as SubjectType, 
          sessionType: 'Solo', 
          durationType: 'weeks', 
          durationValue: 10, 
          sessionDuration: 60,
          syllabus: 'Basic rhythm patterns and coordination exercises',
          teachers: [teacherIds[1], teacherIds[4]]
        },
        { 
          name: 'Vocal Techniques', 
          description: 'Improve your singing abilities', 
          instrument: 'Vocal' as SubjectType, 
          sessionType: 'Solo', 
          durationType: 'weeks', 
          durationValue: 12, 
          sessionDuration: 60,
          syllabus: 'Breath control and vocal range exercises',
          teachers: [teacherIds[1], teacherIds[3]]
        },
        { 
          name: 'Group Ukulele', 
          description: 'Learn ukulele in a fun group setting', 
          instrument: 'Ukulele' as SubjectType, 
          sessionType: 'Duo', 
          durationType: 'weeks', 
          durationValue: 8, 
          sessionDuration: 60,
          syllabus: 'Fun easy-to-learn chord progressions and strumming patterns',
          teachers: [teacherIds[1], teacherIds[2]]
        }
      ];
      
      const courseIds: string[] = [];
      
      // Insert courses and link teachers
      for (const course of courses) {
        // Check if course already exists
        const { data: existingCourse } = await supabase
          .from('courses')
          .select('id')
          .eq('name', course.name)
          .maybeSingle();
          
        let courseId: string;
        
        if (existingCourse) {
          courseId = existingCourse.id;
          // Update existing course
          await supabase
            .from('courses')
            .update({
              description: course.description,
              instrument: course.instrument,
              session_type: course.sessionType,
              duration_type: course.durationType,
              duration_value: course.durationValue,
              session_duration: course.sessionDuration,
              syllabus: course.syllabus,
              status: 'active'
            })
            .eq('id', courseId);
        } else {
          // Create new course
          const { data: newCourse, error: courseError } = await supabase
            .from('courses')
            .insert({
              name: course.name,
              description: course.description,
              instrument: course.instrument,
              session_type: course.sessionType,
              duration_type: course.durationType,
              duration_value: course.durationValue,
              session_duration: course.sessionDuration,
              syllabus: course.syllabus,
              status: 'active'
            })
            .select()
            .single();
            
          if (courseError) throw courseError;
          courseId = newCourse.id;
        }
        
        courseIds.push(courseId);
        
        // Link teachers to course
        // First remove existing links
        await supabase
          .from('course_teachers')
          .delete()
          .eq('course_id', courseId);
          
        // Then add new links
        for (const teacherId of course.teachers) {
          await supabase
            .from('course_teachers')
            .insert({
              course_id: courseId,
              teacher_id: teacherId
            });
        }
      }
      
      // Store course IDs for further use
      localStorage.setItem('testData_courseIds', JSON.stringify(courseIds));
      
      addResult("Courses created", true, `Created and linked ${courseIds.length} courses`);
      
    } catch (error) {
      console.error("Error creating courses:", error);
      addResult("Creating courses", false, (error as Error).message);
      throw error;
    }
  };

  // Helper function for creating session plans
  const createSessionPlans = async () => {
    try {
      addResult("Creating session plans", true, "Starting...");
      
      // Get stored IDs
      const courseIds = JSON.parse(localStorage.getItem('testData_courseIds') || '[]');
      
      // Define session plans
      const sessionPlans = [
        {
          name: 'Guitar Basics Plan',
          description: 'Complete beginner guitar course package',
          courseId: courseIds[0],
          price: 599,
          sessionsCount: 12,
          validityDays: 90,
          status: 'active'
        },
        {
          name: 'Piano Excellence',
          description: 'Comprehensive piano learning track',
          courseId: courseIds[1],
          price: 699,
          sessionsCount: 16,
          validityDays: 120,
          status: 'active'
        },
        {
          name: 'Drum Starter Pack',
          description: 'Essential drumming foundations',
          courseId: courseIds[2],
          price: 549,
          sessionsCount: 10,
          validityDays: 75,
          status: 'active'
        },
        {
          name: 'Voice Training',
          description: 'Develop your vocal abilities',
          courseId: courseIds[3],
          price: 599,
          sessionsCount: 12,
          validityDays: 90,
          status: 'active'
        },
        {
          name: 'Ukulele Group Fun',
          description: 'Learn ukulele with friends',
          courseId: courseIds[4],
          price: 499,
          sessionsCount: 8,
          validityDays: 60,
          status: 'active'
        },
        {
          name: 'Advanced Guitar',
          description: 'For intermediate players',
          courseId: courseIds[0],
          price: 799,
          sessionsCount: 12,
          validityDays: 90,
          status: 'active'
        },
        {
          name: 'Piano Intensive',
          description: 'Fast-track piano learning',
          courseId: courseIds[1],
          price: 899,
          sessionsCount: 20,
          validityDays: 120,
          status: 'active'
        }
      ];
      
      const planIds: string[] = [];
      
      for (const plan of sessionPlans) {
        // Check if plan already exists
        const { data: existingPlan } = await supabase
          .from('session_plans')
          .select('id')
          .eq('name', plan.name)
          .maybeSingle();
          
        if (existingPlan) {
          planIds.push(existingPlan.id);
          // Update existing plan
          await supabase
            .from('session_plans')
            .update({
              description: plan.description,
              course_id: plan.courseId,
              price: plan.price,
              sessions_count: plan.sessionsCount,
              validity_days: plan.validityDays,
              status: plan.status
            })
            .eq('id', existingPlan.id);
        } else {
          // Create new plan
          const { data: newPlan, error: planError } = await supabase
            .from('session_plans')
            .insert({
              name: plan.name,
              description: plan.description,
              course_id: plan.courseId,
              price: plan.price,
              sessions_count: plan.sessionsCount,
              validity_days: plan.validityDays,
              status: plan.status
            })
            .select()
            .single();
            
          if (planError) throw planError;
          planIds.push(newPlan.id);
        }
      }
      
      // Store plan IDs for further use
      localStorage.setItem('testData_planIds', JSON.stringify(planIds));
      
      addResult("Session plans created", true, `Created ${planIds.length} session plans`);
      
    } catch (error) {
      console.error("Error creating session plans:", error);
      addResult("Creating session plans", false, (error as Error).message);
      throw error;
    }
  };

  // Helper function for creating session packs
  const createSessionPacks = async () => {
    try {
      addResult("Creating session packs", true, "Starting...");
      
      // Get stored IDs
      const studentIds = JSON.parse(localStorage.getItem('testData_studentIds') || '[]');
      
      // Define session packs
      const sessionPacks = [
        {
          studentId: studentIds[0],
          size: 10,
          subject: 'Guitar' as SubjectType,
          sessionType: 'Solo',
          location: 'Offline',
          purchasedDate: new Date(new Date().setDate(new Date().getDate() - 30)),
          expiryDate: new Date(new Date().setDate(new Date().getDate() + 60)),
          remainingSessions: 7,
          isActive: true,
          weeklyFrequency: 'once'
        },
        {
          studentId: studentIds[1],
          size: 4,
          subject: 'Piano' as SubjectType,
          sessionType: 'Solo',
          location: 'Online',
          purchasedDate: new Date(new Date().setDate(new Date().getDate() - 15)),
          expiryDate: new Date(new Date().setDate(new Date().getDate() + 75)),
          remainingSessions: 3,
          isActive: true,
          weeklyFrequency: 'once'
        },
        {
          studentId: studentIds[2],
          size: 10,
          subject: 'Drums' as SubjectType,
          sessionType: 'Focus',
          location: 'Offline',
          purchasedDate: new Date(new Date().setDate(new Date().getDate() - 45)),
          expiryDate: new Date(new Date().setDate(new Date().getDate() + 45)),
          remainingSessions: 5,
          isActive: true,
          weeklyFrequency: 'once'
        }
      ];
      
      // Add packs for the other students with variations
      for (let i = 3; i < studentIds.length; i++) {
        const subjects: SubjectType[] = ['Guitar', 'Piano', 'Drums', 'Vocal', 'Ukulele'];
        const sessionTypes = ['Solo', 'Focus', 'Duo'];
        const sizes = [4, 10, 20];
        const locations = ['Online', 'Offline'];
        const frequencies = ['once', 'twice'];
        
        const subject = subjects[i % subjects.length];
        const sessionType = sessionTypes[i % sessionTypes.length];
        const size = sizes[i % sizes.length];
        const location = locations[i % locations.length];
        const frequency = frequencies[i % frequencies.length];
        
        sessionPacks.push({
          studentId: studentIds[i],
          size,
          subject,
          sessionType,
          location,
          purchasedDate: new Date(new Date().setDate(new Date().getDate() - (10 + i * 5))),
          expiryDate: new Date(new Date().setDate(new Date().getDate() + (50 + i * 10))),
          remainingSessions: Math.floor(size * 0.7),
          isActive: true,
          weeklyFrequency: frequency
        });
        
        // Some students get a second pack
        if (i % 3 === 0) {
          const secondSubject = subjects[(i + 2) % subjects.length];
          const secondType = sessionTypes[(i + 1) % sessionTypes.length];
          
          sessionPacks.push({
            studentId: studentIds[i],
            size: sizes[(i + 1) % sizes.length],
            subject: secondSubject,
            sessionType: secondType,
            location: locations[(i + 1) % locations.length],
            purchasedDate: new Date(new Date().setDate(new Date().getDate() - (5 + i * 3))),
            expiryDate: new Date(new Date().setDate(new Date().getDate() + (40 + i * 5))),
            remainingSessions: Math.floor(sizes[(i + 1) % sizes.length] * 0.8),
            isActive: true,
            weeklyFrequency: frequencies[(i + 1) % frequencies.length]
          });
        }
      }
      
      const packIds: string[] = [];
      
      for (const pack of sessionPacks) {
        // Create new pack (unique by student + subject + purchase date)
        const { data: existingPack } = await supabase
          .from('session_packs')
          .select('id')
          .eq('student_id', pack.studentId)
          .eq('subject', pack.subject)
          .eq('session_type', pack.sessionType)
          .eq('purchased_date', pack.purchasedDate.toISOString())
          .maybeSingle();
          
        if (existingPack) {
          packIds.push(existingPack.id);
          
          // Update existing pack
          await supabase
            .from('session_packs')
            .update({
              size: pack.size.toString(),
              location: pack.location,
              expiry_date: pack.expiryDate.toISOString(),
              remaining_sessions: pack.remainingSessions,
              is_active: pack.isActive,
              weekly_frequency: pack.weeklyFrequency
            })
            .eq('id', existingPack.id);
        } else {
          // Create new pack
          const { data: newPack, error: packError } = await supabase
            .from('session_packs')
            .insert({
              student_id: pack.studentId,
              size: pack.size.toString(),
              subject: pack.subject,
              session_type: pack.sessionType,
              location: pack.location,
              purchased_date: pack.purchasedDate.toISOString(),
              expiry_date: pack.expiryDate.toISOString(),
              remaining_sessions: pack.remainingSessions,
              is_active: pack.isActive,
              weekly_frequency: pack.weeklyFrequency
            })
            .select()
            .single();
            
          if (packError) throw packError;
          packIds.push(newPack.id);
        }
      }
      
      // Store pack IDs for further use
      localStorage.setItem('testData_packIds', JSON.stringify(packIds));
      
      addResult("Session packs created", true, `Created ${packIds.length} session packs`);
      
    } catch (error) {
      console.error("Error creating session packs:", error);
      addResult("Creating session packs", false, (error as Error).message);
      throw error;
    }
  };

  // Helper function for creating enrollments
  const createEnrollments = async () => {
    try {
      addResult("Creating enrollments", true, "Starting...");
      
      // Get stored IDs
      const studentIds = JSON.parse(localStorage.getItem('testData_studentIds') || '[]');
      const courseIds = JSON.parse(localStorage.getItem('testData_courseIds') || '[]');
      const planIds = JSON.parse(localStorage.getItem('testData_planIds') || '[]');
      const teacherIds = JSON.parse(localStorage.getItem('testData_teacherIds') || '[]');
      
      // Define enrollments
      const enrollments = [
        {
          studentId: studentIds[0],
          courseId: courseIds[0],
          planId: planIds[0],
          startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
          endDate: new Date(new Date().setDate(new Date().getDate() + 60)),
          status: 'active',
          notes: 'Showing good progress',
          completionPercentage: 25,
          teacherId: teacherIds[0],
          teacherNotes: 'Good progress on basic chords',
          studentNotes: 'Finding F chord difficult',
          moduleNumber: 3,
          sessionNumber: 4
        },
        {
          studentId: studentIds[1],
          courseId: courseIds[1],
          planId: planIds[1],
          startDate: new Date(new Date().setDate(new Date().getDate() - 15)),
          endDate: new Date(new Date().setDate(new Date().getDate() + 105)),
          status: 'active',
          notes: 'Needs more practice time',
          completionPercentage: 10,
          teacherId: teacherIds[3],
          teacherNotes: 'Needs more practice with left hand technique',
          studentNotes: 'Working on exercises daily',
          moduleNumber: 2,
          sessionNumber: 2
        }
      ];
      
      // Add enrollments for remaining students with variations
      for (let i = 2; i < Math.min(courseIds.length, studentIds.length); i++) {
        const courseIndex = i % courseIds.length;
        const planIndex = i % planIds.length;
        const teacherIndex = i % teacherIds.length;
        
        const startDate = new Date(new Date().setDate(new Date().getDate() - (10 + i * 5)));
        const endDate = new Date(new Date().setDate(new Date().getDate() + (60 + i * 10)));
        const completionPercentage = Math.floor(Math.random() * 50); // 0-50%
        
        enrollments.push({
          studentId: studentIds[i],
          courseId: courseIds[courseIndex],
          planId: planIds[planIndex],
          startDate,
          endDate,
          status: 'active',
          notes: `Student ${i} progress notes`,
          completionPercentage,
          teacherId: teacherIds[teacherIndex],
          teacherNotes: `Teacher notes for student ${i}`,
          studentNotes: `Student ${i}'s personal notes`,
          moduleNumber: Math.floor(completionPercentage / 10) + 1,
          sessionNumber: Math.floor(completionPercentage / 8) + 1
        });
        
        // Some students get a second enrollment
        if (i % 3 === 0 && i + 1 < courseIds.length) {
          const secondCourseIndex = (i + 1) % courseIds.length;
          const secondPlanIndex = (i + 1) % planIds.length;
          const secondTeacherIndex = (i + 1) % teacherIds.length;
          
          enrollments.push({
            studentId: studentIds[i],
            courseId: courseIds[secondCourseIndex],
            planId: planIds[secondPlanIndex],
            startDate: new Date(new Date().setDate(new Date().getDate() - (5 + i * 3))),
            endDate: new Date(new Date().setDate(new Date().getDate() + (50 + i * 8))),
            status: 'active',
            notes: `Student ${i} second course progress`,
            completionPercentage: Math.floor(Math.random() * 30),
            teacherId: teacherIds[secondTeacherIndex],
            teacherNotes: `Teacher notes for student ${i}'s second course`,
            studentNotes: `Student ${i}'s personal notes for second course`,
            moduleNumber: 1,
            sessionNumber: 2
          });
        }
      }
      
      const enrollmentIds: string[] = [];
      
      for (const enrollment of enrollments) {
        // Check if enrollment already exists
        const { data: existingEnrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('student_id', enrollment.studentId)
          .eq('course_id', enrollment.courseId)
          .maybeSingle();
          
        let enrollmentId: string;
        
        if (existingEnrollment) {
          enrollmentId = existingEnrollment.id;
          // Update existing enrollment
          await supabase
            .from('enrollments')
            .update({
              plan_id: enrollment.planId,
              start_date: enrollment.startDate.toISOString(),
              end_date: enrollment.endDate.toISOString(),
              status: enrollment.status,
              notes: enrollment.notes,
              completion_percentage: enrollment.completionPercentage
            })
            .eq('id', enrollmentId);
        } else {
          // Create new enrollment
          const { data: newEnrollment, error: enrollmentError } = await supabase
            .from('enrollments')
            .insert({
              student_id: enrollment.studentId,
              course_id: enrollment.courseId,
              plan_id: enrollment.planId,
              start_date: enrollment.startDate.toISOString(),
              end_date: enrollment.endDate.toISOString(),
              status: enrollment.status,
              notes: enrollment.notes,
              completion_percentage: enrollment.completionPercentage
            })
            .select()
            .single();
            
          if (enrollmentError) throw enrollmentError;
          enrollmentId = newEnrollment.id;
        }
        
        enrollmentIds.push(enrollmentId);
        
        // Create student progress entry
        const { data: existingProgress } = await supabase
          .from('student_progress')
          .select('id')
          .eq('enrollment_id', enrollmentId)
          .maybeSingle();
          
        if (existingProgress) {
          // Update existing progress
          await supabase
            .from('student_progress')
            .update({
              completion_percentage: enrollment.completionPercentage,
              last_updated_by: enrollment.teacherId,
              teacher_notes: enrollment.teacherNotes,
              student_notes: enrollment.studentNotes,
              module_number: enrollment.moduleNumber,
              session_number: enrollment.sessionNumber
            })
            .eq('id', existingProgress.id);
        } else {
          // Create new progress
          await supabase
            .from('student_progress')
            .insert({
              enrollment_id: enrollmentId,
              completion_percentage: enrollment.completionPercentage,
              last_updated_by: enrollment.teacherId,
              teacher_notes: enrollment.teacherNotes,
              student_notes: enrollment.studentNotes,
              module_number: enrollment.moduleNumber,
              session_number: enrollment.sessionNumber
            });
        }
      }
      
      // Store enrollment IDs for further use
      localStorage.setItem('testData_enrollmentIds', JSON.stringify(enrollmentIds));
      
      addResult("Enrollments and progress created", true, `Created ${enrollmentIds.length} enrollments with progress data`);
      
    } catch (error) {
      console.error("Error creating enrollments:", error);
      addResult("Creating enrollments", false, (error as Error).message);
      throw error;
    }
  };

  // Helper function for creating sessions
  const createSessions = async () => {
    try {
      addResult("Creating sessions", true, "Starting...");
      
      // Get stored IDs
      const studentIds = JSON.parse(localStorage.getItem('testData_studentIds') || '[]');
      const teacherIds = JSON.parse(localStorage.getItem('testData_teacherIds') || '[]');
      const packIds = JSON.parse(localStorage.getItem('testData_packIds') || '[]');
      
      // Create past sessions (completed)
      const pastSessions = [];
      for (let i = 0; i < Math.min(10, packIds.length); i++) {
        const packId = packIds[i % packIds.length];
        const teacherId = teacherIds[i % teacherIds.length];
        const studentId = studentIds[i % studentIds.length];
        
        // Get pack details to use appropriate subject and type
        const { data: pack } = await supabase
          .from('session_packs')
          .select('*')
          .eq('id', packId)
          .single();
          
        if (!pack) continue;
          
        const dateTime = new Date(new Date().setDate(new Date().getDate() - (i * 3 + 5)));
        
        pastSessions.push({
          teacherId,
          packId,
          subject: pack.subject,
          sessionType: pack.session_type,
          location: pack.location,
          dateTime,
          duration: pack.session_type === 'Focus' ? 45 : 60,
          status: 'Present' as AttendanceStatus,
          notes: `Session ${i + 1} notes`,
          rescheduleCount: 0,
          studentId
        });
      }
      
      // Create upcoming sessions (scheduled)
      const upcomingSessions = [];
      for (let i = 0; i < Math.min(7, packIds.length); i++) {
        const packId = packIds[i % packIds.length];
        const teacherId = teacherIds[(i + 2) % teacherIds.length];
        const studentId = studentIds[i % studentIds.length];
        
        // Get pack details to use appropriate subject and type
        const { data: pack } = await supabase
          .from('session_packs')
          .select('*')
          .eq('id', packId)
          .single();
          
        if (!pack) continue;
          
        const dateTime = new Date(new Date().setDate(new Date().getDate() + (i * 2 + 1)));
        
        upcomingSessions.push({
          teacherId,
          packId,
          subject: pack.subject,
          sessionType: pack.session_type,
          location: pack.location,
          dateTime,
          duration: pack.session_type === 'Focus' ? 45 : 60,
          status: 'Scheduled' as AttendanceStatus,
          notes: `Upcoming session ${i + 1} plan`,
          rescheduleCount: 0,
          studentId
        });
      }
      
      const allSessions = [...pastSessions, ...upcomingSessions];
      const sessionIds: string[] = [];
      
      for (const session of allSessions) {
        // Check if similar session exists
        const { data: existingSession } = await supabase
          .from('sessions')
          .select('id')
          .eq('teacher_id', session.teacherId)
          .eq('pack_id', session.packId)
          .eq('date_time', session.dateTime.toISOString())
          .maybeSingle();
          
        let sessionId: string;
        
        if (existingSession) {
          sessionId = existingSession.id;
          // Update existing session
          await supabase
            .from('sessions')
            .update({
              subject: session.subject,
              session_type: session.sessionType,
              location: session.location,
              duration: session.duration,
              status: session.status,
              notes: session.notes,
              reschedule_count: session.rescheduleCount
            })
            .eq('id', sessionId);
        } else {
          // Create new session
          const { data: newSession, error: sessionError } = await supabase
            .from('sessions')
            .insert({
              teacher_id: session.teacherId,
              pack_id: session.packId,
              subject: session.subject,
              session_type: session.sessionType,
              location: session.location,
              date_time: session.dateTime.toISOString(),
              duration: session.duration,
              status: session.status,
              notes: session.notes,
              reschedule_count: session.rescheduleCount
            })
            .select()
            .single();
            
          if (sessionError) throw sessionError;
          sessionId = newSession.id;
        }
        
        sessionIds.push(sessionId);
        
        // Link student to session
        const { data: existingStudentSession } = await supabase
          .from('session_students')
          .select('*')
          .eq('session_id', sessionId)
          .eq('student_id', session.studentId)
          .maybeSingle();
          
        if (!existingStudentSession) {
          await supabase
            .from('session_students')
            .insert({
              session_id: sessionId,
              student_id: session.studentId
            });
        }
        
        // Create attendance record for past sessions
        if (session.status === 'Present') {
          const { data: existingAttendance } = await supabase
            .from('attendance_events')
            .select('id')
            .eq('session_id', sessionId)
            .maybeSingle();
            
          if (!existingAttendance) {
            await supabase
              .from('attendance_events')
              .insert({
                session_id: sessionId,
                status: session.status,
                marked_by_user_id: session.teacherId,
                marked_at: new Date(session.dateTime.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour after session
                notes: 'Student attended class'
              });
          }
        }
      }
      
      // Store session IDs for further use
      localStorage.setItem('testData_sessionIds', JSON.stringify(sessionIds));
      
      addResult("Sessions created", true, `Created ${sessionIds.length} sessions (${pastSessions.length} past, ${upcomingSessions.length} upcoming)`);
      
    } catch (error) {
      console.error("Error creating sessions:", error);
      addResult("Creating sessions", false, (error as Error).message);
      throw error;
    }
  };

  // Helper function for creating fee plans and payments
  const createFeePayments = async () => {
    try {
      addResult("Creating fee plans and payments", true, "Starting...");
      
      // Get stored IDs
      const studentIds = JSON.parse(localStorage.getItem('testData_studentIds') || '[]');
      const adminIds = JSON.parse(localStorage.getItem('testData_adminIds') || '[]');
      const packIds = JSON.parse(localStorage.getItem('testData_packIds') || '[]');
      const planIds = JSON.parse(localStorage.getItem('testData_planIds') || '[]');
      
      // Create fee plans
      const feePlans = [];
      for (let i = 0; i < Math.min(10, studentIds.length); i++) {
        const studentId = studentIds[i];
        const totalAmount = 500 + (i * 50);
        
        // Create varied due date structures
        let dueDates: any[];
        let lateFeePolicy: any;
        
        if (i % 3 === 0) {
          // Single full payment
          dueDates = [
            {
              date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
              amount: totalAmount
            }
          ];
          lateFeePolicy = { rate_per_day: 5, maximum: 50 };
        } else if (i % 3 === 1) {
          // Two installments
          dueDates = [
            {
              date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
              amount: totalAmount / 2
            },
            {
              date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
              amount: totalAmount / 2
            }
          ];
          lateFeePolicy = { rate_per_day: 7, maximum: 70 };
        } else {
          // Three installments
          dueDates = [
            {
              date: new Date(new Date().setDate(new Date().getDate() - 45)).toISOString(),
              amount: totalAmount / 3
            },
            {
              date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
              amount: totalAmount / 3
            },
            {
              date: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
              amount: totalAmount / 3
            }
          ];
          lateFeePolicy = { rate_per_day: 6, maximum: 60 };
        }
        
        feePlans.push({
          studentId,
          planTitle: `${studentIds.indexOf(studentId) + 1} - Course Payment Plan`,
          totalAmount,
          dueDates,
          lateFeePolicy
        });
      }
      
      const feePlanIds: string[] = [];
      const invoiceIds: string[] = [];
      
      for (const feePlan of feePlans) {
        // Create or update fee plan
        const { data: existingPlan } = await supabase
          .from('fee_plans')
          .select('id')
          .eq('student_id', feePlan.studentId)
          .eq('plan_title', feePlan.planTitle)
          .maybeSingle();
          
        let feePlanId: string;
        
        if (existingPlan) {
          feePlanId = existingPlan.id;
          // Update existing plan
          await supabase
            .from('fee_plans')
            .update({
              total_amount: feePlan.totalAmount,
              due_dates: feePlan.dueDates,
              late_fee_policy: feePlan.lateFeePolicy
            })
            .eq('id', feePlanId);
        } else {
          // Create new plan
          const { data: newPlan, error: planError } = await supabase
            .from('fee_plans')
            .insert({
              student_id: feePlan.studentId,
              plan_title: feePlan.planTitle,
              total_amount: feePlan.totalAmount,
              due_dates: feePlan.dueDates,
              late_fee_policy: feePlan.lateFeePolicy
            })
            .select()
            .single();
            
          if (planError) throw planError;
          feePlanId = newPlan.id;
        }
        
        feePlanIds.push(feePlanId);
        
        // Create invoice for this fee plan
        const planIndex = feePlans.indexOf(feePlan);
        const packId = packIds[planIndex % packIds.length];
        const planId = planIds[planIndex % planIds.length];
        const paymentStatus = planIndex % 4 === 0 ? 'paid' : 
                             planIndex % 4 === 1 ? 'pending' :
                             planIndex % 4 === 2 ? 'partially_paid' : 'overdue';
        
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('id')
          .eq('student_id', feePlan.studentId)
          .eq('due_date', feePlan.dueDates[0].date)
          .maybeSingle();
          
        let invoiceId: string;
        
        if (existingInvoice) {
          invoiceId = existingInvoice.id;
          // Update existing invoice
          await supabase
            .from('invoices')
            .update({
              plan_id: planId,
              pack_id: packId,
              amount: feePlan.totalAmount,
              status: paymentStatus,
              notes: `Invoice for ${feePlan.planTitle}`
            })
            .eq('id', invoiceId);
        } else {
          // Create new invoice
          const { data: newInvoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
              student_id: feePlan.studentId,
              plan_id: planId,
              pack_id: packId,
              amount: feePlan.totalAmount,
              status: paymentStatus,
              due_date: feePlan.dueDates[0].date,
              notes: `Invoice for ${feePlan.planTitle}`
            })
            .select()
            .single();
            
          if (invoiceError) throw invoiceError;
          invoiceId = newInvoice.id;
        }
        
        invoiceIds.push(invoiceId);
        
        // Create payment records for paid or partially paid invoices
        if (paymentStatus === 'paid' || paymentStatus === 'partially_paid') {
          const paymentAmount = paymentStatus === 'paid' ? feePlan.totalAmount : feePlan.totalAmount * 0.5;
          const paymentMethods = ['cash', 'card', 'bank_transfer', 'upi'];
          const paymentMethod = paymentMethods[planIndex % paymentMethods.length];
          const adminId = adminIds[planIndex % adminIds.length];
          
          const { data: existingPayment } = await supabase
            .from('payment_records')
            .select('id')
            .eq('invoice_id', invoiceId)
            .maybeSingle();
            
          if (!existingPayment) {
            await supabase
              .from('payment_records')
              .insert({
                invoice_id: invoiceId,
                amount: paymentAmount,
                payment_date: new Date(new Date().setDate(new Date().getDate() - (planIndex * 2 + 3))).toISOString(),
                payment_method: paymentMethod,
                reference_number: `REF-${Math.floor(Math.random() * 10000)}`,
                recorded_by_user_id: adminId,
                notes: `Payment for ${feePlan.planTitle}`
              });
          }
        }
      }
      
      addResult("Fee plans and payments created", true, `Created ${feePlanIds.length} fee plans and ${invoiceIds.length} invoices`);
      
    } catch (error) {
      console.error("Error creating fee plans and payments:", error);
      addResult("Creating fee plans and payments", false, (error as Error).message);
      throw error;
    }
  };

  // Helper function for creating system settings
  const createSystemSettings = async () => {
    try {
      addResult("Creating system settings", true, "Starting...");
      
      const systemSettings = [
        {
          key: 'session_durations',
          category: 'sessions',
          value: { solo: 60, duo: 60, focus: 45 }
        },
        {
          key: 'session_limits',
          category: 'sessions',
          value: { max_weekly_per_teacher: 25, max_daily_per_teacher: 5, advance_booking_days: 60 }
        },
        {
          key: 'pack_sizes',
          category: 'pricing',
          value: { "4": 250, "10": 600, "20": 1100, "30": 1500 }
        },
        {
          key: 'supported_subjects',
          category: 'curriculum',
          value: ["Guitar", "Piano", "Drums", "Vocal", "Ukulele"]
        },
        {
          key: 'payment_methods',
          category: 'payments',
          value: ["cash", "card", "bank_transfer", "upi", "other"]
        }
      ];
      
      for (const setting of systemSettings) {
        // Check if setting exists
        const { data: existingSetting } = await supabase
          .from('system_settings')
          .select('id')
          .eq('key', setting.key)
          .eq('category', setting.category)
          .maybeSingle();
          
        if (existingSetting) {
          // Update existing setting
          await supabase
            .from('system_settings')
            .update({
              value: setting.value
            })
            .eq('id', existingSetting.id);
        } else {
          // Create new setting
          await supabase
            .from('system_settings')
            .insert({
              key: setting.key,
              category: setting.category,
              value: setting.value
            });
        }
      }
      
      addResult("System settings created", true, `Created ${systemSettings.length} system settings`);
      
    } catch (error) {
      console.error("Error creating system settings:", error);
      addResult("Creating system settings", false, (error as Error).message);
      throw error;
    }
  };

  return (
    <div className="container py-8 mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Populate Test Data</h1>
          <p className="text-muted-foreground mt-2">
            This utility will populate your Supabase database with realistic test data for the Music School Management App.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Generate Test Data</CardTitle>
            <CardDescription>
              Click the button below to populate test data. This will create users, courses, sessions, and all related entities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This process will:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Create admin, teacher, and student users</li>
                <li>Set up teacher specializations and student preferences</li>
                <li>Create courses and session plans</li>
                <li>Create session packs for students</li>
                <li>Schedule past and upcoming sessions</li>
                <li>Create fee plans, invoices, and payments</li>
                <li>Set up system settings</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handlePopulateData} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Generating Test Data...' : 'Generate Test Data'}
            </Button>
          </CardFooter>
        </Card>
        
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Status of each step in the data generation process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center text-white text-sm`}>
                      {result.success ? '✓' : '✗'}
                    </div>
                    <div>
                      <p className="font-medium">{result.step}</p>
                      {result.message && (
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PopulateTestData;
