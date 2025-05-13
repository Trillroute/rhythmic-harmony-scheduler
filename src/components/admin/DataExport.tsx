
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  Download, 
  Calendar,
  Users,
  FileText,
  BookOpen,
  CreditCard
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { exportToCsv } from '@/lib/exportToCsv';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { DateRange } from "react-day-picker";

const DataExport = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  // These would come from API calls in a real implementation
  const subjects = ["Guitar", "Piano", "Drums", "Ukulele", "Vocal"];
  const statuses = ["Present", "Cancelled by Student", "Cancelled by Teacher", "Cancelled by School", "Scheduled"];
  
  const handleSubjectToggle = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };
  
  const handleStatusToggle = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };
  
  const handleExport = (type: string) => {
    setIsExporting(true);
    
    // Simulate export delay
    setTimeout(() => {
      const dateRangeStr = `${format(dateRange.from!, 'yyyy-MM-dd')}_to_${format(dateRange.to!, 'yyyy-MM-dd')}`;
      const filename = `${type}_export_${dateRangeStr}.csv`;
      
      // In a real implementation, we would fetch data from the API and export it
      // For now, just export some dummy data
      const dummyData = [
        { id: 1, name: 'Item 1', date: new Date().toISOString(), value: 100 },
        { id: 2, name: 'Item 2', date: new Date().toISOString(), value: 200 },
        { id: 3, name: 'Item 3', date: new Date().toISOString(), value: 300 },
      ];
      
      exportToCsv(dummyData, filename);
      toast.success(`${type} data exported successfully to ${filename}`);
      setIsExporting(false);
    }, 1000);
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Data Export</h1>
      
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Invoices
          </TabsTrigger>
        </TabsList>
        
        {/* Sessions Export */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Export Sessions Data</CardTitle>
              <CardDescription>
                Download a CSV file containing session data within the selected date range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Date Range</h3>
                  <DatePickerWithRange 
                    date={dateRange} 
                    setDate={(newDate) => setDateRange(newDate)}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by Instrument</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {subjects.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`instrument-${subject}`} 
                          checked={selectedSubjects.includes(subject)}
                          onCheckedChange={() => handleSubjectToggle(subject)}
                        />
                        <label 
                          htmlFor={`instrument-${subject}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {subject}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Additional Options</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-teacher-info" />
                      <label 
                        htmlFor="include-teacher-info"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Include teacher information
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-student-info" />
                      <label 
                        htmlFor="include-student-info"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Include student information
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleExport('sessions')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export Sessions'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Attendance Export */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Export Attendance Data</CardTitle>
              <CardDescription>
                Download a CSV file containing attendance records within the selected date range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Date Range</h3>
                  <DatePickerWithRange 
                    date={dateRange} 
                    setDate={(newDate) => setDateRange(newDate)}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by Status</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {statuses.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`status-${status}`} 
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={() => handleStatusToggle(status)}
                        />
                        <label 
                          htmlFor={`status-${status}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Group by</h3>
                  <Select defaultValue="none">
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Select grouping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No grouping</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="instrument">Instrument</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleExport('attendance')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export Attendance'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Students Export */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Export Student Data</CardTitle>
              <CardDescription>
                Download a CSV file containing information about students and their progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by Activity</h3>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      All Students
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      Active Only
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      With Active Packs
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Include Data</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-contact" defaultChecked />
                      <label 
                        htmlFor="include-contact"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Contact information
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-packs" defaultChecked />
                      <label 
                        htmlFor="include-packs"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Pack information
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-attendance" defaultChecked />
                      <label 
                        htmlFor="include-attendance"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Attendance records
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-payment" />
                      <label 
                        htmlFor="include-payment"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Payment history
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleExport('students')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export Student Data'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Courses Export */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Export Course Data</CardTitle>
              <CardDescription>
                Download a CSV file with course information and student enrollments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by Instrument</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {subjects.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`course-subject-${subject}`} 
                          checked={selectedSubjects.includes(subject)}
                          onCheckedChange={() => handleSubjectToggle(subject)}
                        />
                        <label 
                          htmlFor={`course-subject-${subject}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {subject}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Include Data</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-enrollments" defaultChecked />
                      <label 
                        htmlFor="include-enrollments"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Student enrollments
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-course-teachers" defaultChecked />
                      <label 
                        htmlFor="include-course-teachers"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Assigned teachers
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-course-materials" />
                      <label 
                        htmlFor="include-course-materials"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Course materials
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleExport('courses')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export Course Data'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Invoices Export */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Export Financial Data</CardTitle>
              <CardDescription>
                Download a CSV file with invoices and payment information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Date Range</h3>
                  <DatePickerWithRange 
                    date={dateRange} 
                    setDate={(newDate) => setDateRange(newDate)}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      All Invoices
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      Paid
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      Pending
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                      Overdue
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Report Type</h3>
                  <Select defaultValue="invoices">
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoices">Invoices</SelectItem>
                      <SelectItem value="payments">Payments</SelectItem>
                      <SelectItem value="both">Invoices & Payments</SelectItem>
                      <SelectItem value="summary">Financial Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-student-details" defaultChecked />
                    <label 
                      htmlFor="include-student-details"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Include student details
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-payment-methods" defaultChecked />
                    <label 
                      htmlFor="include-payment-methods"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Include payment methods
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleExport('invoices')}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export Financial Data'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataExport;
