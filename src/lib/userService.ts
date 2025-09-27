import { auth } from './firebase';
import { apiService } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  userId: string;
  meetingCount: number;
  taskCount: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

class UserService {
  /**
   * Register or update user in the backend database
   */
  async registerUser(firebaseUser: any): Promise<User> {
    try {
      const userData = {
        user_id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Unknown User',
        email: firebaseUser.email || '',
        photo_url: firebaseUser.photoURL || null
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`User registration failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('User registered successfully:', result);
      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Get user information from backend
   */
  async getUserInfo(userId: string): Promise<User> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/user/${userId}/stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to get user stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Handle Firebase auth state change and register user
   */
  async handleAuthStateChange(firebaseUser: any): Promise<User | null> {
    if (firebaseUser) {
      try {
        // Register/update user in backend database
        const user = await this.registerUser(firebaseUser);
        return user;
      } catch (error) {
        console.error('Failed to register user in backend:', error);
        // Don't throw error here to avoid breaking auth flow
        return null;
      }
    }
    return null;
  }
}

export const userService = new UserService();
