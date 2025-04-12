
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { MarksRecord } from "./TeacherMarksView";

interface StudentMarksChartProps {
  marks: MarksRecord[];
}

export const StudentMarksChart = ({ marks }: StudentMarksChartProps) => {
  // Process data for bar chart - by subject
  const subjectData = marks.reduce((acc, mark) => {
    const existingSubject = acc.find(item => item.subject === mark.subject_id);
    
    if (existingSubject) {
      existingSubject.marks = (existingSubject.marks * existingSubject.count + mark.marks) / (existingSubject.count + 1);
      existingSubject.count += 1;
    } else {
      acc.push({
        subject: mark.subject_id,
        marks: mark.marks,
        count: 1
      });
    }
    
    return acc;
  }, [] as { subject: string; marks: number; count: number }[]);
  
  // Process data for pie chart - by exam type
  const examTypeData = marks.reduce((acc, mark) => {
    const existingType = acc.find(item => item.name === mark.exam_type);
    
    if (existingType) {
      existingType.value += 1;
    } else {
      acc.push({
        name: mark.exam_type,
        value: 1
      });
    }
    
    return acc;
  }, [] as { name: string; value: number }[]);
  
  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="bar" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="bar" className="flex-1">Bar Chart</TabsTrigger>
          <TabsTrigger value="pie" className="flex-1">Pie Chart</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bar">
          <Card>
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subjectData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="marks" name="Average Marks" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pie">
          <Card>
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={examTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {examTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
