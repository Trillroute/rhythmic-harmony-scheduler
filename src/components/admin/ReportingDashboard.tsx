
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAttendanceReport, useSessionReport, usePackReport, ReportFilter } from "@/hooks/use-reports";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, DownloadIcon } from "lucide-react";
import { formatDataForExport, exportToCsv } from "@/lib/exportToCsv";
import { useSystemSettings } from "@/hooks/use-settings";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A832A8'];

const ReportingDashboard = () => {
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: subMonths(new Date(), 3),
    endDate: new Date()
  });
  
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });
  
  const { settings } = useSystemSettings();
  const supportedSubjects = settings?.find(s => s.key === 'supported_subjects')?.value || [];
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  
  // Reports hooks
  const attendance = useAttendanceReport(filters);
  const sessions = useSessionReport(filters);
  const packs = usePackReport(filters);
  
  // Handle filter changes
  const applyFilters = () => {
    setFilters({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      status: selectedStatus.length > 0 ? selectedStatus : undefined
    });
  };
  
  // Export data to CSV
  const handleExport = (type: 'sessions' | 'attendance' | 'packs') => {
    let data;
    let filename;
    
    switch (type) {
      case 'sessions':
        data = formatDataForExport(sessions.data?.rawData || [], 'sessions');
        filename = `sessions-report-${format(new Date(), 'yyyy-MM-dd')}`;
        break;
      case 'attendance':
        data = formatDataForExport(attendance.data?.rawData || [], 'attendance');
        filename = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}`;
        break;
      case 'packs':
        data = formatDataForExport(packs.data?.rawData || [], 'packs');
        filename = `packs-report-${format(new Date(), 'yyyy-MM-dd')}`;
        break;
    }
    
    if (data && data.length > 0) {
      exportToCsv(data, filename);
    }
  };
  
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Filter data by date range, subjects, and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Date Range</span>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.startDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.startDate}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.endDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.endDate}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Subjects</span>
              <Select onValueChange={(value) => {
                if (value === 'all') {
                  setSelectedSubjects([]);
                } else if (!selectedSubjects.includes(value)) {
                  setSelectedSubjects([...selectedSubjects, value]);
                }
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {supportedSubjects.map((subject: string) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSubjects.map(subject => (
                    <div key={subject} className="bg-primary-100 px-2 py-1 rounded-full text-xs flex items-center">
                      {subject}
                      <button
                        className="ml-1 text-red-500"
                        onClick={() => setSelectedSubjects(prev => prev.filter(s => s !== subject))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Status</span>
              <Select onValueChange={(value) => {
                if (value === 'all') {
                  setSelectedStatus([]);
                } else if (!selectedStatus.includes(value)) {
                  setSelectedStatus([...selectedStatus, value]);
                }
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Cancelled by Student">Cancelled by Student</SelectItem>
                  <SelectItem value="Cancelled by Teacher">Cancelled by Teacher</SelectItem>
                  <SelectItem value="Cancelled by School">Cancelled by School</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              
              {selectedStatus.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedStatus.map(status => (
                    <div key={status} className="bg-primary-100 px-2 py-1 rounded-full text-xs flex items-center">
                      {status}
                      <button
                        className="ml-1 text-red-500"
                        onClick={() => setSelectedStatus(prev => prev.filter(s => s !== status))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button onClick={applyFilters} className="mt-auto">Apply Filters</Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Report Tabs */}
      <Tabs defaultValue="attendance">
        <TabsList className="mb-6">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="packs">Pack Usage</TabsTrigger>
        </TabsList>
        
        {/* Attendance Report */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Attendance Report</CardTitle>
                  <CardDescription>
                    Attendance data from {format(filters.startDate!, 'PP')} to {format(filters.endDate!, 'PP')}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExport('attendance')}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {attendance.isLoading ? (
                  <div className="h-80 flex items-center justify-center">Loading...</div>
                ) : attendance.error ? (
                  <div className="h-80 flex items-center justify-center text-red-500">
                    Error: {attendance.error.message}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Total Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{attendance.data?.totalSessions || 0}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Present Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {attendance.data?.studentAttendance.length ? (
                            <p className="text-3xl font-bold">
                              {Math.round(
                                attendance.data.studentAttendance.reduce((acc, curr) => acc + curr.percentage, 0) / 
                                attendance.data.studentAttendance.length
                              )}%
                            </p>
                          ) : (
                            <p className="text-3xl font-bold">0%</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Frequently Absent</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-lg font-medium">
                            {attendance.data?.studentAttendance[0]?.id || 'No data'}
                          </p>
                          {attendance.data?.studentAttendance[0] && (
                            <p className="text-sm text-muted-foreground">
                              {attendance.data.studentAttendance[0].percentage}% attendance
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="h-80">
                      <h3 className="text-lg font-medium mb-4">Attendance by Student</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={(attendance.data?.studentAttendance || []).slice(0, 10).map(student => ({
                            id: student.id,
                            percentage: student.percentage
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="id" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="percentage" fill="#8884d8" name="Attendance %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Sessions Report */}
        <TabsContent value="sessions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Sessions Report</CardTitle>
                  <CardDescription>
                    Session data from {format(filters.startDate!, 'PP')} to {format(filters.endDate!, 'PP')}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExport('sessions')}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {sessions.isLoading ? (
                  <div className="h-80 flex items-center justify-center">Loading...</div>
                ) : sessions.error ? (
                  <div className="h-80 flex items-center justify-center text-red-500">
                    Error: {sessions.error.message}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Total Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{sessions.data?.totalSessions || 0}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">
                            {sessions.data?.sessionsByStatus.find(s => s.status === "Present")?.count || 0}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Cancelled</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">
                            {(sessions.data?.sessionsByStatus.filter(s => 
                              s.status === "Cancelled by Student" || 
                              s.status === "Cancelled by Teacher" || 
                              s.status === "Cancelled by School"
                            ).reduce((acc, curr) => acc + curr.count, 0)) || 0}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Rescheduled</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{sessions.data?.totalRescheduled || 0}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-80">
                        <h3 className="text-lg font-medium mb-4">Sessions by Status</h3>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={sessions.data?.sessionsByStatus || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="status"
                            >
                              {sessions.data?.sessionsByStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="h-80">
                        <h3 className="text-lg font-medium mb-4">Sessions by Teacher</h3>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={sessions.data?.sessionsByTeacher || []}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" name="Sessions Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pack Usage Report */}
        <TabsContent value="packs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pack Usage Report</CardTitle>
                  <CardDescription>Analysis of session packs usage and revenue</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExport('packs')}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {packs.isLoading ? (
                  <div className="h-80 flex items-center justify-center">Loading...</div>
                ) : packs.error ? (
                  <div className="h-80 flex items-center justify-center text-red-500">
                    Error: {packs.error.message}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Total Packs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{packs.data?.totalPacks || 0}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">
                            {packs.data?.usagePercentage || 0}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {packs.data?.totalUsed || 0} of {packs.data?.totalSessions || 0} sessions
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Expiring Soon</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{packs.data?.expiringPacks?.length || 0}</p>
                          <p className="text-sm text-muted-foreground">Within next 30 days</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Est. Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">${packs.data?.estimatedRevenue || 0}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-80">
                        <h3 className="text-lg font-medium mb-4">Packs by Size</h3>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={packs.data?.packsBySize || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ size, percent }) => `${size}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="size"
                            >
                              {packs.data?.packsBySize.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="h-80">
                        <h3 className="text-lg font-medium mb-4">Sessions Used vs Remaining</h3>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[{
                              name: 'Sessions',
                              used: packs.data?.totalUsed || 0,
                              remaining: packs.data?.totalRemaining || 0
                            }]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="used" stackId="a" fill="#8884d8" name="Used Sessions" />
                            <Bar dataKey="remaining" stackId="a" fill="#82ca9d" name="Remaining Sessions" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {packs.data?.expiringPacks && packs.data.expiringPacks.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Packs Expiring Soon</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Subject
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Expiry Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Remaining
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {packs.data.expiringPacks.map((pack) => (
                                <tr key={pack.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {pack.student_id}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {pack.subject}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(pack.expiry_date).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {pack.remaining_sessions}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportingDashboard;
