import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { workoutService, WorkoutStats } from '../../lib/workouts';
import { exerciseDatabase } from '../../lib/shared-types';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadProgressData();
    }
  }, [user, selectedPeriod]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const userId = user?.uid || 'demo';
      const [userStats, recentWorkouts] = await Promise.all([
        workoutService.getUserStats(userId),
        workoutService.getRecentWorkouts(userId, 30),
      ]);

      setStats(userStats);
      setWorkoutData(generateChartData(recentWorkouts));
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (workouts: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        workouts: 0,
        calories: 0,
        minutes: 0,
      };
    });

    workouts.forEach(workout => {
      const dayData = last7Days.find(d => d.date === workout.date);
      if (dayData && workout.status === 'completed') {
        dayData.workouts += 1;
        dayData.calories += workout.totalCalories || 0;
        const duration = workout.endTime && workout.startTime
          ? (new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / (1000 * 60)
          : 30;
        dayData.minutes += duration;
      }
    });

    return last7Days;
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const renderMiniChart = (data: any[], type: 'workouts' | 'calories' | 'minutes') => {
    const maxValue = Math.max(...data.map(d => d[type]), 1);
    const chartWidth = width - 80;
    const barWidth = (chartWidth - 60) / 7;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {data.map((item, index) => {
            const height = (item[type] / maxValue) * 80;
            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(height, 2),
                      width: barWidth,
                      backgroundColor: getChartColor(type),
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getChartColor = (type: string) => {
    switch (type) {
      case 'workouts': return '#2563EB';
      case 'calories': return '#DC2626';
      case 'minutes': return '#059669';
      default: return '#6B7280';
    }
  };

  const periods = [
    { id: 'week', name: 'Week' },
    { id: 'month', name: 'Month' },
    { id: 'year', name: 'Year' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your fitness journey</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map(period => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                selectedPeriod === period.id && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.id as any)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.id && styles.periodButtonTextActive,
                ]}
              >
                {period.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{stats?.totalWorkouts || 0}</Text>
              <Text style={styles.overviewLabel}>Total Workouts</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage(stats?.totalWorkouts || 0, 50)}%`,
                      backgroundColor: '#2563EB',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{stats?.currentStreak || 0}</Text>
              <Text style={styles.overviewLabel}>Day Streak</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage(stats?.currentStreak || 0, 30)}%`,
                      backgroundColor: '#10B981',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>
                {Math.round((stats?.totalMinutes || 0) / 60)}h
              </Text>
              <Text style={styles.overviewLabel}>Total Hours</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage((stats?.totalMinutes || 0) / 60, 100)}%`,
                      backgroundColor: '#059669',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{stats?.totalCalories || 0}</Text>
              <Text style={styles.overviewLabel}>Total Calories</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage(stats?.totalCalories || 0, 10000)}%`,
                      backgroundColor: '#DC2626',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Workouts This Week</Text>
            {renderMiniChart(workoutData, 'workouts')}
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Calories Burned</Text>
            {renderMiniChart(workoutData, 'calories')}
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Active Minutes</Text>
            {renderMiniChart(workoutData, 'minutes')}
          </View>
        </View>

        {/* Exercise Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Exercises</Text>
          <View style={styles.exerciseBreakdown}>
            {exerciseDatabase.slice(0, 6).map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseCategory}>{exercise.category}</Text>
                </View>
                <View style={styles.exerciseStats}>
                  <Text style={styles.exerciseCount}>{Math.floor(Math.random() * 20) + 5}</Text>
                  <Text style={styles.exerciseCountLabel}>times</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Goals</Text>

          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Workout Frequency</Text>
              <Text style={styles.goalProgress}>
                {stats?.weeklyWorkouts || 0}/5 workouts
              </Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View
                style={[
                  styles.goalProgressFill,
                  {
                    width: `${getProgressPercentage(stats?.weeklyWorkouts || 0, 5)}%`,
                    backgroundColor: '#2563EB',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Calories Burned</Text>
              <Text style={styles.goalProgress}>
                {stats?.weeklyCalories || 0}/2000 cal
              </Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View
                style={[
                  styles.goalProgressFill,
                  {
                    width: `${getProgressPercentage(stats?.weeklyCalories || 0, 2000)}%`,
                    backgroundColor: '#DC2626',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Active Time</Text>
              <Text style={styles.goalProgress}>
                {Math.round((stats?.weeklyMinutes || 0) / 60)}h/10h
              </Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View
                style={[
                  styles.goalProgressFill,
                  {
                    width: `${getProgressPercentage((stats?.weeklyMinutes || 0) / 60, 10)}%`,
                    backgroundColor: '#059669',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>🔥</Text>
              <Text style={styles.achievementTitle}>First Workout</Text>
              <Text style={styles.achievementDate}>Completed</Text>
            </View>

            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>💪</Text>
              <Text style={styles.achievementTitle}>Week Warrior</Text>
              <Text style={styles.achievementDate}>
                {(stats?.weeklyWorkouts || 0) >= 5 ? 'Completed' : 'In Progress'}
              </Text>
            </View>

            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>⚡</Text>
              <Text style={styles.achievementTitle}>Streak Master</Text>
              <Text style={styles.achievementDate}>
                {(stats?.currentStreak || 0) >= 7 ? 'Completed' : 'In Progress'}
              </Text>
            </View>

            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>🏆</Text>
              <Text style={styles.achievementTitle}>Fitness Pro</Text>
              <Text style={styles.achievementDate}>
                {(stats?.totalWorkouts || 0) >= 50 ? 'Completed' : 'Locked'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  chartContainer: {
    height: 100,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    borderRadius: 2,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  exerciseBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  exerciseStats: {
    alignItems: 'flex-end',
  },
  exerciseCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  exerciseCountLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  goalProgress: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});