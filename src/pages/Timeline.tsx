import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Loader2
} from 'lucide-react';

export default function Timeline() {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();

  // Fetch user meetings
  const { data: meetingsData, isLoading: meetingsLoading } = useQuery({
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

  // Create timeline blocks from tasks and meetings
  const timelineBlocks = tasks.map((task, index) => ({
    id: task.id,
    timeRange: `${index * 5}:00 - ${(index + 1) * 5}:00`,
    type: task.category === 'decision' ? 'decision' : 
          task.category === 'action-item' ? 'action' : 
          task.category === 'unresolved' ? 'unresolved' : 'discussion',
    title: task.name,
    summary: task.description || 'No description available',
    tags: [task.category],
    transcript: task.description || 'No transcript available',
    task: task
  }));

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
            <p className="text-muted-foreground">Navigate through your meeting minute by minute</p>
          </div>
          
          {/* Audio Controls */}
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <SkipForward className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">12:30 / 45:00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline Blocks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Strategy Review - January 15, 2024</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {timelineBlocks.map((block) => (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlock(block.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all timeline-block ${getBlockStyle(block.type)} ${
                          selectedBlock === block.id ? 'ring-2 ring-primary shadow-glow' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getTypeIcon(block.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{block.title}</h3>
                              <span className="text-sm text-muted-foreground font-mono">
                                {block.timeRange}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {block.summary}
                            </p>
                            {block.tags.length > 0 && (
                              <div className="flex gap-2">
                                {block.tags.map((tag, index) => (
                                  <Badge 
                                    key={index} 
                                    className={`text-xs ${getTagStyle(tag)}`}
                                  >
                                    {tag.replace('-', ' ')}
                                  </Badge>
                                ))}
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
          </div>

          {/* Transcript Detail */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Transcript Detail</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBlock ? (
                  <div className="space-y-4">
                    {(() => {
                      const block = timelineBlocks.find(b => b.id === selectedBlock);
                      return block ? (
                        <>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(block.type)}
                            <span className="font-semibold">{block.timeRange}</span>
                          </div>
                          <h3 className="font-semibold text-lg">{block.title}</h3>
                          <ScrollArea className="h-64">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {block.transcript}
                            </p>
                          </ScrollArea>
                          {block.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {block.tags.map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  className={`text-xs ${getTagStyle(tag)}`}
                                >
                                  {tag.replace('-', ' ')}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Button className="w-full gradient-primary" size="sm">
                            Jump to Audio
                          </Button>
                        </>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a timeline block to view detailed transcript
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Decisions</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span>Action Items</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-destructive" />
                <span>Unresolved Questions</span>
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