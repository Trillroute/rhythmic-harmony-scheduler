
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DownloadIcon } from "lucide-react";
import { format, subMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatDataForExport, exportToCsv } from "@/lib/exportToCsv";
import { useToast } from "@/hooks/use-toast";

const DataExport = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: subMonths(new Date(), 3),
    endDate: new Date()
  });
  
  const [dataType, setDataType] = useState("sessions");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Export data based on filters
  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      const formattedStartDate = format(dateRange.startDate, "yyyy-MM-dd");
      const formattedEndDate = format(dateRange.endDate, "yyyy-MM-dd");
      
      let data;
      let filename;
      
      switch (dataType) {
        case "sessions":
          let sessionsQuery = supabase
            .from("sessions")
            .select("*")
            .gte("date_time", formattedStartDate)
            .lte("date_time", formattedEndDate);
          
          if (selectedSubject) {
            sessionsQuery = sessionsQuery.eq("subject", selectedSubject);
          }
          
          if (selectedStatus) {
            sessionsQuery = sessionsQuery.eq("status", selectedStatus);
          }
          
          const { data: sessionsData, error: sessionsError } = await sessionsQuery;
          
          if (sessionsError) throw new Error(sessionsError.message);
          
          data = formatDataForExport(sessionsData, "sessions");
          filename = `sessions-export-${format(new Date(), "yyyy-MM-dd")}`;
          break;
          
        case "attendance":
          let attendanceQuery = supabase
            .from("attendance_events")
            .select("*")
            .gte("marked_at", formattedStartDate)
            .lte("marked_at", formattedEndDate);
          
          if (selectedStatus) {
            attendanceQuery = attendanceQuery.eq("status", selectedStatus);
          }
          
          const { data: attendanceData, error: attendanceError } = await attendanceQuery;
          
          if (attendanceError) throw new Error(attendanceError.message);
          
          data = formatDataForExport(attendanceData, "attendance");
          filename = `attendance-export-${format(new Date(), "yyyy-MM-dd")}`;
          break;
          
        case "packs":
          let packsQuery = supabase
            .from("session_packs")
            .select("*");
          
          if (selectedSubject) {
            packsQuery = packsQuery.eq("subject", selectedSubject);
          }
          
          const { data: packsData, error: packsError } = await packsQuery;
          
          if (packsError) throw new Error(packsError.message);
          
          data = formatDataForExport(packsData, "packs");
          filename = `packs-export-${format(new Date(), "yyyy-MM-dd")}`;
          break;
      }
      
      if (data && data.length > 0) {
        exportToCsv(data, filename);
        toast({
          title: "Export Successful",
          description: `${data.length} records exported to ${filename}.csv`,
        });
      } else {
        toast({
          title: "No Data",
          description: "No data found matching your filters",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Data Export</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Export your data as CSV files for analysis or backup</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sessions" onValueChange={setDataType}>
            <TabsList className="mb-6">
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="packs">Student Packs</TabsTrigger>
            </TabsList>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Start Date</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateRange.startDate, "PPP")}
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
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">End Date</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateRange.endDate, "PPP")}
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
                
                {/* Subject Filter (Sessions & Packs) */}
                {(dataType === "sessions" || dataType === "packs") && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Subject</span>
                    <Select value={selectedSubject || ""} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Subjects</SelectItem>
                        <SelectItem value="Guitar">Guitar</SelectItem>
                        <SelectItem value="Piano">Piano</SelectItem>
                        <SelectItem value="Drums">Drums</SelectItem>
                        <SelectItem value="Ukulele">Ukulele</SelectItem>
                        <SelectItem value="Vocal">Vocal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Status Filter (Sessions & Attendance) */}
                {(dataType === "sessions" || dataType === "attendance") && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Status</span>
                    <Select value={selectedStatus || ""} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Cancelled by Student">Cancelled by Student</SelectItem>
                        <SelectItem value="Cancelled by Teacher">Cancelled by Teacher</SelectItem>
                        <SelectItem value="Cancelled by School">Cancelled by School</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {/* Export Information based on selected tab */}
              <TabsContent value="sessions" className="mt-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Sessions Export</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export all session data including teacher, student, subject, date, time, and status.
                    Filter by date range, subject, and status.
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Session ID, type, and location</li>
                    <li>Teacher and student assignments</li>
                    <li>Date, time, and duration</li>
                    <li>Attendance status and reschedule history</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="attendance" className="mt-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Attendance Export</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export attendance records for all sessions. Includes attendance status, who marked attendance,
                    and when it was recorded. Filter by date range and status.
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Attendance status (Present, Cancelled, etc.)</li>
                    <li>Session reference</li>
                    <li>Marked by user and timestamp</li>
                    <li>Additional notes</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="packs" className="mt-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Student Packs Export</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export data on all student session packs including size, remaining sessions, purchase date,
                    and expiry date. Filter by subject.
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Pack size and type</li>
                    <li>Student information</li>
                    <li>Purchase and expiry dates</li>
                    <li>Remaining sessions and usage</li>
                  </ul>
                </div>
              </TabsContent>
              
              <Button 
                onClick={handleExport} 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  "Exporting..."
                ) : (
                  <>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export {dataType} as CSV
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExport;
