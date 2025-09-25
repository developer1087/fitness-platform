import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, WorkoutLogFormData, exerciseDatabase } from './shared-types';
import { sessionService } from './sessions';

const WORKOUTS_KEY = 'fitness_workouts';
const STATS_KEY = 'fitness_stats';

export interface WorkoutStats {
  totalWorkouts: number;
  totalCalories: number;
  totalMinutes: number;
  currentStreak: number;
  weeklyWorkouts: number;
  weeklyCalories: number;
  weeklyMinutes: number;
}

// Mock workout service with local storage
export const workoutService = {
  // Get all workouts for a user
  async getUserWorkouts(userId: string): Promise<Workout[]> {
    try {
      const workoutsJson = await AsyncStorage.getItem(WORKOUTS_KEY);
      const allWorkouts: Workout[] = workoutsJson ? JSON.parse(workoutsJson) : [];
      return allWorkouts.filter(workout => workout.userId === userId);
    } catch (error) {
      console.error('Error getting user workouts:', error);
      return [];
    }
  },

  // Save a new workout
  async saveWorkout(userId: string, workoutData: WorkoutLogFormData): Promise<Workout> {
    try {
      const workout: Workout = {
        id: Date.now().toString(),
        userId,
        name: workoutData.name,
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        status: 'completed',
        exercises: workoutData.exercises.flatMap((exercise, exerciseIndex) =>
          exercise.sets.map((set, setIndex) => ({
            id: `${Date.now()}_${exerciseIndex}_${setIndex}`,
            exerciseId: exercise.exerciseId,
            setNumber: setIndex + 1,
            reps: set.reps,
            weight: set.weight,
            duration: set.duration,
            distance: set.distance,
            notes: set.notes,
          }))
        ),
        notes: workoutData.notes,
        totalCalories: this.calculateCalories(workoutData),
      };

      const workoutsJson = await AsyncStorage.getItem(WORKOUTS_KEY);
      const allWorkouts: Workout[] = workoutsJson ? JSON.parse(workoutsJson) : [];
      allWorkouts.push(workout);
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(allWorkouts));

      // Update stats
      await this.updateStats(userId);

      // Sync workout to trainee profile for trainer visibility
      await sessionService.syncWorkoutToProfile(userId, {
        name: workoutData.name,
        totalDuration: 0, // Calculate from exercise times
        totalCalories: workout.totalCalories,
        exercises: workoutData.exercises.map(ex => ({
          name: exerciseDatabase.find(e => e.id === ex.exerciseId)?.name || 'Unknown',
          sets: ex.sets.length,
          reps: ex.sets.reduce((sum, set) => sum + (set.reps || 0), 0),
          weight: Math.max(...ex.sets.map(set => set.weight || 0), 0)
        }))
      });

      return workout;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  },

  // Calculate estimated calories burned
  calculateCalories(workoutData: WorkoutLogFormData): number {
    let totalCalories = 0;

    workoutData.exercises.forEach((exercise) => {
      const exerciseInfo = exerciseDatabase.find(ex => ex.id === exercise.exerciseId);
      const category = exerciseInfo?.category || 'strength';

      exercise.sets.forEach((set) => {
        if (category === 'cardio') {
          // Cardio: 10 calories per minute
          const minutes = (set.duration || 0) / 60;
          totalCalories += minutes * 10;
        } else if (category === 'strength') {
          // Strength: 5 calories per rep with weight factor
          const reps = set.reps || 0;
          const weightFactor = Math.min((set.weight || 0) / 100, 2); // Cap at 2x
          totalCalories += reps * (5 + weightFactor);
        } else {
          // Other categories: 3 calories per rep/minute
          const units = set.reps || (set.duration || 0) / 60;
          totalCalories += units * 3;
        }
      });
    });

    return Math.round(totalCalories);
  },

  // Get user stats
  async getUserStats(userId: string): Promise<WorkoutStats> {
    try {
      const statsJson = await AsyncStorage.getItem(`${STATS_KEY}_${userId}`);
      if (statsJson) {
        return JSON.parse(statsJson);
      }

      // Calculate initial stats
      return await this.updateStats(userId);
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalWorkouts: 0,
        totalCalories: 0,
        totalMinutes: 0,
        currentStreak: 0,
        weeklyWorkouts: 0,
        weeklyCalories: 0,
        weeklyMinutes: 0,
      };
    }
  },

  // Update user stats
  async updateStats(userId: string): Promise<WorkoutStats> {
    try {
      const workouts = await this.getUserWorkouts(userId);
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Filter completed workouts
      const completedWorkouts = workouts.filter(w => w.status === 'completed');

      // Calculate totals
      const totalWorkouts = completedWorkouts.length;
      const totalCalories = completedWorkouts.reduce((sum, w) => sum + (w.totalCalories || 0), 0);
      const totalMinutes = completedWorkouts.reduce((sum, w) => {
        const duration = w.endTime && w.startTime
          ? (new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / (1000 * 60)
          : 30; // Default 30 minutes
        return sum + duration;
      }, 0);

      // Calculate weekly stats
      const weeklyWorkouts = completedWorkouts.filter(w =>
        new Date(w.date) >= oneWeekAgo
      );
      const weeklyCalories = weeklyWorkouts.reduce((sum, w) => sum + (w.totalCalories || 0), 0);
      const weeklyMinutes = weeklyWorkouts.reduce((sum, w) => {
        const duration = w.endTime && w.startTime
          ? (new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / (1000 * 60)
          : 30;
        return sum + duration;
      }, 0);

      // Calculate streak (consecutive days with workouts)
      const currentStreak = this.calculateStreak(completedWorkouts);

      const stats: WorkoutStats = {
        totalWorkouts,
        totalCalories: Math.round(totalCalories),
        totalMinutes: Math.round(totalMinutes),
        currentStreak,
        weeklyWorkouts: weeklyWorkouts.length,
        weeklyCalories: Math.round(weeklyCalories),
        weeklyMinutes: Math.round(weeklyMinutes),
      };

      await AsyncStorage.setItem(`${STATS_KEY}_${userId}`, JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('Error updating stats:', error);
      throw error;
    }
  },

  // Calculate current workout streak
  calculateStreak(workouts: Workout[]): number {
    if (workouts.length === 0) return 0;

    // Sort workouts by date (newest first)
    const sortedWorkouts = workouts
      .filter(w => w.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedWorkouts.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if there's a workout today or yesterday to start the streak
    const latestWorkoutDate = sortedWorkouts[0].date;
    if (latestWorkoutDate !== today && latestWorkoutDate !== yesterday) {
      return 0;
    }

    // Count consecutive days
    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < 30; i++) { // Check up to 30 days back
      const dateString = currentDate.toISOString().split('T')[0];
      const hasWorkout = sortedWorkouts.some(w => w.date === dateString);

      if (hasWorkout) {
        streak++;
      } else if (streak > 0) {
        // Break the streak if we find a day without workout after starting
        break;
      }

      // Go back one day
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  },

  // Get recent workouts (last 10)
  async getRecentWorkouts(userId: string, limit: number = 10): Promise<Workout[]> {
    try {
      const workouts = await this.getUserWorkouts(userId);
      return workouts
        .filter(w => w.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent workouts:', error);
      return [];
    }
  },

  // Get today's stats for dashboard
  async getTodayStats(userId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const workouts = await this.getUserWorkouts(userId);
      const todayWorkouts = workouts.filter(w =>
        w.date === today && w.status === 'completed'
      );

      const stats = await this.getUserStats(userId);

      return {
        workoutsCompleted: todayWorkouts.length,
        caloriesBurned: todayWorkouts.reduce((sum, w) => sum + (w.totalCalories || 0), 0),
        minutesActive: todayWorkouts.reduce((sum, w) => {
          const duration = w.endTime && w.startTime
            ? (new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / (1000 * 60)
            : 30;
          return sum + duration;
        }, 0),
        currentStreak: stats.currentStreak,
      };
    } catch (error) {
      console.error('Error getting today stats:', error);
      return {
        workoutsCompleted: 0,
        caloriesBurned: 0,
        minutesActive: 0,
        currentStreak: 0,
      };
    }
  },
};