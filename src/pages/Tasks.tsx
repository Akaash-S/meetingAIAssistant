import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  Tag,
  Link,
  FileText,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => apiService.getUserTasks(user?.id || ''),
    enabled: !!user?.id,
  });

  // Fetch overdue tasks
  const { data: overdueTasksData } = useQuery({
    queryKey: ['overdue-tasks', user?.id],
    queryFn: () => apiService.getOverdueTasks(user?.id || ''),
    enabled: !!user?.id,
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiService.completeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks', user?.id] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks', user?.id] });
    },
  });

  const tasks = tasksData?.tasks || [];
  const overdueTasks = overdueTasksData?.tasks || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-destructive text-destructive-foreground">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          High
        </Badge>;
      case 'medium':
        return <Badge variant="default" className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          Medium
        </Badge>;
      case 'low':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Low
        </Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getEffortBadge = (effort: number) => {
    const effortLevel = effort <= 2 ? 'low' : effort <= 4 ? 'medium' : 'high';
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[effortLevel]}>
        {effort}/5 effort
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.owner && task.owner.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: overdueTasks.length
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  // Loading state
  if (tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">Track and manage action items from your meetings</p>
          </div>
          <Button className="gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{taskStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </CardContent>
          </Card>
          <Card className="status-decision">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{taskStats.completed}</div>
              <div className="text-sm text-success">Completed</div>
            </CardContent>
          </Card>
          <Card className="status-action">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{taskStats.inProgress}</div>
              <div className="text-sm text-warning">In Progress</div>
            </CardContent>
          </Card>
          <Card className="status-unresolved">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{taskStats.pending}</div>
              <div className="text-sm text-destructive">Pending</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-destructive/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{taskStats.overdue}</div>
              <div className="text-sm text-destructive">Overdue</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search tasks or owners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>

                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tasks from Processed Meetings ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Task Details</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Priority & Effort</TableHead>
                  <TableHead>Tags & Context</TableHead>
                  <TableHead>Meeting</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/50">
                    <TableCell>
                      {getStatusIcon(task.status)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-semibold">{task.name}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(task.created_at).toLocaleDateString()}
                        </div>
                        {task.context && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-1 rounded">
                            <FileText className="w-3 h-3 inline mr-1" />
                            {task.context}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span>{task.owner || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className={
                          task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed'
                            ? 'text-destructive font-medium'
                            : ''
                        }>
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getPriorityBadge(task.priority)}
                        {task.effort && (
                          <div className="mt-1">
                            {getEffortBadge(task.effort)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {task.tags && JSON.parse(task.tags).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {JSON.parse(task.tags).slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Tag className="w-2 h-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {JSON.parse(task.tags).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{JSON.parse(task.tags).length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        {task.dependencies && JSON.parse(task.dependencies).length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Link className="w-3 h-3" />
                            {JSON.parse(task.dependencies).length} deps
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {task.meeting_id ? `Meeting ${task.meeting_id.slice(0, 8)}...` : 'No meeting'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {task.status !== 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-success hover:text-success"
                            onClick={() => handleCompleteTask(task.id)}
                            disabled={completeTaskMutation.isPending}
                          >
                            {completeTaskMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deleteTaskMutation.isPending}
                        >
                          {deleteTaskMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}