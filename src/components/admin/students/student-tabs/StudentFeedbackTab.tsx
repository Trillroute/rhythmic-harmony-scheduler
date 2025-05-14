
import React from "react";
import { useStudentFeedback } from "@/hooks/use-student-feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangleIcon, MessageSquareIcon, StarIcon } from "lucide-react";
import { format } from "date-fns";

interface StudentFeedbackTabProps {
  studentId: string;
}

export const StudentFeedbackTab: React.FC<StudentFeedbackTabProps> = ({ studentId }) => {
  const { feedback, isLoading, error } = useStudentFeedback(studentId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-destructive/10 flex flex-col items-center justify-center">
        <AlertTriangleIcon className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Feedback</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Failed to load feedback data"}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareIcon className="h-5 w-5" />
          Teacher Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedback && feedback.length > 0 ? (
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {item.teacherName} - {item.sessionSubject || "General feedback"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.createdAt && format(new Date(item.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  {item.rating && (
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-4 w-4 ${
                            star <= item.rating! ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="whitespace-pre-wrap">{item.feedbackText}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center">
            <p className="text-muted-foreground">No feedback available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
