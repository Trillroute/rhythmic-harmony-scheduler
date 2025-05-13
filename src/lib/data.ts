
import { 
  Admin, 
  Student, 
  Teacher, 
  Session, 
  SessionPack,
  UserRole,
  SubjectType,
  SessionType,
  LocationType,
  AttendanceStatus,
  User,
  TimeSlot
} from './types';

// Create default dates for all entities
const now = new Date();

// Sample users (teachers, students, admins)
export const teachers: Teacher[] = [
  {
    id: 't1',
    name: 'John Davis',
    email: 'john.davis@musicschool.com',
    role: 'teacher',
    subjects: ['Guitar', 'Ukulele'],
    availableTimes: generateDefaultTimeSlots('t1'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't2',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@musicschool.com',
    role: 'teacher',
    subjects: ['Piano', 'Vocal'],
    availableTimes: generateDefaultTimeSlots('t2'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't3',
    name: 'Michael Chen',
    email: 'michael.chen@musicschool.com',
    role: 'teacher',
    subjects: ['Drums'],
    availableTimes: generateDefaultTimeSlots('t3'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't4',
    name: 'Emma Rodriguez',
    email: 'emma.r@musicschool.com',
    role: 'teacher',
    subjects: ['Guitar', 'Piano'],
    availableTimes: generateDefaultTimeSlots('t4'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't5',
    name: 'David Kim',
    email: 'david.kim@musicschool.com',
    role: 'teacher',
    subjects: ['Vocal', 'Piano'],
    availableTimes: generateDefaultTimeSlots('t5'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't6',
    name: 'Lisa Patel',
    email: 'lisa.p@musicschool.com',
    role: 'teacher',
    subjects: ['Ukulele', 'Guitar'],
    availableTimes: generateDefaultTimeSlots('t6'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't7',
    name: 'James Smith',
    email: 'james.s@musicschool.com',
    role: 'teacher',
    subjects: ['Drums', 'Guitar'],
    availableTimes: generateDefaultTimeSlots('t7'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't8',
    name: 'Olivia Brown',
    email: 'olivia.b@musicschool.com',
    role: 'teacher',
    subjects: ['Vocal'],
    availableTimes: generateDefaultTimeSlots('t8'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't9',
    name: 'Robert Johnson',
    email: 'robert.j@musicschool.com',
    role: 'teacher',
    subjects: ['Piano', 'Vocal'],
    availableTimes: generateDefaultTimeSlots('t9'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't10',
    name: 'Sophia Lee',
    email: 'sophia.l@musicschool.com',
    role: 'teacher',
    subjects: ['Guitar', 'Drums', 'Ukulele'],
    availableTimes: generateDefaultTimeSlots('t10'),
    createdAt: now,
    updatedAt: now,
  },
];

export const students: Student[] = [
  {
    id: 's1',
    name: 'Alex Thompson',
    email: 'alex.t@example.com',
    role: 'student',
    preferredSubjects: ['Guitar'],
    packs: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 's2',
    name: 'Mia Johnson',
    email: 'mia.j@example.com',
    role: 'student',
    preferredSubjects: ['Piano'],
    packs: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 's3',
    name: 'Ethan Wilson',
    email: 'ethan.w@example.com',
    role: 'student',
    preferredSubjects: ['Drums'],
    packs: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 's4',
    name: 'Olivia Garcia',
    email: 'olivia.g@example.com',
    role: 'student',
    preferredSubjects: ['Ukulele', 'Guitar'],
    packs: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 's5',
    name: 'Noah Martinez',
    email: 'noah.m@example.com',
    role: 'student',
    preferredSubjects: ['Vocal'],
    packs: [],
    createdAt: now,
    updatedAt: now,
  }
];

export const admins: Admin[] = [
  {
    id: 'a1',
    name: 'Admin User',
    email: 'admin@musicschool.com',
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  }
];

// Helper function to generate default time slots for teachers
function generateDefaultTimeSlots(teacherId: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  // Generate slots for each weekday (Monday-Friday)
  for (let day = 1; day <= 5; day++) {
    // Morning slot
    slots.push({
      id: `slot_${teacherId}_${day}_morning`,
      teacherId,
      day,
      startTime: '09:00',
      endTime: '12:00',
      isRecurring: true,
      location: 'Offline',
    });
    
    // Afternoon slot
    slots.push({
      id: `slot_${teacherId}_${day}_afternoon`,
      teacherId,
      day,
      startTime: '13:00',
      endTime: '17:00',
      isRecurring: true,
      location: 'Offline',
    });
    
    // Online slot (only for some teachers)
    if (['t1', 't3', 't5', 't7', 't9'].includes(teacherId)) {
      slots.push({
        id: `slot_${teacherId}_${day}_online`,
        teacherId,
        day,
        startTime: '18:00',
        endTime: '20:00',
        isRecurring: true,
        location: 'Online',
      });
    }
  }
  
  return slots;
}

// Session Packs for students
export const sessionPacks: SessionPack[] = [
  {
    id: 'pack1',
    studentId: 's1',
    size: 10,
    subject: 'Guitar',
    sessionType: 'Focus',
    location: 'Offline',
    purchasedDate: new Date('2023-05-01'),
    remainingSessions: 8,
    isActive: true,
    weeklyFrequency: 'once',
    sessions: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pack2',
    studentId: 's2',
    size: 20,
    subject: 'Piano',
    sessionType: 'Solo',
    location: 'Offline',
    purchasedDate: new Date('2023-05-15'),
    remainingSessions: 17,
    isActive: true,
    weeklyFrequency: 'twice',
    sessions: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pack3',
    studentId: 's3',
    size: 4,
    subject: 'Drums',
    sessionType: 'Focus',
    location: 'Online',
    purchasedDate: new Date('2023-06-01'),
    remainingSessions: 2,
    isActive: true,
    weeklyFrequency: 'once',
    sessions: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pack4',
    studentId: 's4',
    size: 30,
    subject: 'Ukulele',
    sessionType: 'Duo',
    location: 'Offline',
    purchasedDate: new Date('2023-04-15'),
    remainingSessions: 24,
    isActive: true,
    weeklyFrequency: 'twice',
    sessions: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pack5',
    studentId: 's5',
    size: 10,
    subject: 'Vocal',
    sessionType: 'Focus',
    location: 'Online',
    purchasedDate: new Date('2023-05-20'),
    remainingSessions: 9,
    isActive: true,
    weeklyFrequency: 'once',
    sessions: [],
    createdAt: now,
    updatedAt: now,
  },
];

// Connect packs to students
students.forEach(student => {
  const studentPacks = sessionPacks.filter(pack => pack.studentId === student.id);
  student.packs = studentPacks;
});

// Generate some sessions based on packs
const startDate = new Date();
startDate.setHours(9, 0, 0, 0); // 9:00 AM today

export const generateSessions = (): Session[] => {
  const sessions: Session[] = [];
  let id = 1;

  sessionPacks.forEach(pack => {
    const student = students.find(s => s.id === pack.studentId);
    if (!student) return;

    // Find suitable teachers for this subject
    const availableTeachers = teachers.filter(t => 
      t.subjects.includes(pack.subject)
    );
    
    if (availableTeachers.length === 0) return;

    // Generate sessions for this pack
    const totalSessions = pack.size;
    const completedSessions = pack.size - pack.remainingSessions;
    
    for (let i = 0; i < totalSessions; i++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + (i * 7)); // Weekly sessions
      
      // Alternate session times to avoid conflicts
      const hourOffset = (id % 8); // 9am to 5pm
      sessionDate.setHours(9 + hourOffset, 0, 0, 0);
      
      // Assign a random teacher from available ones
      const teacherIndex = i % availableTeachers.length;
      const teacher = availableTeachers[teacherIndex];
      
      // Determine session status based on date
      let status: AttendanceStatus = 'Scheduled';
      if (i < completedSessions) {
        // Past sessions are marked as attended
        status = 'Present';
      }

      const session: Session = {
        id: `session${id}`,
        packId: pack.id,
        teacherId: teacher.id,
        studentIds: [student.id],
        subject: pack.subject,
        sessionType: pack.sessionType,
        location: pack.location,
        dateTime: sessionDate,
        duration: pack.sessionType === 'Focus' ? 45 : 60, // Focus sessions are 45 min, others are 60
        status: status,
        rescheduleCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      // If it's a duo session, add another student
      if (pack.sessionType === 'Duo') {
        // Find another student who likes this subject
        const otherStudents = students.filter(s => 
          s.id !== student.id && 
          s.preferredSubjects.includes(pack.subject)
        );
        
        if (otherStudents.length > 0) {
          const randomIndex = Math.floor(Math.random() * otherStudents.length);
          session.studentIds.push(otherStudents[randomIndex].id);
        }
      }

      sessions.push(session);
      id++;
    }
  });
  
  return sessions;
};

export const sessions = generateSessions();

// Update pack sessions
sessionPacks.forEach(pack => {
  pack.sessions = sessions.filter(session => session.packId === pack.id);
});

// Helper function to get all users
export const getAllUsers = (): User[] => {
  return [...admins, ...teachers, ...students];
};

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return getAllUsers().find(user => user.id === id);
};

// Helper function to get user by role
export const getUsersByRole = (role: UserRole): User[] => {
  return getAllUsers().filter(user => user.role === role);
};

// Helper function to get sessions by teacher
export const getSessionsByTeacher = (teacherId: string): Session[] => {
  return sessions.filter(session => session.teacherId === teacherId);
};

// Helper function to get sessions by student
export const getSessionsByStudent = (studentId: string): Session[] => {
  return sessions.filter(session => session.studentIds.includes(studentId));
};

// Helper function to get active user (for demonstration)
export const getActiveUser = (): User => {
  // For demo purposes, return an admin user
  return admins[0];
};
