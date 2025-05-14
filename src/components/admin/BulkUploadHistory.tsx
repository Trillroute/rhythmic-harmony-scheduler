
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBulkUploads, useUploadDetails } from '@/hooks/use-bulk-uploads';
import { BulkUpload } from '@/lib/types';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, File, Loader2, RefreshCw, Trash2, XCircle } from 'lucide-react';

export function BulkUploadHistory() {
  const { uploads, isLoading, deleteUpload, isDeleting } = useBulkUploads();
  const [detailsUploadId, setDetailsUploadId] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!uploads || uploads.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <File className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold">No upload history</h3>
        <p className="text-sm text-muted-foreground">
          When you upload files, they will appear here
        </p>
      </div>
    );
  }

  const refreshPage = () => {
    window.location.reload();
  };

  const handleDelete = (uploadId: string) => {
    if (confirm('Are you sure you want to delete this upload record and its associated file?')) {
      deleteUpload(uploadId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="outline" className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Processing</Badge>;
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Upload History</CardTitle>
            <CardDescription>Records of your bulk uploads</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={refreshPage}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Success/Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell className="font-medium">
                      {format(new Date(upload.created_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>{upload.file_name}</TableCell>
                    <TableCell className="capitalize">{upload.upload_type.replace('_', ' ')}</TableCell>
                    <TableCell>{getStatusBadge(upload.status)}</TableCell>
                    <TableCell>
                      {upload.successful_rows}/{upload.total_rows || '?'}
                      {upload.failed_rows > 0 && (
                        <span className="text-destructive ml-1">({upload.failed_rows} failed)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDetailsUploadId(upload.id)}
                        >
                          Details
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={isDeleting}
                          onClick={() => handleDelete(upload.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {detailsUploadId && (
        <UploadDetailsDialog
          uploadId={detailsUploadId}
          onClose={() => setDetailsUploadId(null)}
        />
      )}
    </>
  );
}

function UploadDetailsDialog({ uploadId, onClose }: { uploadId: string; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('all');
  const { data: upload, isLoading } = useUploadDetails(uploadId);
  
  if (isLoading || !upload) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  const errors = upload.result_summary?.errors || [];
  const warnings = upload.result_summary?.warnings || [];
  const successes = upload.result_summary?.success || [];
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Details</DialogTitle>
          <DialogDescription>
            {upload.file_name} - {format(new Date(upload.created_at), 'MMM d, yyyy h:mm a')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div className="p-2 rounded-md bg-muted">
            <div className="text-2xl font-bold">{upload.total_rows || '?'}</div>
            <div className="text-xs text-muted-foreground">Total Rows</div>
          </div>
          <div className="p-2 rounded-md bg-green-100 dark:bg-green-900">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{upload.successful_rows}</div>
            <div className="text-xs text-muted-foreground">Successful</div>
          </div>
          <div className="p-2 rounded-md bg-red-100 dark:bg-red-900">
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{upload.failed_rows}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 w-full">
            <TabsTrigger value="all">
              All ({errors.length + warnings.length + successes.length})
            </TabsTrigger>
            <TabsTrigger value="errors">
              Errors ({errors.length})
            </TabsTrigger>
            <TabsTrigger value="warnings">
              Warnings ({warnings.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="rounded-md border h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTab === 'all' && (
                  <>
                    {errors.map((error, i) => (
                      <TableRow key={`err-${i}`}>
                        <TableCell>{error.row}</TableCell>
                        <TableCell>{error.message}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Error
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {warnings.map((warning, i) => (
                      <TableRow key={`warn-${i}`}>
                        <TableCell>{warning.row}</TableCell>
                        <TableCell>{warning.message}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="flex items-center gap-1 bg-yellow-500">
                            <AlertCircle className="h-3 w-3" /> Warning
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {successes.map((success, i) => (
                      <TableRow key={`succ-${i}`}>
                        <TableCell>{success.row}</TableCell>
                        <TableCell>Successfully processed</TableCell>
                        <TableCell>
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Success
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
                
                {activeTab === 'errors' && (
                  errors.length > 0 ? 
                    errors.map((error, i) => (
                      <TableRow key={`err-${i}`}>
                        <TableCell>{error.row}</TableCell>
                        <TableCell>{error.message}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">Error</Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No errors found
                        </TableCell>
                      </TableRow>
                    )
                )}
                
                {activeTab === 'warnings' && (
                  warnings.length > 0 ? 
                    warnings.map((warning, i) => (
                      <TableRow key={`warn-${i}`}>
                        <TableCell>{warning.row}</TableCell>
                        <TableCell>{warning.message}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-yellow-500">Warning</Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No warnings found
                        </TableCell>
                      </TableRow>
                    )
                )}
              </TableBody>
            </Table>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
