import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { 
  RefreshCw,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  FileText,
  Target,
  Zap,
  TrendingUp,
  CalendarDays,
  MapPin,
  User,
  Tag,
  Link
} from 'lucide-react';

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedView, setSelectedView] = useState<'calendar' | 'notifications'>('calendar');
  const { user } = useAuth();

  // Fetch user tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => apiService.getUserTasks(user?.id || ''),
    enabled: !!user?.id,
  });

  // Fetch upcoming tasks
  const { data: upcomingTasksData } = useQuery({
    queryKey: ['upcoming-tasks', user?.id],
    queryFn: () => apiService.getUpcomingTasks(user?.id || ''),
    enabled: !!user?.id,
  });

  // Fetch overdue tasks
  const { data: overdueTasksData } = useQuery({
    queryKey: ['overdue-tasks', user?.id],
    queryFn: () => apiService.getOverdueTasks(user?.id || ''),
    enabled: !!user?.id,
  });

  const tasks = tasksData?.tasks || [];
  const upcomingTasks = upcomingTasksData?.tasks || [];
  const overdueTasks = overdueTasksData?.tasks || [];

  // Create enhanced notifications from tasks
  const notifications = [
    ...overdueTasks.map(task => ({
      id: `overdue-${task.id}`,
      title: "Task overdue",
      message: `${task.name} is overdue`,
      time: "Now",
      type: "warning" as const,
      unread: true,
      priority: task.priority,
      effort: task.effort,
      assignee: task.owner,
      tags: task.tags ? JSON.parse(task.tags) : [],
      dependencies: task.dependencies ? JSON.parse(task.dependencies) : [],
      context: task.context,
      meeting_id: task.meeting_id
    })),
    ...upcomingTasks.slice(0, 3).map(task => ({
      id: `upcoming-${task.id}`,
      title: "Task deadline approaching",
      message: `${task.name} due ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'soon'}`,
      time: "1 hour ago",
      type: "info" as const,
      unread: true,
      priority: task.priority,
      effort: task.effort,
      assignee: task.owner,
      tags: task.tags ? JSON.parse(task.tags) : [],
      dependencies: task.dependencies ? JSON.parse(task.dependencies) : [],
      context: task.context,
      meeting_id: task.meeting_id
    })),
    ...tasks.filter(t => t.status === 'completed').slice(0, 2).map(task => ({
      id: `completed-${task.id}`,
      title: "Task completed",
      message: `${task.name} has been completed`,
      time: "2 hours ago",
      type: "success" as const,
      unread: false,
      priority: task.priority,
      effort: task.effort,
      assignee: task.owner,
      tags: task.tags ? JSON.parse(task.tags) : [],
      dependencies: task.dependencies ? JSON.parse(task.dependencies) : [],
      context: task.context,
      meeting_id: task.meeting_id
    }))
  ];

  // Loading state
  if (tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Calendar & Notifications</h1>
            <p className="text-muted-foreground">Manage your schedule and stay updated</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant={selectedView === 'calendar' ? 'default' : 'outline'}
              onClick={() => setSelectedView('calendar')}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            <Button 
              variant={selectedView === 'notifications' ? 'default' : 'outline'}
              onClick={() => setSelectedView('notifications')}
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {notifications.filter(n => n.unread).length > 0 && (
                <Badge className="ml-2 bg-destructive text-destructive-foreground">
                  {notifications.filter(n => n.unread).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedView === 'calendar' ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Calendar Integration</CardTitle>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync with Google
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Calendar Widget Placeholder */}
                    <div className="bg-gradient-subtle rounded-lg p-8 text-center border-2 border-dashed border-primary/20">
                      <CalendarIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Google Calendar Integration</h3>
                      <p className="text-muted-foreground mb-4">
                        Connect your Google Calendar to see meetings and deadlines in one place
                      </p>
                      <Button className="gradient-primary">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Connect Google Calendar
                      </Button>
                    </div>

                    {/* Mini Calendar */}
                    <div className="flex justify-center">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border shadow-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            notification.unread 
                              ? 'bg-primary/5 border-primary/20' 
                              : 'bg-muted/20 border-border'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium ${notification.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {notification.time}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              
                              {/* Enhanced task information */}
                              <div className="space-y-2">
                                {/* Priority and Effort */}
                                <div className="flex gap-2">
                                  {notification.priority && (
                                    <Badge 
                                      variant={notification.priority === 'high' ? 'destructive' : 
                                              notification.priority === 'medium' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {notification.priority === 'high' && <Zap className="w-3 h-3 mr-1" />}
                                      {notification.priority === 'medium' && <Target className="w-3 h-3 mr-1" />}
                                      {notification.priority === 'low' && <TrendingUp className="w-3 h-3 mr-1" />}
                                      {notification.priority}
                                    </Badge>
                                  )}
                                  {notification.effort && (
                                    <Badge variant="outline" className="text-xs">
                                      {notification.effort}/5 effort
                                    </Badge>
                                  )}
                                </div>

                                {/* Assignee and Meeting */}
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  {notification.assignee && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {notification.assignee}
                                    </div>
                                  )}
                                  {notification.meeting_id && (
                                    <div className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      Meeting {notification.meeting_id.slice(0, 8)}...
                                    </div>
                                  )}
                                </div>

                                {/* Tags */}
                                {notification.tags && notification.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {notification.tags.slice(0, 3).map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        <Tag className="w-2 h-2 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                    {notification.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{notification.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Dependencies */}
                                {notification.dependencies && notification.dependencies.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Link className="w-3 h-3" />
                                    {notification.dependencies.length} dependencies
                                  </div>
                                )}

                                {/* Context */}
                                {notification.context && (
                                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                    <FileText className="w-3 h-3 inline mr-1" />
                                    {notification.context}
                                  </div>
                                )}
                              </div>

                              {notification.unread && (
                                <div className="flex gap-2 mt-3">
                                  <Button variant="outline" size="sm">
                                    Mark as Read
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    Dismiss
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="p-3 rounded-lg border bg-card hover:bg-card-hover transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{task.name}</h4>
                          <Badge 
                            variant={task.category === 'decision' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {task.category}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.status}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {task.owner || 'Unassigned'}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()} PRIORITY
                          </span>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gradient-primary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Calendar
                </Button>
                <Button variant="outline" className="w-full">
                  <Bell className="w-4 h-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Google Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}