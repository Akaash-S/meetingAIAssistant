import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Wifi, 
  WifiOff,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { recordingService, RecordingState } from '@/lib/recordingService';
import { useAuth } from '@/contexts/AuthContext';

interface RecordingControlsProps {
  onMeetingCreated?: (meetingId: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export default function RecordingControls({ 
  onMeetingCreated, 
  onRecordingStateChange 
}: RecordingControlsProps) {
  const { user } = useAuth();
  const [state, setState] = useState<RecordingState>(recordingService.getState());
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Subscribe to recording state changes
    const unsubscribe = recordingService.subscribe((newState) => {
      setState(newState);
      
      // Notify parent component of recording state changes
      if (onRecordingStateChange) {
        onRecordingStateChange(newState.isRecording);
      }

      // Notify parent component when meeting is created
      if (newState.meetingId && onMeetingCreated) {
        onMeetingCreated(newState.meetingId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onMeetingCreated, onRecordingStateChange]);

  const handleStartRecording = async () => {
    if (!meetingTitle.trim()) {
      alert('Please enter a meeting title');
      return;
    }

    if (!user) {
      alert('Please log in to start recording');
      return;
    }

    setIsConnecting(true);
    try {
      await recordingService.startRecording(meetingTitle.trim());
    } catch (error) {
      console.error('Failed to start recording:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      await recordingService.stopRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await recordingService.connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusBadge = () => {
    if (state.error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (state.isRecording) {
      return <Badge variant="default" className="bg-red-500">Recording</Badge>;
    }
    if (state.isConnected) {
      return <Badge variant="secondary">Ready</Badge>;
    }
    return <Badge variant="outline">Disconnected</Badge>;
  };

  const getConnectionIcon = () => {
    if (state.isConnected) {
      return <Wifi className="w-4 h-4 text-green-500" />;
    }
    return <WifiOff className="w-4 h-4 text-gray-400" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Meeting Recorder
          </CardTitle>
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        {!state.isConnected && !state.error && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Not connected to recording service. 
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleConnect}
                disabled={isConnecting}
                className="p-0 h-auto ml-1"
              >
                Connect
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Meeting Title Input */}
        {!state.isRecording && (
          <div className="space-y-2">
            <label htmlFor="meeting-title" className="text-sm font-medium">
              Meeting Title
            </label>
            <input
              id="meeting-title"
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="Enter meeting title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={state.isRecording || isConnecting}
            />
          </div>
        )}

        {/* Recording Duration */}
        {state.isRecording && (
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-red-500">
              {recordingService.formatDuration(state.duration)}
            </div>
            <p className="text-sm text-muted-foreground">Recording in progress...</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!state.isRecording ? (
            <Button
              onClick={handleStartRecording}
              disabled={!state.isConnected || !meetingTitle.trim() || isConnecting}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mic className="w-4 h-4 mr-2" />
              )}
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={handleStopRecording}
              variant="destructive"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {/* Recording Info */}
        {state.meetingId && (
          <div className="text-xs text-muted-foreground">
            Meeting ID: {state.meetingId}
          </div>
        )}

        {/* Instructions */}
        {!state.isRecording && state.isConnected && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Make sure your microphone is working</p>
            <p>• Grant microphone permission when prompted</p>
            <p>• Recording will be processed automatically</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
