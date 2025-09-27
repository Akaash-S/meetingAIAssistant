import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  RefreshCw,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedView, setSelectedView] = useState<'calendar' | 'notifications'>('calendar');

  const upcomingTasks = [
    {
      id: 1,
      title: "Research payment providers",
      dueDate: "2024-01-18",
      time: "09:00 AM",
      assignee: "John Smith",
      priority: "high",
      type: "task"
    },
    {
      id: 2,
      title: "Finalize marketing messaging",
      dueDate: "2024-01-20",
      time: "02:00 PM",
      assignee: "Lisa Chen",
      priority: "medium",
      type: "task"
    },
    {
      id: 3,
      title: "Product Strategy Follow-up",
      dueDate: "2024-01-22",
      time: "10:00 AM",
      assignee: "Team",
      priority: "high",
      type: "meeting"
    }
  ];

  const notifications = [
    {
      id: 1,
      title: "Task deadline approaching",
      message: "Payment provider research due in 2 days",
      time: "2 hours ago",
      type: "warning",
      unread: true
    },
    {
      id: 2,
      title: "New meeting scheduled",
      message: "Q1 Planning Review added to calendar",
      time: "4 hours ago",
      type: "info",
      unread: true
    },
    {
      id: 3,
      title: "Task completed",
      message: "Timeline documentation updated by Sarah",
      time: "1 day ago",
      type: "success",
      unread: false
    },
    {
      id: 4,
      title: "Meeting reminder",
      message: "Team sync starting in 30 minutes",
      time: "2 days ago",
      type: "info",
      unread: false
    }
  ];

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
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
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
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <Badge 
                            variant={task.type === 'meeting' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {task.type}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {task.dueDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {task.assignee}
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