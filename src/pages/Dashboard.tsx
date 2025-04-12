import { useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { profile, isLoading: authLoading } = useAuth();
  const isTeacher = profile?.role === "teacher";

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-600">Please log in to view the dashboard</p>
      </div>
    );
  }

  return isTeacher ? <TeacherDashboard /> : <StudentDashboard />;
};

export default Dashboard;
