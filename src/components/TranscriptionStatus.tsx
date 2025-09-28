import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/lib/api';
import { 
  Mic,
  MicOff,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  RefreshCw,
  Clock,
  Zap
} from 'lucide-react';

interface TranscriptionStatusProps {
  meetingId: string;
  meetingTitle: string;
  status: string;
  onStatusChange?: (status: string) => void;
}

export function TranscriptionStatus({ 
  meetingId, 
  meetingTitle, 
  status, 
  onStatusChange 
}: TranscriptionStatusProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const queryClient = useQueryClient();

  // Auto-transcribe mutation
  const autoTranscribeMutation = useMutation({
    mutationFn: (meetingId: string) => apiService.autoTranscribeMeeting(meetingId),
    onSuccess: () => {
      setIsTranscribing(true);
      onStatusChange?.('transcribing');
      // Refetch meetings data
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error) => {
      console.error('Auto-transcription failed:', error);
      setIsTranscribing(false);
    },
  });

  // Status check query - Use perfect transcription status
  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['transcription-status', meetingId],
    queryFn: () => apiService.getTranscriptionStatus(meetingId),
    enabled: !!meetingId && (status === 'uploaded' || status === 'transcribing'),
    refetchInterval: status === 'transcribing' ? 2000 : false, // Poll every 2 seconds when transcribing
  });

  // Update status when statusData changes
  useEffect(() => {
    if (statusData?.status && statusData.status !== status) {
      onStatusChange?.(statusData.status);
      if (statusData.status === 'transcribed' || statusData.status === 'transcription_error') {
        setIsTranscribing(false);
      }
    }
  }, [statusData, status, onStatusChange]);

  // Auto-start transcription for uploaded meetings
  useEffect(() => {
    if (status === 'uploaded' && !isTranscribing) {
      const timer = setTimeout(() => {
        handleAutoTranscribe();
      }, 1000); // Start transcription after 1 second
      
      return () => clearTimeout(timer);
    }
  }, [status, isTranscribing]);

  const handleAutoTranscribe = () => {
    if (status === 'uploaded' && !isTranscribing) {
      autoTranscribeMutation.mutate(meetingId);
    }
  };

  const handleManualTranscribe = () => {
    if (status === 'uploaded' || status === 'transcription_error') {
      autoTranscribeMutation.mutate(meetingId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'transcribing':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'transcribed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'transcription_error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Uploaded</Badge>;
      case 'transcribing':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200 animate-pulse">Transcribing</Badge>;
      case 'transcribed':
        return <Badge variant="outline" className="text-green-600 border-green-200">Transcribed</Badge>;
      case 'transcription_error':
        return <Badge variant="outline" className="text-red-600 border-red-200">Error</Badge>;
      case 'processed':
        return <Badge variant="outline" className="text-green-600 border-green-200">Processed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Audio uploaded successfully. Starting transcription...';
      case 'transcribing':
        return 'Transcribing audio using Gemini AI...';
      case 'transcribed':
        return 'Transcription completed successfully!';
      case 'transcription_error':
        return 'Transcription failed. Click to retry.';
      case 'processed':
        return 'Meeting fully processed with timeline and tasks.';
      default:
        return 'Unknown status';
    }
  };

  const showTranscribeButton = status === 'uploaded' || status === 'transcription_error';
  const showProgress = status === 'transcribing';

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getStatusIcon(status)}
          Transcription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm truncate">{meetingTitle}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {getStatusMessage(status)}
            </p>
          </div>
          <div className="ml-2">
            {getStatusBadge(status)}
          </div>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <Progress value={undefined} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Processing audio with Gemini AI...
            </p>
          </div>
        )}

        {showTranscribeButton && (
          <Button 
            onClick={handleManualTranscribe}
            disabled={autoTranscribeMutation.isPending}
            size="sm"
            className="w-full"
            variant="outline"
          >
            {autoTranscribeMutation.isPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 mr-2" />
                Start Transcription
              </>
            )}
          </Button>
        )}

        {status === 'transcribed' && (
          <div className="flex gap-2">
            <Button 
              onClick={() => refetchStatus()}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Refresh
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <FileText className="w-3 h-3 mr-2" />
              View Transcript
            </Button>
          </div>
        )}

        {status === 'transcription_error' && (
          <Button 
            onClick={handleManualTranscribe}
            disabled={autoTranscribeMutation.isPending}
            size="sm"
            className="w-full"
            variant="destructive"
          >
            {autoTranscribeMutation.isPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-2" />
                Retry Transcription
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
