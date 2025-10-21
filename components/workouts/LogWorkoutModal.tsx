import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  workoutLogSchema,
  type WorkoutLogFormData,
  type Workout,
  exerciseDatabase,
} from '../../lib/shared-types';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';

interface LogWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (workoutData: WorkoutLogFormData) => void;
  initialWorkout?: Workout | null;
}

export function LogWorkoutModal({
  visible,
  onClose,
  onSave,
  initialWorkout,
}: LogWorkoutModalProps) {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkoutLogFormData>({
    resolver: zodResolver(workoutLogSchema),
    defaultValues: {
      name: initialWorkout?.name || '',
      exercises: [],
      notes: '',
    },
  });

  const { fields: exerciseFields, append, remove } = useFieldArray({
    control,
    name: 'exercises',
  });

  useEffect(() => {
    if (initialWorkout) {
      setValue('name', initialWorkout.name);
      if (initialWorkout.exercises.length > 0) {
        const exerciseMap = new Map();
        initialWorkout.exercises.forEach((exercise) => {
          if (!exerciseMap.has(exercise.exerciseId)) {
            exerciseMap.set(exercise.exerciseId, {
              exerciseId: exercise.exerciseId,
              sets: [],
            });
          }
          exerciseMap.get(exercise.exerciseId).sets.push({
            reps: exercise.reps,
            weight: exercise.weight,
            duration: exercise.duration,
            distance: exercise.distance,
            notes: exercise.notes,
          });
        });
        setValue('exercises', Array.from(exerciseMap.values()));
      }
    }
  }, [initialWorkout, setValue]);

  const addExercise = (exerciseId: string) => {
    append({
      exerciseId,
      sets: [{ reps: 0, weight: 0 }],
    });
    setSelectedExercises([...selectedExercises, exerciseId]);
    setShowExerciseSelector(false);
  };

  const handleSelectExerciseFromLibrary = (exercise: any) => {
    addExercise(exercise.id);
    setShowExerciseLibrary(false);
  };

  const removeExercise = (index: number) => {
    const exerciseId = exerciseFields[index].exerciseId;
    setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
    remove(index);
  };

  const addSet = (exerciseIndex: number) => {
    const currentExercise = exerciseFields[exerciseIndex];
    setValue(`exercises.${exerciseIndex}.sets`, [
      ...currentExercise.sets,
      { reps: 0, weight: 0 },
    ]);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const currentExercise = exerciseFields[exerciseIndex];
    const newSets = currentExercise.sets.filter((_, i) => i !== setIndex);
    setValue(`exercises.${exerciseIndex}.sets`, newSets);
  };

  const onSubmit = (data: WorkoutLogFormData) => {
    if (data.exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise to your workout.');
      return;
    }
    onSave(data);
    reset();
    setSelectedExercises([]);
  };

  const handleClose = () => {
    reset();
    setSelectedExercises([]);
    onClose();
  };

  const getExerciseName = (exerciseId: string) => {
    return exerciseDatabase.find(ex => ex.id === exerciseId)?.name || exerciseId;
  };

  const getExerciseCategory = (exerciseId: string) => {
    return exerciseDatabase.find(ex => ex.id === exerciseId)?.category || 'strength';
  };

  const availableExercises = exerciseDatabase.filter(
    ex => !selectedExercises.includes(ex.id)
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Log Workout</Text>
          <TouchableOpacity onPress={handleSubmit(onSubmit)}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Workout Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Workout Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Enter workout name"
                  placeholderTextColor="#9CA3AF"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>

          {/* Exercises */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Exercises</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowExerciseLibrary(true)}
              >
                <Text style={styles.addButtonText}>+ Add Exercise</Text>
              </TouchableOpacity>
            </View>

            {exerciseFields.map((exercise, exerciseIndex) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View>
                    <Text style={styles.exerciseName}>
                      {getExerciseName(exercise.exerciseId)}
                    </Text>
                    <Text style={styles.exerciseCategory}>
                      {getExerciseCategory(exercise.exerciseId)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeExercise(exerciseIndex)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                {/* Sets */}
                {exercise.sets.map((set, setIndex) => (
                  <View key={setIndex} style={styles.setRow}>
                    <Text style={styles.setNumber}>Set {setIndex + 1}</Text>

                    <View style={styles.setInputs}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Reps</Text>
                        <Controller
                          control={control}
                          name={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              style={styles.setInput}
                              placeholder="0"
                              placeholderTextColor="#9CA3AF"
                              value={value?.toString() || ''}
                              onChangeText={(text) => onChange(parseInt(text) || 0)}
                              keyboardType="numeric"
                            />
                          )}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Weight (lbs)</Text>
                        <Controller
                          control={control}
                          name={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              style={styles.setInput}
                              placeholder="0"
                              placeholderTextColor="#9CA3AF"
                              value={value?.toString() || ''}
                              onChangeText={(text) => onChange(parseFloat(text) || 0)}
                              keyboardType="numeric"
                            />
                          )}
                        />
                      </View>

                      {getExerciseCategory(exercise.exerciseId) === 'cardio' && (
                        <>
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Duration (min)</Text>
                            <Controller
                              control={control}
                              name={`exercises.${exerciseIndex}.sets.${setIndex}.duration`}
                              render={({ field: { onChange, value } }) => (
                                <TextInput
                                  style={styles.setInput}
                                  placeholder="0"
                                  placeholderTextColor="#9CA3AF"
                                  value={value ? (value / 60).toString() : ''}
                                  onChangeText={(text) => onChange((parseFloat(text) || 0) * 60)}
                                  keyboardType="numeric"
                                />
                              )}
                            />
                          </View>

                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Distance (m)</Text>
                            <Controller
                              control={control}
                              name={`exercises.${exerciseIndex}.sets.${setIndex}.distance`}
                              render={({ field: { onChange, value } }) => (
                                <TextInput
                                  style={styles.setInput}
                                  placeholder="0"
                                  placeholderTextColor="#9CA3AF"
                                  value={value?.toString() || ''}
                                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                                  keyboardType="numeric"
                                />
                              )}
                            />
                          </View>
                        </>
                      )}
                    </View>

                    {exercise.sets.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeSet(exerciseIndex, setIndex)}
                        style={styles.removeSetButton}
                      >
                        <Text style={styles.removeSetButtonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addSetButton}
                  onPress={() => addSet(exerciseIndex)}
                >
                  <Text style={styles.addSetButtonText}>+ Add Set</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea]}
                  placeholder="Add any notes about your workout..."
                  placeholderTextColor="#9CA3AF"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                />
              )}
            />
          </View>
        </ScrollView>

        {/* Exercise Selector Modal */}
        <Modal
          visible={showExerciseSelector}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.selectorContainer}>
            <View style={styles.selectorHeader}>
              <TouchableOpacity onPress={() => setShowExerciseSelector(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.selectorTitle}>Select Exercise</Text>
              <View />
            </View>

            <ScrollView style={styles.selectorContent}>
              {availableExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseOption}
                  onPress={() => addExercise(exercise.id)}
                >
                  <View>
                    <Text style={styles.exerciseOptionName}>{exercise.name}</Text>
                    <Text style={styles.exerciseOptionCategory}>
                      {exercise.category} • {exercise.muscleGroups.join(', ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>

        {/* Exercise Library Modal */}
        <ExerciseLibraryModal
          visible={showExerciseLibrary}
          onClose={() => setShowExerciseLibrary(false)}
          onSelectExercise={handleSelectExerciseFromLibrary}
        />
      </KeyboardAvoidingView>
    </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  removeButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    width: 50,
  },
  setInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  setInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  removeSetButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addSetButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addSetButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  selectorContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectorContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseOption: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  exerciseOptionCategory: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
});