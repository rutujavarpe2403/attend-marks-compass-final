import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { StatsSection } from "./teacher/StatsSection";
import { AttendanceTimeSlotCard } from "./teacher/AttendanceTimeSlotCard";
import { RecentAttendanceCard } from "./teacher/RecentAttendanceCard";
import { DashboardTabs } from "./teacher/DashboardTabs";
import { useDashboardData } from "./teacher/useDashboardData";
import { toast } from "sonner";

export const TeacherDashboard = () => {
  const { isLoading, error, stats, recentAttendanceData, recentMarksData, attendanceBySlot, refreshData } = useDashboardData();

  // Refresh dashboard data when component mounts
  useEffect(() => {
    refreshData().catch((error) => {
      console.error("Failed to refresh dashboard:", error);
      toast.error("Failed to load dashboard data");
    });
  }, [refreshData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-lg text-red-600">{error}</p>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <StatsSection stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AttendanceTimeSlotCard attendanceBySlot={attendanceBySlot} />
        <RecentAttendanceCard recentAttendanceData={recentAttendanceData} />
      </div>

      <DashboardTabs 
        recentAttendanceData={recentAttendanceData} 
        recentMarksData={recentMarksData} 
      />
    </div>
  );
};
