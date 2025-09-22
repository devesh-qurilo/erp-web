"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Calendar, TrendingUp, Users, Target, AlertCircle } from "lucide-react"

const Dashboard = () => {
  const timelogData = { duration: "4hrs", break: "30 mins", progress: 50 }
  const tasks = [
    { id: "RTA-40", name: "Planning", status: "To do", dueDate: "02/08/2025", priority: "Medium" },
    { id: "RTA-41", name: "Testing", status: "Doing", dueDate: "02/08/2025", priority: "High" },
    { id: "RTA-42", name: "Code Review", status: "Incomplete", dueDate: "02/08/2025", priority: "Low" },
    { id: "RTA-43", name: "Documentation", status: "Incomplete", dueDate: "02/08/2025", priority: "Medium" },
  ]
  const counts = {
    projects: { pending: 8, overdue: 4 },
    tasks: { pending: 8, overdue: 4 },
    deals: { pending: 2, overdue: 0 },
    followUps: { pending: 0, overdue: 0 },
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To do":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Doing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Incomplete":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500"
      case "Medium":
        return "bg-yellow-500"
      case "Low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="max-w-screen-xl bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-9xl mx-auto space-y-15">
        <div className="bg-red-400 from-primary to-secondary rounded-2xl p-8 text-primary-foreground shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-balance">Welcome back, Ritik Singh</h1>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Clock className="h-4 w-4" />
                <p className="text-lg">Clock in: 10:00 AM</p>
              </div>
            </div>
            <div className="bg-red-500 backdrop-blur-sm rounded-xl p-4 text-right border border-white/20">
              <p className="text-xl font-semibold">Ritik Singh</p>
              <p className="text-primary-foreground/80">Manager · Human Resources</p>
              <p className="text-sm text-primary-foreground/60">Employee Code: EMP-01</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{counts.projects.pending}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-destructive font-medium">{counts.projects.overdue} overdue</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{counts.tasks.pending}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-destructive font-medium">{counts.tasks.overdue} overdue</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Deals</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{counts.deals.pending}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-medium">No overdue</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Follow Ups</CardTitle>
              <AlertCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{counts.followUps.pending}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-medium">All clear</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      index === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
                  <p className="text-2xl font-bold text-primary">{timelogData.duration}</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">{timelogData.break}</p>
                  <p className="text-xs text-muted-foreground">Break</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                      <div className={`w-1 h-12 rounded-full ${getPriorityColor(task.priority)}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{task.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {task.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Due: {task.dueDate}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(task.status)} border`}>{task.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
