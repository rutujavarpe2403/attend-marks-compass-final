import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/common/DataTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { EmptyState } from "../common/EmptyState";
import { MarksFilterBar } from "./MarksFilterBar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TeacherMarksViewProps {
  selectedClass: string;
  selectedBoard: string;
  selectedExamType: string;
  selectedSubject: string;
}

export interface MarksRecord {
  id: string;
  student_id: string;
  student_name?: string;
  class_id: string;
  board: string;
  exam_type: string;
  subject_id: string;
  marks: number;
  created_at: string;
}

export const TeacherMarksView = ({
  selectedClass,
  selectedBoard,
  selectedExamType,
  selectedSubject,
}: TeacherMarksViewProps) => {
  const [loading, setLoading] = useState(false);
  const [marks, setMarks] = useState<MarksRecord[]>([]);

  const teacherColumns = [
    { 
      header: "Student", 
      accessorKey: "student_name",
      cell: ({ row }: { row: any }) => (
        <div className="font-medium">{row.original.student_name}</div>
      )
    },
    { 
      header: "Subject", 
      accessorKey: "subject_id",
      cell: ({ row }: { row: any }) => (
        <Badge variant="outline">{row.original.subject_id}</Badge>
      )
    },
    { 
      header: "Class", 
      accessorKey: "class_id",
      cell: ({ row }: { row: any }) => (
        <div>Class {row.original.class_id}</div>
      )
    },
    { 
      header: "Exam Type", 
      accessorKey: "exam_type",
      cell: ({ row }: { row: any }) => (
        <Badge variant="secondary">{row.original.exam_type}</Badge>
      )
    },
    { 
      header: "Marks", 
      accessorKey: "marks",
      cell: ({ row }: { row: any }) => {
        const marks = row.original.marks;
        let variant = "default";
        if (marks >= 75) variant = "success";
        else if (marks >= 35) variant = "warning";
        else variant = "destructive";
        
        return (
          <Badge variant={variant as any}>{marks}/100</Badge>
        );
      }
    },
  ];

  useEffect(() => {
    fetchMarks();
  }, [selectedClass, selectedBoard, selectedExamType, selectedSubject]);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      
      // First, get the students based on filters
      let studentsQuery = supabase
        .from('students')
        .select('id, name, class_id, board');
      
      if (selectedClass !== "all") {
        studentsQuery = studentsQuery.eq('class_id', selectedClass);
      }
      if (selectedBoard !== "all") {
        studentsQuery = studentsQuery.eq('board', selectedBoard);
      }

      const { data: students, error: studentsError } = await studentsQuery;
      
      if (studentsError) {
        throw studentsError;
      }

      if (!students || students.length === 0) {
        setMarks([]);
        return;
      }

      // Then get marks for these students
      let marksQuery = supabase
        .from('marks')
        .select('*')
        .in('student_id', students.map(s => s.id))
        .order('created_at', { ascending: false });

      if (selectedExamType !== "all") {
        marksQuery = marksQuery.eq('exam_type', selectedExamType);
      }
      if (selectedSubject !== "all") {
        marksQuery = marksQuery.eq('subject_id', selectedSubject);
      }

      const { data: marksData, error: marksError } = await marksQuery;

      if (marksError) {
        throw marksError;
      }

      // Combine marks with student data
      const marksWithNames = marksData.map(mark => {
        const student = students.find(s => s.id === mark.student_id);
        return {
          ...mark,
          student_name: student?.name || "Unknown"
        };
      });

      setMarks(marksWithNames);
    } catch (error: any) {
      console.error("Error fetching marks:", error);
      toast.error("Failed to load marks data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Marks</CardTitle>
        <CardDescription>
          View and filter student marks by class, board, exam type, and subject
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MarksFilterBar
          selectedClass={selectedClass}
          selectedBoard={selectedBoard}
          selectedExamType={selectedExamType}
          selectedSubject={selectedSubject}
        />
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : marks.length > 0 ? (
          <DataTable 
            columns={teacherColumns} 
            data={marks} 
            searchable={true}
          />
        ) : (
          <EmptyState 
            title="No marks found" 
            description="Use the filters above to view marks or upload marks using the CSV form." 
          />
        )}
      </CardContent>
    </Card>
  );
};
