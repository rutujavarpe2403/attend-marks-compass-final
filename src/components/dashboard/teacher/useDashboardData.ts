import { useState } from "react";
import { fetchDashboardData } from "./DashboardData";
import { TeacherDashboardData } from "./types";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useDashboardData = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      try {
        setError(null);
        return await fetchDashboardData();
      } catch (error: any) {
        console.error("Error loading dashboard data:", error);
        setError(error.message || "Failed to load dashboard data");
        toast.error("Failed to load dashboard data");
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const refreshData = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      return true;
    } catch (error: any) {
      console.error("Error refreshing dashboard data:", error);
      toast.error("Failed to refresh dashboard data");
      return false;
    }
  };

  return {
    isLoading,
    error,
    stats: dashboardData?.stats || {
      totalStudents: 0,
      attendanceRate: 0,
      averageGrade: 0,
    },
    recentAttendanceData: dashboardData?.recentAttendanceData || [],
    recentMarksData: dashboardData?.recentMarksData || [],
    attendanceBySlot: dashboardData?.attendanceBySlot || {
      morning: { present: 0, absent: 0 },
      afternoon: { present: 0, absent: 0 },
      evening: { present: 0, absent: 0 },
    },
    refreshData
  };
};
