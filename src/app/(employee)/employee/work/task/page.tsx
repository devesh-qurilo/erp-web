"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Filter, ChevronLeft, ChevronRight, Pin, Calendar, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Employee = {
  employeeId: string;
  name: string;
  profileUrl: string;
  designation?: string | null;
  department?: string | null;
};

type Label = {
  id: number;
  name: string;
  colorCode: string;
};

type TaskStage = {
  id: number;
  name: string;
  labelColor?: string;
};

type Milestone = {
  id: number;
  title: string;
  milestoneCost: number;
  status: string;
};

type Task = {
  id: number;
  title: string;
  description: string;
  priority: string;
  projectId: number;
  startDate: string;
  dueDate: string;
  assignedEmployees: Employee[];
  labels: Label[];
  taskStage: TaskStage;
  milestone: Milestone;
  pinned: boolean;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("dueDate");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [availableStages, setAvailableStages] = useState<string[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/work/task/employee", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setTasks(data);

        const stages = Array.from(new Set(data.map((t: Task) => t.taskStage?.name).filter(Boolean)));
        setAvailableStages(stages as string[]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    let result = [...tasks];

    if (searchQuery) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.milestone?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (priorityFilter.length > 0) {
      result = result.filter((task) => priorityFilter.includes(task.priority));
    }

    if (stageFilter.length > 0) {
      result = result.filter((task) => stageFilter.includes(task.taskStage?.name));
    }

    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
                 (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredTasks(result);
    setCurrentPage(1);
  }, [tasks, searchQuery, priorityFilter, stageFilter, sortBy]);

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      default:
        return "outline";
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter([]);
    setStageFilter([]);
    setSortBy("dueDate");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive font-semibold mb-2">Error loading tasks</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your assigned tasks
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks by title, description, or milestone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Priority
                      {priorityFilter.length > 0 && (
                        <Badge variant="secondary" className="ml-1 px-1 min-w-5 h-5 flex items-center justify-center">
                          {priorityFilter.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {["HIGH", "MEDIUM", "LOW"].map((priority) => (
                      <DropdownMenuCheckboxItem
                        key={priority}
                        checked={priorityFilter.includes(priority)}
                        onCheckedChange={(checked) => {
                          setPriorityFilter(
                            checked
                              ? [...priorityFilter, priority]
                              : priorityFilter.filter((p) => p !== priority)
                          );
                        }}
                      >
                        {priority}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Stage
                      {stageFilter.length > 0 && (
                        <Badge variant="secondary" className="ml-1 px-1 min-w-5 h-5 flex items-center justify-center">
                          {stageFilter.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter by Stage</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableStages.map((stage) => (
                      <DropdownMenuCheckboxItem
                        key={stage}
                        checked={stageFilter.includes(stage)}
                        onCheckedChange={(checked) => {
                          setStageFilter(
                            checked
                              ? [...stageFilter, stage]
                              : stageFilter.filter((s) => s !== stage)
                          );
                        }}
                      >
                        {stage}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery || priorityFilter.length > 0 || stageFilter.length > 0) && (
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {paginatedTasks.length} of {filteredTasks.length} tasks
              </span>
            </div>
          </CardHeader>

          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tasks found matching your filters</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead className="font-semibold">Task</TableHead>
                        <TableHead className="font-semibold">Stage</TableHead>
                        <TableHead className="font-semibold">Priority</TableHead>
                        <TableHead className="font-semibold">Assigned</TableHead>
                        <TableHead className="font-semibold">Labels</TableHead>
                        <TableHead className="font-semibold">Due Date</TableHead>
                        <TableHead className="font-semibold">Milestone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTasks.map((task) => (
                        <TableRow
                          key={task.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            {task.pinned && (
                              <Pin className="h-4 w-4 text-primary fill-primary" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium leading-none">{task.title}</p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Project #{task.projectId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className="font-medium"
                              style={{
                                backgroundColor: task.taskStage?.labelColor
                                  ? `#${task.taskStage.labelColor}`
                                  : undefined,
                                color: task.taskStage?.labelColor ? '#fff' : undefined,
                              }}
                            >
                              {task.taskStage?.name || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityVariant(task.priority)}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {task.assignedEmployees?.slice(0, 3).map((emp) => (
                                <Avatar key={emp.employeeId} className="h-8 w-8 border-2 border-background">
                                  <AvatarImage src={emp.profileUrl} alt={emp.name} />
                                  <AvatarFallback className="text-xs">
                                    {emp.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {task.assignedEmployees?.length > 3 && (
                                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    +{task.assignedEmployees.length - 3}
                                  </span>
                                </div>
                              )}
                              {(!task.assignedEmployees || task.assignedEmployees.length === 0) && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap max-w-[200px]">
                              {task.labels?.slice(0, 3).map((label) => (
                                <Badge
                                  key={label.id}
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    backgroundColor: label.colorCode,
                                    borderColor: label.colorCode,
                                    color: '#fff'
                                  }}
                                >
                                  {label.name}
                                </Badge>
                              ))}
                              {task.labels?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{task.labels.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className={isOverdue(task.dueDate) ? "text-destructive font-medium" : ""}>
                                {new Date(task.dueDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            {isOverdue(task.dueDate) && (
                              <Badge variant="destructive" className="mt-1 text-xs">
                                Overdue
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {task.milestone?.title ? (
                              <div className="space-y-1">
                                <p className="font-medium text-sm">{task.milestone.title}</p>
                                <Badge variant="outline" className="text-xs">
                                  {task.milestone.status}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm italic">
                                No milestone
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
