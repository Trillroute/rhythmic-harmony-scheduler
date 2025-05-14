
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown, FileText, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

const DataExport = () => {
  const [exportType, setExportType] = useState<'sessions' | 'students' | 'packs' | 'attendance'>('sessions');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: undefined,
  });
  const [fileFormat, setFileFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  
  // Fields to include in export
  const [selectedFields, setSelectedFields] = useState<{
    [key: string]: {
      label: string;
      checked: boolean;
    }
  }>({
    // Sessions fields
    id: { label: 'Session ID', checked: true },
    date: { label: 'Date', checked: true },
    time: { label: 'Time', checked: true },
    duration: { label: 'Duration', checked: true },
    teacher: { label: 'Teacher', checked: true },
    student: { label: 'Student', checked: true },
    subject: { label: 'Subject', checked: true },
    sessionType: { label: 'Session Type', checked: true },
    location: { label: 'Location', checked: true },
    status: { label: 'Status', checked: true },
    notes: { label: 'Notes', checked: false },
  });

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        checked: !prev[fieldId].checked
      }
    }));
  };

  const handleExport = () => {
    const exportData = {
      type: exportType,
      dateRange,
      fileFormat,
      fields: Object.entries(selectedFields)
        .filter(([_, { checked }]) => checked)
        .map(([id]) => id)
    };
    
    console.log('Exporting data:', exportData);
    // In a real app, this would call an API to generate the export
  };

  // Different fields based on export type
  const getFieldsForExportType = () => {
    const fieldsMap = {
      sessions: [
        'id', 'date', 'time', 'duration', 'teacher', 'student', 
        'subject', 'sessionType', 'location', 'status', 'notes'
      ],
      students: [
        'id', 'name', 'email', 'phone', 'address', 'preferredSubjects',
        'joinDate', 'status', 'notes'
      ],
      packs: [
        'id', 'student', 'subject', 'sessionType', 'location',
        'size', 'remaining', 'purchaseDate', 'expiryDate', 'status'
      ],
      attendance: [
        'sessionId', 'date', 'student', 'teacher', 'status',
        'notes', 'markedBy', 'markedAt'
      ]
    };
    
    return fieldsMap[exportType] || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
      </div>
      
      <Tabs defaultValue="sessions" onValueChange={(value) => setExportType(value as any)}>
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="packs">Session Packs</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Export {exportType.charAt(0).toUpperCase() + exportType.slice(1)} Data</CardTitle>
            <CardDescription>Select options for your data export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Date Range</h3>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                  className="rounded-md border mb-4"
                />
                
                <div className="mt-4">
                  <Label>File Format</Label>
                  <Select value={fileFormat} onValueChange={(value) => setFileFormat(value as any)}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Fields to Include</h3>
                <div className="space-y-3">
                  {getFieldsForExportType().map(fieldId => (
                    <div key={fieldId} className="flex items-center space-x-2">
                      <Checkbox 
                        id={fieldId} 
                        checked={selectedFields[fieldId]?.checked || false}
                        onCheckedChange={() => toggleField(fieldId)}
                      />
                      <Label htmlFor={fieldId} className="text-sm font-normal">
                        {selectedFields[fieldId]?.label || fieldId}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-x-3 flex">
              <Button 
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <FileDown size={16} />
                Export {exportType}
              </Button>
              
              <Button 
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText size={16} />
                Preview
              </Button>
              
              <Button 
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileSpreadsheet size={16} />
                Save Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default DataExport;
