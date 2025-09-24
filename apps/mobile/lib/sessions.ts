import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Session {
  id: string;
  traineeId: string;
  trainerId: string;
  trainerName: string;
  sessionType: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  goals?: string[];
  notes?: string;
  feedback?: {
    trainerNotes: string;
    traineeRating: number;
    traineeComment: string;
  };
  createdAt: string;
}

export interface TraineeProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  goals: string[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    sessionTypes: string[];
    availability: string[];
  };
  stats: {
    totalSessions: number;
    totalWorkouts: number;
    currentStreak: number;
    totalCaloriesBurned: number;
    totalMinutesActive: number;
  };
  recentWorkouts: Array<{
    id: string;
    name: string;
    date: string;
    duration: number;
    caloriesBurned: number;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      weight?: number;
    }>;
  }>;
  upcomingSessions: Session[];
  pastSessions: Session[];
}

class SessionService {
  private readonly SESSIONS_KEY = 'user_sessions';
  private readonly TRAINEE_PROFILE_KEY = 'trainee_profile';

  async bookSession(sessionData: Omit<Session, 'id' | 'createdAt' | 'status'>): Promise<Session> {
    try {
      const newSession: Session = {
        ...sessionData,
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };

      const existingSessions = await this.getUserSessions(sessionData.traineeId);
      const updatedSessions = [...existingSessions, newSession];

      await AsyncStorage.setItem(
        `${this.SESSIONS_KEY}_${sessionData.traineeId}`,
        JSON.stringify(updatedSessions)
      );

      // Update trainee profile with upcoming session
      await this.updateTraineeProfileWithSession(sessionData.traineeId, newSession);

      return newSession;
    } catch (error) {
      console.error('Error booking session:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const sessionsData = await AsyncStorage.getItem(`${this.SESSIONS_KEY}_${userId}`);
      return sessionsData ? JSON.parse(sessionsData) : [];
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  async updateSessionStatus(sessionId: string, userId: string, status: Session['status']): Promise<void> {
    try {
      const sessions = await this.getUserSessions(userId);
      const updatedSessions = sessions.map(session =>
        session.id === sessionId ? { ...session, status } : session
      );

      await AsyncStorage.setItem(
        `${this.SESSIONS_KEY}_${userId}`,
        JSON.stringify(updatedSessions)
      );
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }

  async addSessionFeedback(
    sessionId: string,
    userId: string,
    feedback: Session['feedback']
  ): Promise<void> {
    try {
      const sessions = await this.getUserSessions(userId);
      const updatedSessions = sessions.map(session =>
        session.id === sessionId ? { ...session, feedback } : session
      );

      await AsyncStorage.setItem(
        `${this.SESSIONS_KEY}_${userId}`,
        JSON.stringify(updatedSessions)
      );
    } catch (error) {
      console.error('Error adding session feedback:', error);
      throw error;
    }
  }

  async getTraineeProfile(userId: string): Promise<TraineeProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(`${this.TRAINEE_PROFILE_KEY}_${userId}`);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting trainee profile:', error);
      return null;
    }
  }

  async updateTraineeProfile(userId: string, profile: Partial<TraineeProfile>): Promise<void> {
    try {
      const existingProfile = await this.getTraineeProfile(userId);
      const updatedProfile = existingProfile
        ? { ...existingProfile, ...profile }
        : { ...this.createDefaultProfile(userId), ...profile };

      await AsyncStorage.setItem(
        `${this.TRAINEE_PROFILE_KEY}_${userId}`,
        JSON.stringify(updatedProfile)
      );
    } catch (error) {
      console.error('Error updating trainee profile:', error);
      throw error;
    }
  }

  private async updateTraineeProfileWithSession(userId: string, session: Session): Promise<void> {
    try {
      const profile = await this.getTraineeProfile(userId);
      if (!profile) {
        // Create default profile if it doesn't exist
        await this.updateTraineeProfile(userId, {
          upcomingSessions: [session],
          stats: { ...this.getDefaultStats(), totalSessions: 1 }
        });
        return;
      }

      const updatedProfile: Partial<TraineeProfile> = {
        upcomingSessions: [...(profile.upcomingSessions || []), session],
        stats: {
          ...profile.stats,
          totalSessions: profile.stats.totalSessions + 1
        }
      };

      await this.updateTraineeProfile(userId, updatedProfile);
    } catch (error) {
      console.error('Error updating trainee profile with session:', error);
      throw error;
    }
  }

  async syncWorkoutToProfile(userId: string, workoutData: any): Promise<void> {
    try {
      const profile = await this.getTraineeProfile(userId);
      if (!profile) {
        await this.createInitialProfile(userId, workoutData);
        return;
      }

      const newWorkout = {
        id: `workout_${Date.now()}`,
        name: workoutData.name || 'Custom Workout',
        date: new Date().toISOString(),
        duration: workoutData.totalDuration || 0,
        caloriesBurned: workoutData.totalCalories || 0,
        exercises: workoutData.exercises || []
      };

      const updatedProfile: Partial<TraineeProfile> = {
        recentWorkouts: [newWorkout, ...(profile.recentWorkouts || [])].slice(0, 10),
        stats: {
          ...profile.stats,
          totalWorkouts: profile.stats.totalWorkouts + 1,
          totalCaloriesBurned: profile.stats.totalCaloriesBurned + (workoutData.totalCalories || 0),
          totalMinutesActive: profile.stats.totalMinutesActive + Math.round((workoutData.totalDuration || 0) / 60),
          currentStreak: this.calculateStreak(profile.recentWorkouts)
        }
      };

      await this.updateTraineeProfile(userId, updatedProfile);
    } catch (error) {
      console.error('Error syncing workout to profile:', error);
      throw error;
    }
  }

  private async createInitialProfile(userId: string, workoutData: any): Promise<void> {
    const newWorkout = {
      id: `workout_${Date.now()}`,
      name: workoutData.name || 'Custom Workout',
      date: new Date().toISOString(),
      duration: workoutData.totalDuration || 0,
      caloriesBurned: workoutData.totalCalories || 0,
      exercises: workoutData.exercises || []
    };

    const initialProfile: TraineeProfile = {
      ...this.createDefaultProfile(userId),
      recentWorkouts: [newWorkout],
      stats: {
        ...this.getDefaultStats(),
        totalWorkouts: 1,
        totalCaloriesBurned: workoutData.totalCalories || 0,
        totalMinutesActive: Math.round((workoutData.totalDuration || 0) / 60),
        currentStreak: 1
      }
    };

    await this.updateTraineeProfile(userId, initialProfile);
  }

  private createDefaultProfile(userId: string): TraineeProfile {
    return {
      id: userId,
      name: 'User',
      email: '',
      goals: [],
      fitnessLevel: 'beginner',
      preferences: {
        sessionTypes: [],
        availability: []
      },
      stats: this.getDefaultStats(),
      recentWorkouts: [],
      upcomingSessions: [],
      pastSessions: []
    };
  }

  private getDefaultStats() {
    return {
      totalSessions: 0,
      totalWorkouts: 0,
      currentStreak: 0,
      totalCaloriesBurned: 0,
      totalMinutesActive: 0
    };
  }

  private calculateStreak(workouts: any[]): number {
    if (!workouts || workouts.length === 0) return 0;

    const today = new Date();
    const sortedWorkouts = workouts
      .map(w => new Date(w.date))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);

    for (const workoutDate of sortedWorkouts) {
      const workout = new Date(workoutDate);
      workout.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - workout.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = workout;
      } else {
        break;
      }
    }

    return streak;
  }

  // Methods for trainers to access trainee data
  async getTraineesByTrainer(trainerId: string): Promise<TraineeProfile[]> {
    try {
      // In a real app, this would query a database for trainees assigned to this trainer
      // For demo purposes, we'll return mock data
      const traineeIds = ['demo', 'trainee_1', 'trainee_2']; // Mock trainee IDs
      const trainees: TraineeProfile[] = [];

      for (const traineeId of traineeIds) {
        const profile = await this.getTraineeProfile(traineeId);
        if (profile) {
          trainees.push(profile);
        }
      }

      return trainees;
    } catch (error) {
      console.error('Error getting trainees by trainer:', error);
      return [];
    }
  }

  async getTraineeFullData(traineeId: string): Promise<{
    profile: TraineeProfile | null;
    sessions: Session[];
  }> {
    try {
      const [profile, sessions] = await Promise.all([
        this.getTraineeProfile(traineeId),
        this.getUserSessions(traineeId)
      ]);

      return { profile, sessions };
    } catch (error) {
      console.error('Error getting trainee full data:', error);
      return { profile: null, sessions: [] };
    }
  }
}

export const sessionService = new SessionService();