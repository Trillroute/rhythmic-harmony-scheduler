
import React, { useState } from 'react';
import { runDatabaseSeeding, SeededData } from '@/utils/seed-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SeedDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});

  const handlePopulateDatabase = async () => {
    try {
      setLoading(true);
      setCompleted(false);
      setError(null);
      
      // First check if we have existing users
      const { data: profiles, error } = await supabase.from('profiles').select('id, role').limit(1);
      
      if (error) {
        toast.error('Error checking profiles: ' + error.message);
        setError('Error checking profiles: ' + error.message);
        return;
      }
      
      if (!profiles || profiles.length === 0) {
        const errorMsg = 'No existing user profiles found. Please create users first before running the database seeder.';
        toast.error(errorMsg);
        setError(errorMsg);
        return;
      }
      
      // Run the seeding script
      const result = await runDatabaseSeeding();
      
      // Display summary of created data
      setStats({
        teachers: result.teachers.length,
        students: result.students.length,
        admins: result.admins.length,
        courses: result.courses.length,
        sessionPlans: result.sessionPlans.length,
        packs: result.packs.length,
        sessions: result.sessions.length,
        enrollments: result.enrollments?.length || 0,
        feePlans: result.feePlans.length,
        invoices: result.invoices.length,
        payments: result.payments.length,
        attendance: result.attendance?.length || 0,
        feedback: result.feedback?.length || 0,
        timeSlots: result.timeSlots?.length || 0,
        reminders: result.reminders?.length || 0,
        settings: result.settings?.length || 0
      });
      
      setCompleted(true);
      toast.success('Database populated successfully!');
    } catch (error: any) {
      const errorMsg = `Error populating database: ${error.message}`;
      toast.error(errorMsg);
      setError(errorMsg);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Seed Utility</h1>
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Populate Database with Test Data</h2>
        <p className="text-muted-foreground mb-6">
          This utility will populate your database with test data for existing user accounts. 
          Make sure you already have admin, teacher, and student user accounts created in Supabase Auth.
        </p>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-2">This will create:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Teacher &amp; student profile data (subjects, preferences, etc.)</li>
            <li>Courses &amp; session plans</li>
            <li>Session packs &amp; scheduled sessions</li>
            <li>Enrollments &amp; progress records</li>
            <li>Fee plans, invoices &amp; payments</li>
            <li>Attendance records &amp; feedback</li>
            <li>Time slots, reminders &amp; system settings</li>
          </ul>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}
        
        <Button 
          onClick={handlePopulateDatabase} 
          disabled={loading || completed}
          className="mb-4"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Populating Database...
            </>
          ) : completed ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Database Populated
            </>
          ) : (
            'Populate Database'
          )}
        </Button>
        
        {completed && Object.keys(stats).length > 0 && (
          <div className="mt-6">
            <Separator className="my-4" />
            <h3 className="font-semibold mb-2">Summary of Created Data:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="bg-muted p-3 rounded-md">
                  <div className="text-sm text-muted-foreground capitalize">{key}</div>
                  <div className="text-lg font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <p className="mb-2"><strong>Note:</strong> This process may take a minute or two to complete as it creates multiple related records.</p>
        <p>All data is created with realistic relationships and values to represent a functional music school system.</p>
      </div>
    </div>
  );
};

export default SeedDatabase;
