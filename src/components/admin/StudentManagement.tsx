import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpenIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
  PackageIcon,
  UserIcon,
  MoreHorizontal,
  SearchIcon,
  LoaderIcon,
  UsersIcon,
  AlertTriangleIcon,
  ExternalLinkIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudentsManagement, StudentDetail } from "@/hooks/use-students-management";
import { StudentDetailsDialog } from './students/StudentDetailsDialog';
import { StudentEditDialog } from './students/StudentEditDialog';
import { useTeachers } from '@/hooks/use-teachers';
import { SubjectType } from '@/lib/types';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { assertSubjectTypeArray } from '@/lib/type-utils';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SkeletonCard } from '@/components/ui/skeleton-card';

const StudentManagement: React.FC = () => {
  // Filters and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectType | undefined>();
  const [teacherFilter, setTeacherFilter] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dialog state
  const [detailsStudent, setDetailsStudent] = useState<StudentDetail | null>(null);
  const [editStudent, setEditStudent] = useState<StudentDetail | null>(null);

  // Load data with filters
  const { 
    students, 
    totalCount, 
    pageCount,
    isLoading, 
    error,
    updateStudent,
    deactivateStudent,
    reactivateStudent,
    isPendingUpdate
  } = useStudentsManagement({
    search: searchQuery !== '' ? searchQuery : undefined,
    subject: subjectFilter,
    teacherId: teacherFilter,
    page: currentPage,
    pageSize
  });
  
  // Load teachers for filter dropdown
  const { data: teachers, isLoading: isLoadingTeachers } = useTeachers();

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleSubjectFilterChange = (value: string) => {
    setSubjectFilter(value as SubjectType || undefined);
    setCurrentPage(1);
  };

  const handleTeacherFilterChange = (value: string) => {
    setTeacherFilter(value || undefined);
    setCurrentPage(1);
  };

  // Handle dialog actions
  const handleEdit = (student: StudentDetail) => {
    setEditStudent(student);
  };

  const handleViewDetails = (student: StudentDetail) => {
    setDetailsStudent(student);
  };

  const handleSaveEdit = (studentData: Partial<StudentDetail> & { id: string }) => {
    updateStudent(studentData);
    setEditStudent(null);
  };

  const handleToggleActive = (student: StudentDetail) => {
    if (student.isActive) {
      deactivateStudent(student.id);
    } else {
      reactivateStudent(student.id);
    }
  };

  // Render error state
  if (error) {
    return (
      <div className="p-6 rounded-lg bg-destructive/10 flex flex-col items-center justify-center">
        <AlertTriangleIcon className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Students</h3>
        <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary componentName="Student Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <Button>Add New Student</Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>View and manage your students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              <Select value={subjectFilter} onValueChange={handleSubjectFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Subjects</SelectLabel>
                    <SelectItem value="">All Subjects</SelectItem>
                    <SelectItem value="Guitar">Guitar</SelectItem>
                    <SelectItem value="Piano">Piano</SelectItem>
                    <SelectItem value="Drums">Drums</SelectItem>
                    <SelectItem value="Ukulele">Ukulele</SelectItem>
                    <SelectItem value="Vocal">Vocal</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Select value={teacherFilter} onValueChange={handleTeacherFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Teachers</SelectLabel>
                    <SelectItem value="">All Teachers</SelectItem>
                    {Array.isArray(teachers) && teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <SkeletonCard variant="table" rows={8} />
            ) : Array.isArray(students) && students.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Assigned Teacher</TableHead>
                        <TableHead>Active Packs</TableHead>
                        <TableHead>Enrolled Courses</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {Array.isArray(student.preferredSubjects) && student.preferredSubjects.length > 0
                                ? assertSubjectTypeArray(student.preferredSubjects).map((subject) => (
                                    <Badge key={subject} variant="outline">{subject}</Badge>
                                  ))
                                : (
                                    <span className="text-muted-foreground text-sm">None</span>
                                  )
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            {student.assignedTeacherName || (
                              <span className="text-muted-foreground text-sm">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.activePacks > 0 ? "default" : "secondary"}>
                              {student.activePacks}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {Array.isArray(student.enrolledCourses) && student.enrolledCourses.length > 0
                                ? student.enrolledCourses.map((course) => (
                                    <Badge key={course} variant="outline">{course}</Badge>
                                  ))
                                : (
                                    <span className="text-muted-foreground text-sm">None</span>
                                  )
                              }
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                                  <UserIcon className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(student)}>
                                  <EditIcon className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/students/${student.id}`} className="flex items-center">
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    Full Profile
                                    <ExternalLinkIcon className="ml-auto h-4 w-4" />
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <PackageIcon className="mr-2 h-4 w-4" />
                                  View Packs
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <BookOpenIcon className="mr-2 h-4 w-4" />
                                  View Courses
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleToggleActive(student)}>
                                  {student.isActive ? (
                                    <>Deactivate Student</>
                                  ) : (
                                    <>Reactivate Student</>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {pageCount > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
                            disabled={currentPage === 1}
                          >
                            <ChevronLeftIcon className="h-4 w-4" />
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <span className="px-4">
                            Page {currentPage} of {pageCount}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
                            disabled={currentPage >= pageCount}
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center border rounded-md">
                <UsersIcon className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Students Found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or create a new student</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {detailsStudent && (
          <StudentDetailsDialog 
            student={detailsStudent} 
            open={!!detailsStudent}
            onClose={() => setDetailsStudent(null)}
            onEdit={() => {
              setEditStudent(detailsStudent);
              setDetailsStudent(null);
            }}
          />
        )}
        
        {editStudent && (
          <StudentEditDialog 
            student={editStudent}
            open={!!editStudent}
            onClose={() => setEditStudent(null)}
            onSave={handleSaveEdit}
            isPending={isPendingUpdate}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default StudentManagement;
