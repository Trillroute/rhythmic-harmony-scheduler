
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SessionDatePicker } from './SessionDatePicker';
import { SessionTeacherSelector } from './SessionTeacherSelector';
import { Textarea } from '@/components/ui/textarea';
import { useSessions } from '@/hooks/use-sessions';
import { Session } from '@/lib/types';

interface RescheduleSessionDialogProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RescheduleSessionDialog: React.FC<RescheduleSessionDialogProps> = ({ session, isOpen, onClose }) => {
  const [newDate, setNewDate] = useState<Date | undefined>(
    session ? new Date(session.dateTime) : undefined
  );
  const [newTeacher, setNewTeacher] = useState<string>(
    session?.teacherId || ''
  );
  const [notes, setNotes] = useState<string>(
    session?.notes || ''
  );
  
  const { rescheduleSession, isPendingReschedule } = useSessions();
  
  // Reset state when the session changes
  React.useEffect(() => {
    if (session) {
      setNewDate(new Date(session.dateTime));
      setNewTeacher(session.teacherId);
      setNotes(session.notes || '');
    }
  }, [session]);
  
  const handleReschedule = async () => {
    if (!session || !newDate) return;
    
    try {
      await rescheduleSession({
        sessionId: session.id,
        newDateTime: newDate,
        newTeacherId: newTeacher !== session.teacherId ? newTeacher : undefined,
        newNotes: notes !== session.notes ? notes : undefined
      });
      
      onClose();
    } catch (error) {
      console.error("Error rescheduling session:", error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
          <DialogDescription>
            Choose a new date, time, and optionally a different teacher for this session.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <SessionDatePicker
            selectedDate={newDate}
            onSelectDate={setNewDate}
          />
          
          <SessionTeacherSelector
            selectedTeacher={newTeacher}
            onSelectTeacher={setNewTeacher}
          />
          
          <div>
            <Textarea
              placeholder="Add notes about this rescheduling"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={isPendingReschedule || !newDate}
          >
            {isPendingReschedule ? "Rescheduling..." : "Reschedule Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
