// Production API service for mobile app
// Connects to the production web backend at ryzup.me

const API_BASE_URL = 'https://ryzup.me';

export class ApiService {
  // Helper method to get auth headers
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const { auth } = await import('./firebase');
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    }

    return {
      'Content-Type': 'application/json'
    };
  }

  // Helper method for API requests
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    console.log(`📡 API Request: ${config.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${config.method || 'GET'} ${url}`);
      return data;
    } catch (error) {
      console.error(`❌ API Request failed:`, error);
      throw error;
    }
  }

  // Trainee invitation acceptance (for mobile signup flow)
  static async acceptInvitation(
    traineeEmail: string,
    trainerName: string,
    traineeFirstName: string,
    invitationToken: string
  ): Promise<boolean> {
    try {
      const response = await this.request<{ ok: boolean }>('/api/email/invite', {
        method: 'POST',
        body: JSON.stringify({
          traineeEmail,
          trainerName,
          traineeFirstName,
          invitationToken
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      return false;
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<any> {
    return this.request(`/api/users/${userId}`);
  }

  // Update user profile
  static async updateUserProfile(userId: string, profileData: any): Promise<any> {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Get trainee data (for trainees logged into mobile app)
  static async getTraineeData(userId: string): Promise<any> {
    return this.request(`/api/trainees/user/${userId}`);
  }

  // Get training sessions for trainee
  static async getTraineeSessions(traineeId: string): Promise<any[]> {
    return this.request(`/api/sessions/trainee/${traineeId}`);
  }

  // Get workouts for trainee
  static async getTraineeWorkouts(traineeId: string): Promise<any[]> {
    return this.request(`/api/workouts/trainee/${traineeId}`);
  }

  // Submit workout completion
  static async completeWorkout(sessionId: string, workoutData: any): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(workoutData)
    });
  }

  // Send message to trainer
  static async sendMessageToTrainer(traineeId: string, message: string): Promise<any> {
    return this.request(`/api/messages/send`, {
      method: 'POST',
      body: JSON.stringify({
        traineeId,
        message,
        type: 'trainee_to_trainer'
      })
    });
  }

  // Get messages between trainee and trainer
  static async getMessages(traineeId: string): Promise<any[]> {
    return this.request(`/api/messages/trainee/${traineeId}`);
  }

  // Upload progress photo/video
  static async uploadProgressMedia(
    traineeId: string,
    mediaFile: File | Blob,
    type: 'photo' | 'video'
  ): Promise<any> {
    const formData = new FormData();
    formData.append('media', mediaFile);
    formData.append('type', type);
    formData.append('traineeId', traineeId);

    const { auth } = await import('./firebase');
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

    const response = await fetch(`${API_BASE_URL}/api/progress/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Health check - verify API connectivity
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

export default ApiService;