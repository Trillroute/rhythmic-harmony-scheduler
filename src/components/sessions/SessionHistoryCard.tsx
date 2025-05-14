
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Session } from '@/lib/types';
import { useSessions } from '@/hooks/use-sessions';

interface SessionHistoryCardProps {
  sessionId: string;
}

export const SessionHistoryCard: React.FC<SessionHistoryCardProps> = ({ sessionId }) => {
  const { sessions, isLoading } = useSessions();
  
  // Find the current session
  const currentSession = sessions.find(s => s.id === sessionId);
  
  // Find related sessions (original and rescheduled)
  const originalSession = currentSession?.originalSessionId 
    ? sessions.find(s => s.id === currentSession.originalSessionId)
    : undefined;
    
  const rescheduledSessions = sessions.filter(s => 
    s.originalSessionId === sessionId || s.rescheduledFrom === sessionId
  );
  
  if (isLoading) {
    return <div>Loading session history...</div>;
  }
  
  if (!currentSession) {
    return <div>Session not found</div>;
  }
  
  // If there's no history (no original and no rescheduled), don't show anything
  if (!originalSession && rescheduledSessions.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Session History</CardTitle>
        <CardDescription>
          This session {originalSession ? 'was rescheduled' : 'has been rescheduled'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {originalSession && (
          <div className="border rounded-md p-3 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Original Session</h4>
              <Badge variant="outline">{originalSession.status}</Badge>
            </div>
            <p className="text-sm">
              {format(new Date(originalSession.dateTime), 'PPP p')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              with {originalSession.teacherName || 'Unknown Teacher'}
            </p>
          </div>
        )}
        
        {rescheduledSessions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Rescheduled to</h4>
            <div className="space-y-2">
              {rescheduledSessions.map(session => (
                <div key={session.id} className="border rounded-md p-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">
                      {format(new Date(session.dateTime), 'PPP p')}
                    </p>
                    <Badge variant={session.status === 'Scheduled' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    with {session.teacherName || 'Unknown Teacher'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
