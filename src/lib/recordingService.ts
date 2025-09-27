import { auth } from './firebase';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5001';

export interface RecordingState {
  isRecording: boolean;
  isConnected: boolean;
  meetingId: string | null;
  duration: number;
  error: string | null;
}

export interface MeetingSession {
  id: string;
  title: string;
  startTime: Date;
  duration: number;
  status: 'recording' | 'stopped' | 'processing' | 'completed';
}

class RecordingService {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private recordingChunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private durationInterval: NodeJS.Timeout | null = null;
  
  private state: RecordingState = {
    isRecording: false,
    isConnected: false,
    meetingId: null,
    duration: 0,
    error: null,
  };

  private listeners: ((state: RecordingState) => void)[] = [];

  constructor() {
    this.checkBrowserSupport();
  }

  // Subscribe to state changes
  subscribe(listener: (state: RecordingState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get current state
  getState(): RecordingState {
    return { ...this.state };
  }

  // Update state and notify listeners
  private updateState(updates: Partial<RecordingState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  // Check browser support for recording
  private checkBrowserSupport(): boolean {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.updateState({ error: 'Browser does not support audio recording' });
      return false;
    }

    if (!window.MediaRecorder) {
      this.updateState({ error: 'Browser does not support MediaRecorder API' });
      return false;
    }

    return true;
  }

  // Connect to WebSocket
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }

        const wsUrl = `${WS_BASE_URL}/audio?user_id=${user.uid}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.updateState({ isConnected: true, error: null });
          resolve();
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.updateState({ isConnected: false });
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.updateState({ 
            isConnected: false, 
            error: 'Failed to connect to recording service' 
          });
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

      } catch (error) {
        this.updateState({ error: 'Failed to connect to recording service' });
        reject(error);
      }
    });
  }

  // Handle WebSocket messages
  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'meeting_created':
        this.updateState({ meetingId: data.meeting_id });
        break;
      case 'recording_started':
        this.updateState({ isRecording: true, error: null });
        break;
      case 'recording_stopped':
        this.updateState({ isRecording: false });
        break;
      case 'error':
        this.updateState({ error: data.message });
        break;
    }
  }

  // Request microphone permission
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (!this.checkBrowserSupport()) {
        return false;
      }

      // Check if we're in a secure context (required for microphone access)
      if (!window.isSecureContext) {
        this.updateState({ error: 'Microphone access requires HTTPS' });
        return false;
      }

      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      return true;
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      
      let errorMessage = 'Failed to access microphone';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied. Please allow microphone access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Microphone not supported in this browser.';
      }

      this.updateState({ error: errorMessage });
      return false;
    }
  }

  // Start recording
  async startRecording(meetingTitle: string): Promise<void> {
    try {
      // Connect to WebSocket if not connected
      if (!this.state.isConnected) {
        await this.connect();
      }

      // Request microphone permission
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission required');
      }

      if (!this.audioStream) {
        throw new Error('No audio stream available');
      }

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.recordingChunks = [];
      this.recordingStartTime = Date.now();

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data);
          
          // Send audio data to WebSocket
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(event.data);
          }
        }
      };

      // Handle recording stop
      this.mediaRecorder.onstop = () => {
        this.stopDurationTimer();
        this.updateState({ isRecording: false, duration: 0 });
      };

      // Start recording
      this.mediaRecorder.start(1000); // Send data every second

      // Start duration timer
      this.startDurationTimer();

      // Send start recording message
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'start_recording',
          title: meetingTitle,
          user_id: auth.currentUser?.uid,
        }));
      }

      this.updateState({ 
        isRecording: true, 
        error: null,
        duration: 0 
      });

    } catch (error: any) {
      console.error('Start recording error:', error);
      this.updateState({ 
        error: error.message || 'Failed to start recording' 
      });
      throw error;
    }
  }

  // Stop recording
  async stopRecording(): Promise<void> {
    try {
      if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
        throw new Error('No active recording to stop');
      }

      // Stop MediaRecorder
      this.mediaRecorder.stop();

      // Stop audio stream
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }

      // Send stop recording message
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'stop_recording',
        }));
      }

      this.updateState({ 
        isRecording: false,
        error: null 
      });

    } catch (error: any) {
      console.error('Stop recording error:', error);
      this.updateState({ 
        error: error.message || 'Failed to stop recording' 
      });
      throw error;
    }
  }

  // Start duration timer
  private startDurationTimer() {
    this.durationInterval = setInterval(() => {
      const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      this.updateState({ duration });
    }, 1000);
  }

  // Stop duration timer
  private stopDurationTimer() {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }

  // Format duration as MM:SS
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    this.stopDurationTimer();
    this.updateState({ 
      isConnected: false, 
      isRecording: false,
      meetingId: null,
      duration: 0 
    });
  }

  // Cleanup
  destroy() {
    this.disconnect();
    this.listeners = [];
  }
}

export const recordingService = new RecordingService();
