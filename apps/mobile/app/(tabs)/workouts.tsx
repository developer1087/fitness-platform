import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Workout, exerciseDatabase, workoutTemplates } from '../../lib/shared-types';
import { LogWorkoutModal } from '../../components/workouts/LogWorkoutModal';
import { LiveWorkoutScreen } from '../../components/workouts/LiveWorkoutScreen';
import { workoutService, WorkoutStats } from '../../lib/workouts';
import { useAuth } from '../../lib/auth';

export default function WorkoutsScreen() {
  const { user } = useAuth();
  const [showLogModal, setShowLogModal] = useState(false);
  const [showLiveWorkout, setShowLiveWorkout] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadWorkoutData();
    }
  }, [user]);

  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      const userId = user?.uid || 'demo';
      const [workouts, stats] = await Promise.all([
        workoutService.getRecentWorkouts(userId, 5),
        workoutService.getUserStats(userId),
      ]);
      setRecentWorkouts(workouts);
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = (template: any) => {
    setSelectedTemplate(template);
    setShowLiveWorkout(true);
  };

  const handleLogWorkout = () => {
    setShowLogModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cardio': return '#DC2626';
      case 'strength': return '#2563EB';
      case 'flexibility': return '#059669';
      default: return '#6B7280';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getExerciseName = (exerciseId: string) => {
    return exerciseDatabase.find(ex => ex.id === exerciseId)?.name || exerciseId;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
          <TouchableOpacity
            style={styles.logButton}
            onPress={handleLogWorkout}
          >
            <Text style={styles.logButtonText}>Log Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Start Workouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Templates</Text>
          <View style={styles.quickWorkoutsGrid}>
            {workoutTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.quickWorkoutCard,
                  { borderColor: getCategoryColor(template.category) },
                ]}
                onPress={() => handleStartWorkout(template)}
              >
                <Text style={styles.quickWorkoutName}>{template.name}</Text>
                <Text style={styles.quickWorkoutDuration}>{template.duration}</Text>
                <Text style={styles.workoutDescription} numberOfLines={2}>
                  {template.description}
                </Text>
                <View style={styles.workoutMeta}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(template.category) },
                    ]}
                  >
                    <Text style={styles.categoryText}>{template.category}</Text>
                  </View>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(template.difficulty) },
                    ]}
                  >
                    <Text style={styles.difficultyText}>{template.difficulty}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Workout */}
        {activeWorkout && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Workout</Text>
            <View style={styles.activeWorkoutCard}>
              <View style={styles.activeWorkoutHeader}>
                <Text style={styles.activeWorkoutName}>{activeWorkout.name}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>IN PROGRESS</Text>
                </View>
              </View>
              <Text style={styles.activeWorkoutTime}>
                Started at {new Date(activeWorkout.startTime || '').toLocaleTimeString()}
              </Text>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => setShowLogModal(true)}
              >
                <Text style={styles.continueButtonText}>Continue Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Workouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {recentWorkouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
                </View>
                <View style={styles.workoutStats}>
                  <Text style={styles.workoutCalories}>
                    {workout.totalCalories} cal
                  </Text>
                  <Text style={styles.workoutExercises}>
                    {workout.exercises.length} exercises
                  </Text>
                </View>
              </View>

              <View style={styles.exercisesList}>
                {workout.exercises.slice(0, 3).map((exercise) => (
                  <View key={exercise.id} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>
                      {getExerciseName(exercise.exerciseId)}
                    </Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.reps && `${exercise.reps} reps`}
                      {exercise.weight && ` × ${exercise.weight}lbs`}
                      {exercise.duration && `${Math.floor(exercise.duration / 60)}min`}
                      {exercise.distance && ` × ${exercise.distance}m`}
                    </Text>
                  </View>
                ))}
                {workout.exercises.length > 3 && (
                  <Text style={styles.moreExercises}>
                    +{workout.exercises.length - 3} more exercises
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{weeklyStats?.weeklyWorkouts || 0}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{weeklyStats?.weeklyCalories || 0}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{((weeklyStats?.weeklyMinutes || 0) / 60).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Log Workout Modal */}
      <LogWorkoutModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSave={async (workoutData) => {
          try {
            await workoutService.saveWorkout(user?.uid || 'demo', workoutData);
            setShowLogModal(false);
            setActiveWorkout(null);
            await loadWorkoutData(); // Refresh data after saving
          } catch (error) {
            console.error('Error saving workout:', error);
          }
        }}
        initialWorkout={activeWorkout}
      />

      {/* Live Workout Screen */}
      <LiveWorkoutScreen
        visible={showLiveWorkout}
        onClose={() => {
          setShowLiveWorkout(false);
          setSelectedTemplate(null);
          loadWorkoutData(); // Refresh data after live workout
        }}
        workoutTemplate={selectedTemplate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  logButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickWorkoutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickWorkoutCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140,
  },
  quickWorkoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  quickWorkoutDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  activeWorkoutCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#059669',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeWorkoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  activeBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  activeWorkoutTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutCard: {
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
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 2,
  },
  workoutExercises: {
    fontSize: 12,
    color: '#6B7280',
  },
  exercisesList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreExercises: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  workoutDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});