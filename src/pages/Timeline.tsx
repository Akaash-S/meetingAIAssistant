import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Clock,
  Loader2,
  Users,
  Calendar,
  FileText,
  Mic,
  MicOff,
  Download,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function Timeline() {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();

  // Fetch user meetings
  const { data: meetingsData, isLoading: meetingsLoading, refetch: refetchMeetings } = useQuery({
    queryKey: ['meetings', user?.id],
    queryFn: () => apiService.getUserMeetings(user?.id || ''),
    enabled: !!user?.id,
  });

  // Fetch user tasks for timeline
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => apiService.getUserTasks(user?.id || ''),
    enabled: !!user?.id,
  });

  const meetings = meetingsData?.meetings || [];
  const tasks = tasksData?.tasks || [];

  // Get processed meetings with timeline data
  const processedMeetings = meetings.filter(meeting => 
    meeting.status === 'processed' && meeting.timeline
  );

  // Get meetings that are being transcribed or have transcription errors
  const transcriptionMeetings = meetings.filter(meeting => 
    meeting.status === 'uploaded' || 
    meeting.status === 'transcribing' || 
    meeting.status === 'transcribed' || 
    meeting.status === 'transcription_error'
  );

  // Get selected meeting data
  const selectedMeetingData = processedMeetings.find(meeting => meeting.id === selectedMeeting);

  // Parse timeline data from selected meeting
  const timelineData = selectedMeetingData?.timeline ? 
    (typeof selectedMeetingData.timeline === 'string' ? 
      JSON.parse(selectedMeetingData.timeline) : 
      selectedMeetingData.timeline) : null;

  // Create timeline blocks from processed meeting data
  const timelineBlocks = timelineData?.timeline || [];

  // Get meeting summary data
  const meetingSummary = timelineData ? {
    overallSummary: timelineData.overall_summary || 'No summary available',
    keyDecisions: timelineData.key_decisions || [],
    actionItems: timelineData.action_items || [],
    participants: timelineData.participants || [],
    meetingType: timelineData.meeting_type || 'General Meeting',
    nextSteps: timelineData.next_steps || [],
    blockers: timelineData.blockers || [],
    successMetrics: timelineData.success_metrics || []
  } : null;

  // Loading state
  if (meetingsLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    );
  }

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'decision':
        return 'bg-success text-success-foreground';
      case 'action-item':
        return 'bg-warning text-warning-foreground';
      case 'unresolved':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getBlockStyle = (type: string) => {
    switch (type) {
      case 'decision':
        return 'border-l-4 border-success bg-success-light hover:bg-success-light/80';
      case 'action':
        return 'border-l-4 border-warning bg-warning-light hover:bg-warning-light/80';
      case 'unresolved':
        return 'border-l-4 border-destructive bg-destructive-light hover:bg-destructive-light/80';
      default:
        return 'border-l-4 border-muted bg-card hover:bg-card-hover';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'decision':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'action':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'unresolved':
        return <HelpCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Meeting Timeline</h1>
            <p className="text-muted-foreground">Navigate through your processed meetings minute by minute</p>
          </div>
          
          <div className="flex gap-3">
            {/* Meeting Selector */}
            <Select value={selectedMeeting} onValueChange={setSelectedMeeting}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a processed meeting..." />
              </SelectTrigger>
              <SelectContent>
                {processedMeetings.map((meeting) => (
                  <SelectItem key={meeting.id} value={meeting.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{meeting.title}</span>
                      <Badge variant="outline" className="ml-2">
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => refetchMeetings()}
              disabled={meetingsLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${meetingsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Meeting Summary */}
        {selectedMeetingData && meetingSummary && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {selectedMeetingData.title}
                <Badge variant="outline" className="ml-auto">
                  {meetingSummary.meetingType}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">{meetingSummary.overallSummary}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Participants</h4>
                  <div className="flex flex-wrap gap-1">
                    {meetingSummary.participants.map((participant, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {participant}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Decisions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {meetingSummary.keyDecisions.slice(0, 3).map((decision, index) => (
                      <li key={index}>• {decision}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Action Items</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {meetingSummary.actionItems.slice(0, 3).map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMeetingData ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Timeline Blocks */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Minute-by-Minute Timeline
                    <Badge variant="outline" className="ml-auto">
                      {timelineBlocks.length} minutes
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {timelineBlocks.length > 0 ? (
                        timelineBlocks.map((block, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedBlock(index)}
                            className={`p-4 rounded-lg cursor-pointer transition-all timeline-block border-l-4 ${
                              selectedBlock === index ? 'ring-2 ring-primary shadow-glow' : ''
                            } ${
                              block.decisions && block.decisions.length > 0 ? 'border-success bg-success-light hover:bg-success-light/80' :
                              block.action_items && block.action_items.length > 0 ? 'border-warning bg-warning-light hover:bg-warning-light/80' :
                              'border-muted bg-card hover:bg-card-hover'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {block.decisions && block.decisions.length > 0 ? (
                                  <CheckCircle className="w-5 h-5 text-success" />
                                ) : block.action_items && block.action_items.length > 0 ? (
                                  <AlertCircle className="w-5 h-5 text-warning" />
                                ) : (
                                  <Clock className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold">Minute {block.minute}</h3>
                                  <span className="text-sm text-muted-foreground font-mono">
                                    {block.minute}:00 - {block.minute + 1}:00
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {block.summary}
                                </p>
                                
                                {/* Key Points */}
                                {block.key_points && block.key_points.length > 0 && (
                                  <div className="mb-3">
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">Key Points:</h4>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                      {block.key_points.map((point, pointIndex) => (
                                        <li key={pointIndex}>• {point}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Decisions */}
                                {block.decisions && block.decisions.length > 0 && (
                                  <div className="mb-3">
                                    <h4 className="text-xs font-semibold text-success mb-1">Decisions:</h4>
                                    <ul className="text-xs text-success space-y-1">
                                      {block.decisions.map((decision, decisionIndex) => (
                                        <li key={decisionIndex}>• {decision}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Action Items */}
                                {block.action_items && block.action_items.length > 0 && (
                                  <div className="mb-3">
                                    <h4 className="text-xs font-semibold text-warning mb-1">Action Items:</h4>
                                    <ul className="text-xs text-warning space-y-1">
                                      {block.action_items.map((item, itemIndex) => (
                                        <li key={itemIndex}>• {item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Speakers */}
                                {block.speakers && block.speakers.length > 0 && (
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      <Users className="w-3 h-3 mr-1" />
                                      {block.speakers.join(', ')}
                                    </Badge>
                                  </div>
                                )}

                                {/* Topics */}
                                {block.topics && block.topics.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {block.topics.map((topic, topicIndex) => (
                                      <Badge key={topicIndex} variant="secondary" className="text-xs">
                                        {topic}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No timeline data available for this meeting</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Transcript Detail */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Timeline Detail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedBlock !== null && timelineBlocks[selectedBlock] ? (
                    <div className="space-y-4">
                      {(() => {
                        const block = timelineBlocks[selectedBlock];
                        return (
                          <>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Minute {block.minute}</span>
                            </div>
                            <h3 className="font-semibold text-lg">{block.summary}</h3>
                            
                            {/* Key Points */}
                            {block.key_points && block.key_points.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Key Points:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {block.key_points.map((point, index) => (
                                    <li key={index}>• {point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Decisions */}
                            {block.decisions && block.decisions.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 text-success">Decisions:</h4>
                                <ul className="text-sm text-success space-y-1">
                                  {block.decisions.map((decision, index) => (
                                    <li key={index}>• {decision}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Action Items */}
                            {block.action_items && block.action_items.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 text-warning">Action Items:</h4>
                                <ul className="text-sm text-warning space-y-1">
                                  {block.action_items.map((item, index) => (
                                    <li key={index}>• {item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Speakers */}
                            {block.speakers && block.speakers.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Speakers:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {block.speakers.map((speaker, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {speaker}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Topics */}
                            {block.topics && block.topics.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Topics:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {block.topics.map((topic, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Button className="w-full gradient-primary" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download Transcript
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a timeline block to view detailed information
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Meeting Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a processed meeting from the dropdown above to view its timeline
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Processed meetings will show:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Minute-by-minute breakdown</li>
                  <li>• Key decisions and action items</li>
                  <li>• Speaker identification</li>
                  <li>• Topic tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transcription Status Section */}
        {transcriptionMeetings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Transcription in Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transcriptionMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{meeting.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          meeting.status === 'transcribing' ? 'text-yellow-600 border-yellow-200 animate-pulse' :
                          meeting.status === 'transcribed' ? 'text-green-600 border-green-200' :
                          meeting.status === 'transcription_error' ? 'text-red-600 border-red-200' :
                          'text-blue-600 border-blue-200'
                        }`}
                      >
                        {meeting.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meeting.duration ? `${Math.round(meeting.duration / 60)} min` : 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {meeting.status === 'transcribing' && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Transcribing with Gemini AI...
                        </div>
                      </div>
                    )}
                    {meeting.status === 'transcription_error' && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          Transcription failed. Please retry.
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Decisions Made</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span>Action Items</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Speaker Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>General Discussion</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}