import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  Vibration,
} from 'react-native';
import { Workout, ExerciseSet, exerciseDatabase } from '../../lib/shared-types';
import { workoutService } from '../../lib/workouts';
import { useAuth } from '../../lib/auth';

interface LiveWorkoutScreenProps {
  visible: boolean;
  onClose: () => void;
  workoutTemplate?: any;
}

export function LiveWorkoutScreen({
  visible,
  onClose,
  workoutTemplate,
}: LiveWorkoutScreenProps) {
  const { user } = useAuth();
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [completedSets, setCompletedSets] = useState<ExerciseSet[]>([]);
  const [currentSetData, setCurrentSetData] = useState<Partial<ExerciseSet>>({});

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible && workoutTemplate) {
      startWorkout();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [visible, workoutTemplate]);

  useEffect(() => {
    if (workoutStartTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [workoutStartTime]);

  useEffect(() => {
    if (isResting && restTimer > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            Vibration.vibrate([0, 200, 100, 200]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isResting, restTimer]);

  const startWorkout = () => {
    const startTime = new Date();
    setWorkoutStartTime(startTime);

    // Create initial workout structure based on template
    const initialWorkout: Workout = {
      id: Date.now().toString(),
      userId: user?.uid || 'demo',
      name: workoutTemplate?.name || 'Live Workout',
      date: startTime.toISOString().split('T')[0],
      startTime: startTime.toISOString(),
      status: 'in_progress',
      exercises: [],
    };

    setCurrentWorkout(initialWorkout);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setElapsedTime(0);
  };

  const getCurrentExercise = () => {
    if (!workoutTemplate?.exercises || currentExerciseIndex >= workoutTemplate.exercises.length) {
      return null;
    }
    const exerciseId = workoutTemplate.exercises[currentExerciseIndex];
    return exerciseDatabase.find(ex => ex.id === exerciseId) || exerciseDatabase[0];
  };

  const completeSet = () => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise || !currentWorkout) return;

    const setData: ExerciseSet = {
      id: `${Date.now()}_${currentExerciseIndex}_${currentSetIndex}`,
      exerciseId: currentExercise.id,
      setNumber: currentSetIndex + 1,
      reps: currentSetData.reps || 0,
      weight: currentSetData.weight || 0,
      duration: currentSetData.duration || 0,
      distance: currentSetData.distance || 0,
      notes: currentSetData.notes || '',
    };

    setCompletedSets(prev => [...prev, setData]);
    setCurrentSetData({});

    // Start rest timer (default 60 seconds for strength, 30 for cardio)
    const restTime = currentExercise.category === 'cardio' ? 30 : 60;
    setRestTimer(restTime);
    setIsResting(true);
  };

  const nextSet = () => {
    setCurrentSetIndex(prev => prev + 1);
    setCurrentSetData({});
  };

  const nextExercise = () => {
    setCurrentExerciseIndex(prev => prev + 1);
    setCurrentSetIndex(0);
    setCurrentSetData({});
    setIsResting(false);
    setRestTimer(0);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
  };

  const finishWorkout = async () => {
    if (!currentWorkout) return;

    try {
      const endTime = new Date();
      const finalWorkout: Workout = {
        ...currentWorkout,
        endTime: endTime.toISOString(),
        status: 'completed',
        exercises: completedSets,
        totalCalories: calculateCalories(),
      };

      // Save workout using the service
      const workoutData = {
        name: finalWorkout.name,
        exercises: groupExercisesByType(completedSets),
        notes: finalWorkout.notes || '',
      };

      await workoutService.saveWorkout(user?.uid || 'demo', workoutData);

      Alert.alert(
        'Workout Complete! 🎉',
        `Great job! You burned approximately ${calculateCalories()} calories in ${formatTime(elapsedTime)}.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  const groupExercisesByType = (sets: ExerciseSet[]) => {
    const grouped = new Map();
    sets.forEach(set => {
      if (!grouped.has(set.exerciseId)) {
        grouped.set(set.exerciseId, { exerciseId: set.exerciseId, sets: [] });
      }
      grouped.get(set.exerciseId).sets.push({
        reps: set.reps,
        weight: set.weight,
        duration: set.duration,
        distance: set.distance,
        notes: set.notes,
      });
    });
    return Array.from(grouped.values());
  };

  const calculateCalories = () => {
    return completedSets.reduce((total, set) => {
      const exercise = exerciseDatabase.find(ex => ex.id === set.exerciseId);
      if (exercise?.category === 'cardio') {
        return total + ((set.duration || 0) / 60) * 10;
      } else {
        return total + (set.reps || 0) * (5 + Math.min((set.weight || 0) / 100, 2));
      }
    }, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = getCurrentExercise();
  const isLastExercise = currentExerciseIndex >= (workoutTemplate?.exercises?.length || 1) - 1;
  const canComplete = currentSetData.reps || currentSetData.duration;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{currentWorkout?.name}</Text>
          <TouchableOpacity onPress={finishWorkout} style={styles.finishButton}>
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>

        {/* Workout Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(calculateCalories())}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedSets.length}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
        </View>

        {/* Rest Timer */}
        {isResting && (
          <View style={styles.restContainer}>
            <Text style={styles.restTitle}>Rest Time</Text>
            <Text style={styles.restTimer}>{formatTime(restTimer)}</Text>
            <TouchableOpacity onPress={skipRest} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current Exercise */}
        {currentExercise && !isResting && (
          <ScrollView style={styles.content}>
            <View style={styles.exerciseContainer}>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.exerciseCategory}>{currentExercise.category}</Text>
              <Text style={styles.setNumber}>Set {currentSetIndex + 1}</Text>

              {/* Exercise Inputs */}
              <View style={styles.inputsContainer}>
                {currentExercise.category === 'strength' ? (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Reps</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => setCurrentSetData(prev => ({
                          ...prev,
                          reps: Math.max(0, (prev.reps || 0) - 1)
                        }))}
                      >
                        <Text style={styles.counterButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{currentSetData.reps || 0}</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => setCurrentSetData(prev => ({
                          ...prev,
                          reps: (prev.reps || 0) + 1
                        }))}
                      >
                        <Text style={styles.counterButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Weight (lbs)</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => setCurrentSetData(prev => ({
                          ...prev,
                          weight: Math.max(0, (prev.weight || 0) - 5)
                        }))}
                      >
                        <Text style={styles.counterButtonText}>-5</Text>
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{currentSetData.weight || 0}</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => setCurrentSetData(prev => ({
                          ...prev,
                          weight: (prev.weight || 0) + 5
                        }))}
                      >
                        <Text style={styles.counterButtonText}>+5</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Duration (min)</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => setCurrentSetData(prev => ({
                          ...prev,
                          duration: Math.max(0, (prev.duration || 0) - 60)
                        }))}
                      >
                        <Text style={styles.counterButtonText}>-1</Text>
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{Math.floor((currentSetData.duration || 0) / 60)}</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => setCurrentSetData(prev => ({
                          ...prev,
                          duration: (prev.duration || 0) + 60
                        }))}
                      >
                        <Text style={styles.counterButtonText}>+1</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Distance (m)</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => setCurrentSetData(prev => ({
                          ...prev,
                          distance: Math.max(0, (prev.distance || 0) - 100)
                        }))}
                      >
                        <Text style={styles.counterButtonText}>-100</Text>
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{currentSetData.distance || 0}</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => setCurrentSetData(prev => ({
                          ...prev,
                          distance: (prev.distance || 0) + 100
                        }))}
                      >
                        <Text style={styles.counterButtonText}>+100</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, !canComplete && styles.disabledButton]}
                  onPress={completeSet}
                  disabled={!canComplete}
                >
                  <Text style={styles.actionButtonText}>Complete Set</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={nextSet}
                >
                  <Text style={styles.secondaryButtonText}>Add Another Set</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={nextExercise}
                >
                  <Text style={styles.secondaryButtonText}>
                    {isLastExercise ? 'Finish Workout' : 'Next Exercise'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Previous Sets Summary */}
            {completedSets.length > 0 && (
              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Completed Sets</Text>
                {completedSets.slice(-3).map((set, index) => {
                  const exercise = exerciseDatabase.find(ex => ex.id === set.exerciseId);
                  return (
                    <View key={set.id} style={styles.historyItem}>
                      <Text style={styles.historyExercise}>{exercise?.name}</Text>
                      <Text style={styles.historyDetails}>
                        Set {set.setNumber}: {set.reps && `${set.reps} reps`}
                        {set.weight && ` × ${set.weight}lbs`}
                        {set.duration && ` ${Math.floor(set.duration / 60)}min`}
                        {set.distance && ` × ${set.distance}m`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  finishButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  restContainer: {
    backgroundColor: '#DC2626',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  restTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  skipButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseContainer: {
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  setNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputsContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    width: 100,
    textAlign: 'right',
  },
  counterButton: {
    backgroundColor: '#4B5563',
    width: 50,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    minWidth: 60,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6B7280',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#4B5563',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  historyContainer: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  historyExercise: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  historyDetails: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});