import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { AttendanceRecord } from "./AttendanceSection";
import { MarkRecord } from "./MarksSection";

export interface DashboardStats {
  totalStudents: number;
  attendanceRate: number;
  averageGrade: number;
}

export const fetchDashboardData = async () => {
  try {
    // Get current month's date range
    const currentDate = new Date();
    const monthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    // Fetch total student count
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id');
    
    if (studentError) throw studentError;
    
    // Fetch attendance data for current month
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date', { ascending: false });
    
    if (attendanceError) throw attendanceError;
    
    // Fetch marks data
    const { data: marksData, error: marksError } = await supabase
      .from('marks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (marksError) throw marksError;
    
    // Calculate dashboard stats
    const totalStudents = students?.length || 0;
    
    // Calculate attendance rate for current month
    let totalAttendanceRecords = 0;
    let presentRecords = 0;
    
    // Track attendance by slot
    const attendanceBySlot = {
      morning: { present: 0, absent: 0 },
      afternoon: { present: 0, absent: 0 },
      evening: { present: 0, absent: 0 },
    };
    
    if (attendanceData && attendanceData.length > 0) {
      totalAttendanceRecords = attendanceData.length * 3; // morning, afternoon, evening slots
      
      attendanceData.forEach((record: any) => {
        // Morning slot
        if (record.morning) {
          presentRecords++;
          attendanceBySlot.morning.present++;
        } else {
          attendanceBySlot.morning.absent++;
        }
        
        // Afternoon slot
        if (record.afternoon) {
          presentRecords++;
          attendanceBySlot.afternoon.present++;
        } else {
          attendanceBySlot.afternoon.absent++;
        }
        
        // Evening slot
        if (record.evening) {
          presentRecords++;
          attendanceBySlot.evening.present++;
        } else {
          attendanceBySlot.evening.absent++;
        }
      });
    }
    
    const attendanceRate = totalAttendanceRecords > 0 
      ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
      : 0;
    
    // Calculate average grade from recent marks
    const averageGrade = marksData && marksData.length > 0 
      ? Math.round(marksData.slice(0, 10).reduce((sum: number, mark: any) => sum + mark.marks, 0) / Math.min(marksData.length, 10)) 
      : 0;
    
    const stats: DashboardStats = {
      totalStudents,
      attendanceRate,
      averageGrade
    };
    
    // Process recent attendance data
    let recentAttendanceData: AttendanceRecord[] = [];
    
    if (attendanceData && attendanceData.length > 0) {
      // Join with students data to get names
      const { data: studentsWithDetails } = await supabase
        .from('students')
        .select('id, name, class_id');
      
      const studentMap = new Map();
      if (studentsWithDetails) {
        studentsWithDetails.forEach((student: any) => {
          studentMap.set(student.id, { name: student.name, class: student.class_id });
        });
      }
      
      // Transform attendance data (already sorted by date)
      recentAttendanceData = attendanceData.slice(0, 10).map((record: any) => {
        const student = studentMap.get(record.student_id);
        const presentCount = (record.morning ? 1 : 0) + (record.afternoon ? 1 : 0) + (record.evening ? 1 : 0);
        const totalCount = 3; // morning, afternoon, evening
        
        return {
          studentName: student?.name || 'Unknown',
          class: student?.class || 'Unknown',
          date: format(new Date(record.date), 'MMM dd, yyyy'),
          present: presentCount,
          absent: totalCount - presentCount,
          rate: Math.round((presentCount / totalCount) * 100)
        };
      });
    }
    
    // Process recent marks data
    let recentMarksData: MarkRecord[] = [];
    
    if (marksData && marksData.length > 0) {
      interface MarksBySubject {
        [key: string]: {
          subject: string;
          class: string;
          examType: string;
          total: number;
          count: number;
          status: "Completed" | "Pending";
        }
      }
      
      const marksBySubject: MarksBySubject = marksData.slice(0, 20).reduce((acc: MarksBySubject, mark: any) => {
        const key = `${mark.subject_id}-${mark.class_id}-${mark.exam_type}`;
        
        if (!acc[key]) {
          acc[key] = {
            subject: mark.subject_id,
            class: mark.class_id,
            examType: mark.exam_type,
            total: 0,
            count: 0,
            status: "Completed" as const
          };
        }
        
        acc[key].total += mark.marks;
        acc[key].count += 1;
        
        return acc;
      }, {});
      
      // Convert to array format for table
      recentMarksData = Object.values(marksBySubject).map(item => ({
        subject: item.subject,
        class: item.class,
        examType: item.examType,
        avgScore: `${Math.round(item.total / item.count)}/100`,
        status: item.status
      })).slice(0, 5);
    }
    
    return { 
      stats, 
      recentAttendanceData, 
      recentMarksData,
      attendanceBySlot
    };
    
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
