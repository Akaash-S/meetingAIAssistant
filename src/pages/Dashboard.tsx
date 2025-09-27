import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Clock,
  Filter
} from 'lucide-react';

export default function Dashboard() {
  const [selectedMeeting, setSelectedMeeting] = useState(0);

  const meetings = [
    {
      id: 1,
      title: "Product Strategy Review",
      date: "2024-01-15",
      duration: "45 min",
      participants: 8,
      status: "completed"
    },
    {
      id: 2,
      title: "Weekly Team Sync",
      date: "2024-01-14",
      duration: "30 min",
      participants: 5,
      status: "processing"
    }
  ];

  const transcript = [
    "Welcome everyone to our product strategy review. Today we'll be discussing Q1 priorities and resource allocation.",
    "Let's start with the mobile app development timeline. Sarah, can you walk us through the current status?",
    "We're on track for the March release. However, we need to decide on the payment integration by next Friday.",
    "That's a critical decision point. Let's assign John to research payment providers and present options by Thursday.",
    "Moving on to the marketing campaign, we need to finalize the messaging strategy..."
  ];

  const actionItems = [
    {
      id: 1,
      text: "Research payment integration providers",
      assignee: "John Smith",
      deadline: "Jan 18, 2024",
      priority: "high",
      status: "pending"
    },
    {
      id: 2,
      text: "Finalize Q1 marketing messaging",
      assignee: "Lisa Chen", 
      deadline: "Jan 20, 2024",
      priority: "medium",
      status: "in-progress"
    }
  ];

  const decisions = [
    {
      id: 1,
      text: "March release date confirmed for mobile app",
      timestamp: "14:23",
      impact: "high"
    },
    {
      id: 2,
      text: "Allocate 2 additional developers to mobile team",
      timestamp: "14:45",
      impact: "medium"
    }
  ];

  const unresolvedQuestions = [
    {
      id: 1,
      text: "Which payment provider should we integrate?",
      context: "Mentioned during mobile app discussion",
      urgency: "high"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Meeting Dashboard</h1>
            <p className="text-muted-foreground">AI-powered insights from your meetings</p>
          </div>
          <Button className="gradient-primary">
            <FileText className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
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
                          {meeting.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meeting.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {meeting.participants} participants
                        </div>
                      </div>
                      <Badge 
                        variant={meeting.status === 'completed' ? 'default' : 'secondary'}
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
                        <p className="text-sm font-medium">{decision.text}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">{decision.timestamp}</span>
                          <Badge variant="outline" className="text-xs">
                            {decision.impact} impact
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
                        <p className="text-sm font-medium">{item.text}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {item.assignee} • {item.deadline}
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