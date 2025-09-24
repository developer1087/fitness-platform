import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { exerciseDatabase } from '../../lib/shared-types';

interface ExerciseLibraryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: any) => void;
}

export function ExerciseLibraryModal({
  visible,
  onClose,
  onSelectExercise,
}: ExerciseLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All', color: '#6B7280' },
    { id: 'strength', name: 'Strength', color: '#2563EB' },
    { id: 'cardio', name: 'Cardio', color: '#DC2626' },
    { id: 'flexibility', name: 'Flexibility', color: '#059669' },
    { id: 'balance', name: 'Balance', color: '#7C3AED' },
  ];

  const filteredExercises = exerciseDatabase.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscleGroups.some(muscle =>
                           muscle.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesCategory = !selectedCategory || selectedCategory === 'all' ||
                           exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectExercise = (exercise: any) => {
    onSelectExercise(exercise);
    onClose();
  };

  const renderExerciseCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleSelectExercise(item)}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(item.category) },
          ]}
        >
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      <Text style={styles.muscleGroups}>
        Target: {item.muscleGroups.join(', ')}
      </Text>

      {item.equipment && item.equipment.length > 0 && (
        <Text style={styles.equipment}>
          Equipment: {item.equipment.join(', ')}
        </Text>
      )}

      <View style={styles.exerciseActions}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => handleSelectExercise(item)}
        >
          <Text style={styles.selectButtonText}>Select Exercise</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return '#2563EB';
      case 'cardio': return '#DC2626';
      case 'flexibility': return '#059669';
      case 'balance': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Exercise Library</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises or muscle groups..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === category.id ? category.color : '#F3F4F6',
                  borderColor: category.color,
                },
              ]}
              onPress={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  { color: selectedCategory === category.id ? '#FFFFFF' : category.color },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Exercise List */}
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseCard}
          keyExtractor={item => item.id}
          style={styles.exercisesList}
          contentContainerStyle={styles.exercisesContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Results Info */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      </View>
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
  placeholder: {
    width: 60,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exercisesList: {
    flex: 1,
  },
  exercisesContent: {
    padding: 20,
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
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
  muscleGroups: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  equipment: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  exerciseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  selectButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsInfo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resultsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});