"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Employee {
  employeeId: string;
  name: string;
  departmentName: string;
  designationName: string;
}

const Dashboard = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  const timelogData = { duration: "4hrs", break: "30 mins", progress: 50 };
  const tasks = [
    {
      id: "RTA-40",
      name: "Planning",
      status: "To do",
      dueDate: "02/08/2025",
      priority: "Medium",
    },
    {
      id: "RTA-41",
      name: "Testing",
      status: "Doing",
      dueDate: "02/08/2025",
      priority: "High",
    },
    {
      id: "RTA-42",
      name: "Code Review",
      status: "Incomplete",
      dueDate: "02/08/2025",
      priority: "Low",
    },
    {
      id: "RTA-43",
      name: "Documentation",
      status: "Incomplete",
      dueDate: "02/08/2025",
      priority: "Medium",
    },
  ];

  const counts = {
    projects: { pending: 8, overdue: 4 },
    tasks: { pending: 8, overdue: 4 },
    deals: { pending: 2, overdue: 0 },
    followUps: { pending: 0, overdue: 0 },
  };

  // ✅ Fetch Employee Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("No access token found");

        const response = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setEmployee(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Dynamic Real-Time Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const formattedDate = now.toLocaleDateString([], {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      setCurrentTime(`${formattedDate} • ${formattedTime}`);
    };

    updateClock(); // initial call
    const interval = setInterval(updateClock, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To do":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Doing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Incomplete":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px] text-destructive">
        {error}
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-[400px] text-muted-foreground">
        No profile data available
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl p-6">
      <div className="max-w-9xl mx-auto space-y-15">
        {/* ✅ Dynamic Header */}
        <div className="bg-red-400 from-primary to-secondary rounded-2xl p-8 text-primary-foreground shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-balance">
                Welcome back, {employee.name}
              </h1>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Clock className="h-4 w-4" />
                <p className="text-lg">Clock in: {currentTime}</p>
              </div>
            </div>
           
            <div className="bg-red-500 backdrop-blur-sm rounded-xl p-4 text-right border border-white/20">
             <link href={"/profile"} >
              <p className="text-xl font-semibold">{employee.name}</p>
              <p className="text-primary-foreground/80">
                {employee.designationName} · {employee.departmentName}
              </p>
              <p className="text-sm text-primary-foreground/60">
                Employee Code: {employee.employeeId}
              </p>
              </link>
            </div>
           
          </div>
          
        </div>

        {/* ✅ Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Projects", icon: Target, data: counts.projects },
            { title: "Tasks", icon: TrendingUp, data: counts.tasks },
            { title: "Deals", icon: Users, data: counts.deals },
            { title: "Follow Ups", icon: AlertCircle, data: counts.followUps },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <item.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {item.data.pending}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.data.overdue > 0 ? (
                    <span className="text-destructive font-medium">
                      {item.data.overdue} overdue
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">All clear</span>
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ✅ Timelog + Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timelog */}
          <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="h-5 w-5 text-primary" />
                My Timelogs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-4 text-sm font-medium">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day, index) => (
                  <div
                    key={day}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 2
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Today's Progress</span>
                  <span className="font-medium">{timelogData.progress}%</span>
                </div>
                <Progress value={timelogData.progress} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {timelogData.duration}
                  </p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">
                    {timelogData.break}
                  </p>
                  <p className="text-xs text-muted-foreground">Break</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-5 w-5 text-primary" />
                My Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-1 h-12 rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {task.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {task.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Due: {task.dueDate}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(task.status)} border`}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
