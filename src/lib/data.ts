
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
  User
} from './types';

// Sample users (teachers, students, admins)
export const teachers: Teacher[] = [
  {
    id: 't1',
    name: 'John Davis',
    email: 'john.davis@musicschool.com',
    role: 'teacher',
    subjects: ['Guitar', 'Ukulele'],
  },
  {
    id: 't2',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@musicschool.com',
    role: 'teacher',
    subjects: ['Piano', 'Vocal'],
  },
  {
    id: 't3',
    name: 'Michael Chen',
    email: 'michael.chen@musicschool.com',
    role: 'teacher',
    subjects: ['Drums'],
  },
  {
    id: 't4',
    name: 'Emma Rodriguez',
    email: 'emma.r@musicschool.com',
    role: 'teacher',
    subjects: ['Guitar', 'Piano'],
  },
  {
    id: 't5',
    name: 'David Kim',
    email: 'david.kim@musicschool.com',
    role: 'teacher',
    subjects: ['Vocal', 'Piano'],
  },
  {
    id: 't6',
    name: 'Lisa Patel',
    email: 'lisa.p@musicschool.com',
    role: 'teacher',
    subjects: ['Ukulele', 'Guitar'],
  },
  {
    id: 't7',
    name: 'James Smith',
    email: 'james.s@musicschool.com',
    role: 'teacher',
    subjects: ['Drums', 'Guitar'],
  },
  {
    id: 't8',
    name: 'Olivia Brown',
    email: 'olivia.b@musicschool.com',
    role: 'teacher',
    subjects: ['Vocal'],
  },
  {
    id: 't9',
    name: 'Robert Johnson',
    email: 'robert.j@musicschool.com',
    role: 'teacher',
    subjects: ['Piano', 'Vocal'],
  },
  {
    id: 't10',
    name: 'Sophia Lee',
    email: 'sophia.l@musicschool.com',
    role: 'teacher',
    subjects: ['Guitar', 'Drums', 'Ukulele'],
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
  },
  {
    id: 's2',
    name: 'Mia Johnson',
    email: 'mia.j@example.com',
    role: 'student',
    preferredSubjects: ['Piano'],
    packs: [],
  },
  {
    id: 's3',
    name: 'Ethan Wilson',
    email: 'ethan.w@example.com',
    role: 'student',
    preferredSubjects: ['Drums'],
    packs: [],
  },
  {
    id: 's4',
    name: 'Olivia Garcia',
    email: 'olivia.g@example.com',
    role: 'student',
    preferredSubjects: ['Ukulele', 'Guitar'],
    packs: [],
  },
  {
    id: 's5',
    name: 'Noah Martinez',
    email: 'noah.m@example.com',
    role: 'student',
    preferredSubjects: ['Vocal'],
    packs: [],
  }
];

export const admins: Admin[] = [
  {
    id: 'a1',
    name: 'Admin User',
    email: 'admin@musicschool.com',
    role: 'admin',
  }
];

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
