import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response;
  }

  // Health check
  async healthCheck() {
    const response = await this.makeRequest('/health');
    return response.json();
  }

  // File upload
  async uploadFile(file: File, title: string, userId: string) {
    const token = await this.getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('user_id', userId);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Perfect transcription - Start transcription
  async transcribeMeeting(meetingId: string, userId: string) {
    const response = await this.makeRequest(`/transcribe/${meetingId}`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  }

  // Perfect transcription - Auto-transcribe meeting
  async autoTranscribeMeeting(meetingId: string) {
    const response = await this.makeRequest(`/transcribe/${meetingId}`, {
      method: 'POST',
    });
    return response.json();
  }

  // Perfect transcription - Get detailed status
  async getTranscriptionStatus(meetingId: string) {
    const response = await this.makeRequest(`/transcribe/${meetingId}/status`);
    return response.json();
  }

  // Get upload status
  async getUploadStatus(meetingId: string) {
    const response = await this.makeRequest(`/upload/status/${meetingId}`);
    return response.json();
  }

  // Extract insights
  async extractInsights(meetingId: string, userId: string) {
    const response = await this.makeRequest(`/extract/${meetingId}`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  }

  // Get meeting details
  async getMeeting(meetingId: string) {
    const response = await this.makeRequest(`/meeting/${meetingId}`);
    return response.json();
  }

  // Get user meetings
  async getUserMeetings(userId: string, page = 1, perPage = 10) {
    const response = await this.makeRequest(
      `/meetings/user/${userId}?page=${page}&per_page=${perPage}`
    );
    return response.json();
  }

  // Get user tasks
  async getUserTasks(userId: string, page = 1, perPage = 20) {
    const response = await this.makeRequest(
      `/tasks/user/${userId}?page=${page}&per_page=${perPage}`
    );
    return response.json();
  }

  // Create task
  async createTask(taskData: {
    name: string;
    description?: string;
    meeting_id: string;
    user_id: string;
    category: string;
    priority?: string;
    owner?: string;
    deadline?: string;
  }) {
    const response = await this.makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return response.json();
  }

  // Update task
  async updateTask(taskId: string, taskData: any) {
    const response = await this.makeRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
    return response.json();
  }

  // Complete task
  async completeTask(taskId: string) {
    const response = await this.makeRequest(`/tasks/${taskId}/complete`, {
      method: 'POST',
    });
    return response.json();
  }

  // Delete task
  async deleteTask(taskId: string) {
    const response = await this.makeRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // Get overdue tasks
  async getOverdueTasks(userId: string) {
    const response = await this.makeRequest(`/tasks/overdue/user/${userId}`);
    return response.json();
  }

  // Get upcoming tasks
  async getUpcomingTasks(userId: string) {
    const response = await this.makeRequest(`/tasks/upcoming/user/${userId}`);
    return response.json();
  }

  // Send notification
  async sendNotification(taskId: string, type: string = 'reminder') {
    const response = await this.makeRequest(`/notify/task/${taskId}`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    return response.json();
  }

  // User profile endpoints
  async getUserProfile(userId: string) {
    const response = await this.makeRequest(`/user/${userId}`);
    return response.json();
  }

  async updateUserProfile(userId: string, profileData: {
    name?: string;
    email?: string;
    photo_url?: string;
  }) {
    const response = await this.makeRequest(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.json();
  }

  async getUserStats(userId: string) {
    const response = await this.makeRequest(`/user/${userId}/stats`);
    return response.json();
  }

  async registerUser(userData: {
    user_id: string;
    name: string;
    email: string;
    photo_url?: string;
  }) {
    const response = await this.makeRequest('/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.json();
  }
}

export const apiService = new ApiService();
