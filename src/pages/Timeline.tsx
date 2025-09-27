import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function Timeline() {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const timelineBlocks = [
    {
      id: 1,
      timeRange: "00:00 - 02:00",
      type: "discussion",
      title: "Meeting Introduction & Agenda Review",
      summary: "Welcome and overview of today's product strategy discussion",
      tags: [],
      transcript: "Welcome everyone to our product strategy review. Today we'll be discussing Q1 priorities, resource allocation, and timeline adjustments. Let's start by reviewing our agenda items..."
    },
    {
      id: 2,
      timeRange: "02:00 - 05:30",
      type: "decision",
      title: "Mobile App Release Timeline",
      summary: "Confirmed March release date for mobile application",
      tags: ["decision"],
      transcript: "After reviewing the development progress, we're confirming the March 15th release date for the mobile app. Sarah has confirmed the team can deliver all core features by this deadline."
    },
    {
      id: 3,
      timeRange: "05:30 - 08:15",
      type: "action",
      title: "Payment Integration Research",
      summary: "Action item assigned to research payment providers",
      tags: ["action-item"],
      transcript: "John, we need you to research payment integration providers and present your findings by next Thursday. Focus on Stripe, PayPal, and Square integration capabilities."
    },
    {
      id: 4,
      timeRange: "08:15 - 12:00",
      type: "discussion",
      title: "Marketing Strategy Discussion",
      summary: "Overview of Q1 marketing campaigns and messaging",
      tags: [],
      transcript: "Moving on to our marketing strategy. Lisa, can you walk us through the proposed Q1 campaigns? We need to align our messaging with the product roadmap..."
    },
    {
      id: 5,
      timeRange: "12:00 - 15:30",
      type: "unresolved",
      title: "Budget Allocation Questions",
      summary: "Discussion about resource allocation raised unresolved questions",
      tags: ["unresolved"],
      transcript: "We discussed increasing the development team size, but the exact budget implications weren't fully resolved. This needs follow-up with finance before we can proceed."
    },
    {
      id: 6,
      timeRange: "15:30 - 18:00",
      type: "decision",
      title: "Team Expansion Approval",
      summary: "Approved hiring 2 additional developers",
      tags: ["decision"],
      transcript: "Based on our workload analysis, we're approving the hire of 2 additional senior developers for the mobile team. HR will begin the recruitment process immediately."
    }
  ];

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