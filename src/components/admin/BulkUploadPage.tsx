
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BulkUploadModal } from './BulkUploadModal';
import { BulkUploadHistory } from './BulkUploadHistory';
import { Upload, Users, Calendar, Package } from 'lucide-react';

export default function BulkUploadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Upload</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" /> Upload New File
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UploadCard 
          icon={<Users className="h-6 w-6" />}
          title="Students"
          description="Create multiple student accounts at once"
          onClick={() => setIsModalOpen(true)}
        />
        <UploadCard 
          icon={<Package className="h-6 w-6" />}
          title="Session Packs"
          description="Assign multiple session packs to students"
          onClick={() => setIsModalOpen(true)}
        />
        <UploadCard 
          icon={<Calendar className="h-6 w-6" />}
          title="Sessions"
          description="Schedule multiple sessions at once"
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      <BulkUploadHistory />
      
      {isModalOpen && (
        <BulkUploadModal 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

function UploadCard({
  icon,
  title,
  description,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{description}</CardDescription>
        <Button variant="outline" onClick={onClick} className="w-full">Upload CSV</Button>
      </CardContent>
    </Card>
  );
}
