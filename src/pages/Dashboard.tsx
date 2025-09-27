import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import RecordingControls from '@/components/RecordingControls';
import { FileUpload } from '@/components/FileUpload';
import { 
  FileText, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Clock,
  Filter,
  Loader2,
  Mic,
  MicOff,
  Upload
} from 'lucide-react';

export default function Dashboard() {
  const [selectedMeeting, setSelectedMeeting] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { user } = useAuth();

  // Fetch user meetings
  const { data: meetingsData, isLoading: meetingsLoading } = useQuery({
    queryKey: ['meetings', user?.id],
    queryFn: () => apiService.getUserMeetings(user?.id || ''),
    enabled: !!user?.id,
  });

  // Fetch user tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => apiService.getUserTasks(user?.id || ''),
    enabled: !!user?.id,
  });

  // Get overdue tasks
  const { data: overdueTasksData } = useQuery({
    queryKey: ['overdue-tasks', user?.id],
    queryFn: () => apiService.getOverdueTasks(user?.id || ''),
    enabled: !!user?.id,
  });

  // Get upcoming tasks
  const { data: upcomingTasksData } = useQuery({
    queryKey: ['upcoming-tasks', user?.id],
    queryFn: () => apiService.getUpcomingTasks(user?.id || ''),
    enabled: !!user?.id,
  });

  const meetings = meetingsData?.meetings || [];
  const tasks = tasksData?.tasks || [];
  const overdueTasks = overdueTasksData?.tasks || [];
  const upcomingTasks = upcomingTasksData?.tasks || [];

  // Upload handlers
  const handleUploadSuccess = (meetingId: string) => {
    console.log('Upload successful:', meetingId);
    setShowUploadDialog(false);
    // Refresh meetings data
    window.location.reload(); // Simple refresh for now
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Error is handled by FileUpload component
  };

  // Get current meeting data
  const currentMeeting = meetings[selectedMeeting];

  // Handle recording state changes
  const handleRecordingStateChange = (recording: boolean) => {
    setIsRecording(recording);
  };

  // Handle new meeting created
  const handleMeetingCreated = (meetingId: string) => {
    setCurrentMeetingId(meetingId);
    // Refresh meetings data
    // The query will automatically refetch due to React Query's cache invalidation
  };

  // Refresh data when recording stops
  useEffect(() => {
    if (!isRecording && currentMeetingId) {
      // Refetch meetings and tasks data
      // React Query will handle this automatically
    }
  }, [isRecording, currentMeetingId]);
  
  // Get meeting transcript (if available)
  const transcript = currentMeeting?.transcript ? 
    currentMeeting.transcript.split('\n').filter(line => line.trim()) : 
    [];

  // Categorize tasks
  const actionItems = tasks.filter(task => task.category === 'action-item');
  const decisions = tasks.filter(task => task.category === 'decision');
  const unresolvedQuestions = tasks.filter(task => task.category === 'unresolved');

  // Loading state
  if (meetingsLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Meeting Dashboard</h1>
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  <Mic className="w-3 h-3 mr-1" />
                  Recording
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">AI-powered insights from your meetings</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Meeting Recording</DialogTitle>
                </DialogHeader>
                <FileUpload 
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Recent Meetings */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Meetings</CardTitle>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {meetings.map((meeting, index) => (
                    <div
                      key={meeting.id}
                      onClick={() => setSelectedMeeting(index)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedMeeting === index 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <h4 className="font-medium text-sm mb-1">{meeting.title}</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(meeting.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meeting.duration ? `${Math.floor(meeting.duration / 60)} min` : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {meeting.participants || 0} participants
                        </div>
                      </div>
                      <Badge 
                        variant={meeting.status === 'processed' ? 'default' : 'secondary'}
                        className="mt-2 text-xs"
                      >
                        {meeting.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Recording Controls */}
            <RecordingControls 
              onRecordingStateChange={handleRecordingStateChange}
              onMeetingCreated={handleMeetingCreated}
            />

            {/* Action Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="status-decision">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-success" />
                    <div>
                      <h3 className="font-semibold text-success">Decisions</h3>
                      <p className="text-2xl font-bold text-success">{decisions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="status-action">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-warning" />
                    <div>
                      <h3 className="font-semibold text-warning">Action Items</h3>
                      <p className="text-2xl font-bold text-warning">{actionItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="status-unresolved">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-8 h-8 text-destructive" />
                    <div>
                      <h3 className="font-semibold text-destructive">Unresolved</h3>
                      <p className="text-2xl font-bold text-destructive">{unresolvedQuestions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transcript */}
            <Card>
              <CardHeader>
                <CardTitle>Meeting Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {transcript.map((line, index) => (
                      <p key={index} className="text-sm leading-relaxed">
                        <span className="text-muted-foreground mr-2">
                          {String(index + 1).padStart(2, '0')}:
                        </span>
                        {line}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Action Items & Decisions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-success">Recent Decisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {decisions.map((decision) => (
                      <div key={decision.id} className="p-3 bg-success-light rounded-lg">
                        <p className="text-sm font-medium">{decision.name}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(decision.created_at).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {decision.priority} priority
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-warning">Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {actionItems.map((item) => (
                      <div key={item.id} className="p-3 bg-warning-light rounded-lg">
                        <p className="text-sm font-medium">{item.name}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {item.owner || 'Unassigned'} • {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline'}
                          </span>
                          <Badge 
                            variant={item.status === 'pending' ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}