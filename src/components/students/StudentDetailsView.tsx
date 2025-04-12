import React from 'react';
import { StudentDetailsTab } from './details/StudentDetailsTab';

interface StudentDetailsViewProps {
  studentId: string;
}

export const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({ studentId }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Student Details</h1>
      <StudentDetailsTab studentId={studentId} />
    </div>
  );
}; 