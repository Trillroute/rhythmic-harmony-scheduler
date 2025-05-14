
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Download, Upload, AlertCircle, HelpCircle } from 'lucide-react';
import { useBulkUploads } from '@/hooks/use-bulk-uploads';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function BulkUploadModal({ open, onClose }: BulkUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'session_packs' | 'sessions'>('students');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, isUploading } = useBulkUploads();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check if file is CSV
      if (!file.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file format',
          description: 'Please upload a CSV file',
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      });
      return;
    }

    uploadFile(
      { file: selectedFile, uploadType: activeTab },
      {
        onSuccess: () => {
          setSelectedFile(null);
          onClose();
        },
      }
    );
  };

  const getTemplateLink = (type: 'students' | 'session_packs' | 'sessions') => {
    // In a real application, these would be actual template files stored in your public directory
    return `/templates/${type}_template.csv`;
  };

  const renderTemplateInfo = () => {
    switch (activeTab) {
      case 'students':
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Template Format</AlertTitle>
            <AlertDescription>
              <p className="text-sm">Your CSV file should have the following columns:</p>
              <ul className="text-sm list-disc pl-5 mt-2">
                <li><strong>name</strong> (required) - Full name of the student</li>
                <li><strong>email</strong> (required) - Email address (must be unique)</li>
                <li><strong>preferred_subjects</strong> (optional) - Comma-separated list of subjects</li>
                <li><strong>notes</strong> (optional) - Additional notes about the student</li>
              </ul>
            </AlertDescription>
          </Alert>
        );
      case 'session_packs':
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Template Format</AlertTitle>
            <AlertDescription>
              <p className="text-sm">Your CSV file should have the following columns:</p>
              <ul className="text-sm list-disc pl-5 mt-2">
                <li><strong>student_email</strong> or <strong>student_id</strong> (one required) - Student identifier</li>
                <li><strong>size</strong> (required) - Pack size (4, 10, 20, or 30)</li>
                <li><strong>subject</strong> (required) - Guitar, Piano, Drums, Ukulele, or Vocal</li>
                <li><strong>session_type</strong> (required) - Solo, Duo, or Focus</li>
                <li><strong>location</strong> (required) - Online or Offline</li>
                <li><strong>weekly_frequency</strong> (required) - once or twice</li>
                <li><strong>purchased_date</strong> (optional) - Date in YYYY-MM-DD format</li>
                <li><strong>expiry_date</strong> (optional) - Date in YYYY-MM-DD format</li>
              </ul>
            </AlertDescription>
          </Alert>
        );
      case 'sessions':
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Template Format</AlertTitle>
            <AlertDescription>
              <p className="text-sm">Your CSV file should have the following columns:</p>
              <ul className="text-sm list-disc pl-5 mt-2">
                <li><strong>teacher_email</strong> or <strong>teacher_id</strong> (one required) - Teacher identifier</li>
                <li><strong>student_email</strong> or <strong>student_id</strong> (one required) - Student identifier</li>
                <li><strong>date_time</strong> (required) - ISO format date and time</li>
                <li><strong>duration</strong> (required) - Session duration in minutes</li>
                <li><strong>subject</strong> (required) - Guitar, Piano, Drums, Ukulele, or Vocal</li>
                <li><strong>session_type</strong> (required) - Solo, Duo, or Focus</li>
                <li><strong>location</strong> (required) - Online or Offline</li>
                <li><strong>notes</strong> (optional) - Additional notes for the session</li>
              </ul>
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload</DialogTitle>
          <DialogDescription>
            Upload CSV files to create multiple records at once.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="session_packs">Session Packs</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
          
          <div className="space-y-4">
            {renderTemplateInfo()}
            
            <div className="flex items-center justify-between">
              <Label htmlFor="file">Upload CSV File</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => window.open(getTemplateLink(activeTab), '_blank')}
              >
                <Download className="h-4 w-4" /> Download Template
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-md p-8">
                  <input 
                    type="file" 
                    id="file" 
                    className="hidden" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                  />
                  <label 
                    htmlFor="file" 
                    className="flex flex-col items-center justify-center cursor-pointer w-full"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium mb-1">
                      {selectedFile ? selectedFile.name : 'Click to select a CSV file'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'CSV file only (.csv)'}
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="ml-2"
          >
            {isUploading ? 'Uploading...' : 'Upload & Process'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
