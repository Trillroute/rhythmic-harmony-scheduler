
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface StudentProgressTableProps {
  data: {
    id: string;
    studentName: string;
    courseName: string;
    instrument: string;
    completionPercentage: number;
  }[];
}

const StudentProgressTable: React.FC<StudentProgressTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Instrument</TableHead>
            <TableHead>Completion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">No progress data available</TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.studentName}</TableCell>
                <TableCell>{item.courseName}</TableCell>
                <TableCell>{item.instrument}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={item.completionPercentage} className="h-2" />
                    <span className="text-xs">{item.completionPercentage}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentProgressTable;
