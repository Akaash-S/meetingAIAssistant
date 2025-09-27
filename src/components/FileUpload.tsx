import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { 
  Upload, 
  FileAudio, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess?: (meetingId: string) => void;
  onUploadError?: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadSuccess, 
  onUploadError 
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Create FormData with user information
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('user_id', user.id);
      formData.append('user_name', user.name || 'Unknown User');
      formData.append('user_email', user.email || `${user.id}@example.com`);
      if (user.photoURL) {
        formData.append('user_photo_url', user.photoURL);
      }

      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadStatus('success');
      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ['meetings', user?.id] });
      onUploadSuccess?.(data.meeting_id);
    },
    onError: (error: any) => {
      setUploadStatus('error');
      setUploadError(error.message || 'Upload failed');
      onUploadError?.(error.message || 'Upload failed');
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'video/mp4', 'video/avi'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload an audio or video file');
      setUploadStatus('error');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 100MB');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    // Upload file
    const title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    uploadMutation.mutate({ file, title });
  }, [uploadMutation, user?.id, onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac'],
      'video/*': ['.mp4', '.avi', '.mov']
    },
    multiple: false,
    disabled: uploadStatus === 'uploading'
  });

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadError(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Upload Meeting Recording</h3>
            <p className="text-sm text-muted-foreground">
              Upload audio or video files to extract insights and action items
            </p>
          </div>

          {uploadStatus === 'idle' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <div className="text-xs text-muted-foreground">
                <p>Supported formats: MP3, WAV, M4A, MP4, AVI</p>
                <p>Maximum file size: 100MB</p>
              </div>
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Uploading file...</p>
                  <Progress value={uploadProgress} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(uploadProgress)}% complete
                  </p>
                </div>
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div className="flex-1">
                  <p className="font-medium text-success">Upload successful!</p>
                  <p className="text-sm text-muted-foreground">
                    Your meeting is being processed. This includes transcription, timeline generation, task extraction, and calendar integration. You'll receive insights shortly.
                  </p>
                </div>
              </div>
              <Button onClick={resetUpload} variant="outline" className="w-full">
                Upload Another File
              </Button>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Upload failed</p>
                  <p className="text-sm text-muted-foreground">
                    {uploadError}
                  </p>
                </div>
              </div>
              <Button onClick={resetUpload} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
