import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { sessionService, TraineeProfile } from '../../lib/sessions';
import { messagingService } from '../../lib/messaging';
import { ChatScreen } from '../messaging/ChatScreen';

interface TrainerDashboardProps {
  visible: boolean;
  onClose: () => void;
  trainerId?: string;
}

export function TrainerDashboard({
  visible,
  onClose,
  trainerId = 'trainer1',
}: TrainerDashboardProps) {
  const [trainees, setTrainees] = useState<TraineeProfile[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeProfile | null>(null);
  const [showTraineeDetails, setShowTraineeDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatConversationId, setChatConversationId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadTrainees();
    }
  }, [visible]);

  const loadTrainees = async () => {
    try {
      setLoading(true);
      const traineesList = await sessionService.getTraineesByTrainer(trainerId);
      setTrainees(traineesList);
    } catch (error) {
      console.error('Error loading trainees:', error);
      Alert.alert('Error', 'Failed to load trainee data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTraineeDetails = async (trainee: TraineeProfile) => {
    try {
      const fullData = await sessionService.getTraineeFullData(trainee.id);
      if (fullData.profile) {
        setSelectedTrainee({
          ...fullData.profile,
          upcomingSessions: fullData.sessions.filter(s => s.status === 'scheduled'),
          pastSessions: fullData.sessions.filter(s => s.status === 'completed'),
        });
        setShowTraineeDetails(true);
      }
    } catch (error) {
      console.error('Error loading trainee details:', error);
      Alert.alert('Error', 'Failed to load detailed trainee information');
    }
  };

  const handleMessageTrainee = async (trainee: TraineeProfile) => {
    try {
      const conversationId = await messagingService.createConversation(
        trainerId,
        'Personal Trainer',
        trainee.id,
        trainee.name
      );
      setChatConversationId(conversationId);
      setSelectedTrainee(trainee);
      setShowChat(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  const renderTraineeCard = (trainee: TraineeProfile) => (
    <TouchableOpacity
      key={trainee.id}
      style={styles.traineeCard}
      onPress={() => handleViewTraineeDetails(trainee)}
    >
      <View style={styles.traineeHeader}>
        <View style={styles.traineeAvatar}>
          <Text style={styles.traineeInitial}>
            {trainee.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.traineeInfo}>
          <Text style={styles.traineeName}>{trainee.name}</Text>
          <Text style={styles.traineeLevel}>Level: {trainee.fitnessLevel}</Text>
        </View>
        <View style={styles.traineeActions}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => handleMessageTrainee(trainee)}
          >
            <Text style={styles.messageButtonText}>💬</Text>
          </TouchableOpacity>
          <View style={styles.traineeStats}>
            <Text style={styles.statNumber}>{trainee.stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
        </View>
      </View>

      <View style={styles.traineeMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{trainee.stats.currentStreak}</Text>
          <Text style={styles.metricLabel}>Day Streak</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{trainee.stats.totalSessions}</Text>
          <Text style={styles.metricLabel}>Sessions</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{Math.round(trainee.stats.totalCaloriesBurned)}</Text>
          <Text style={styles.metricLabel}>Calories</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{Math.round(trainee.stats.totalMinutesActive / 60)}h</Text>
          <Text style={styles.metricLabel}>Active</Text>
        </View>
      </View>

      {trainee.recentWorkouts.length > 0 && (
        <View style={styles.recentActivity}>
          <Text style={styles.recentTitle}>Recent Workout:</Text>
          <Text style={styles.recentWorkout}>
            {trainee.recentWorkouts[0].name} • {new Date(trainee.recentWorkouts[0].date).toLocaleDateString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTraineeDetails = () => {
    if (!selectedTrainee) return null;

    return (
      <Modal
        visible={showTraineeDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTraineeDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedTrainee.name} - Full Profile</Text>
            <TouchableOpacity
              onPress={() => setShowTraineeDetails(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailsContent}>
            {/* Goals and Preferences */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Goals & Preferences</Text>
              <Text style={styles.sectionText}>
                Goals: {selectedTrainee.goals.join(', ') || 'Not specified'}
              </Text>
              <Text style={styles.sectionText}>
                Fitness Level: {selectedTrainee.fitnessLevel}
              </Text>
              <Text style={styles.sectionText}>
                Preferred Sessions: {selectedTrainee.preferences.sessionTypes.join(', ') || 'Not specified'}
              </Text>
            </View>

            {/* Recent Workouts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Workouts ({selectedTrainee.recentWorkouts.length})</Text>
              {selectedTrainee.recentWorkouts.slice(0, 5).map((workout, index) => (
                <View key={workout.id} style={styles.workoutItem}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDetails}>
                    {new Date(workout.date).toLocaleDateString()} • {workout.duration} min • {workout.caloriesBurned} cal
                  </Text>
                  <Text style={styles.exerciseCount}>
                    {workout.exercises.length} exercises
                  </Text>
                </View>
              ))}
            </View>

            {/* Upcoming Sessions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Sessions ({selectedTrainee.upcomingSessions.length})</Text>
              {selectedTrainee.upcomingSessions.map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                  <Text style={styles.sessionType}>{session.sessionType}</Text>
                  <Text style={styles.sessionDetails}>
                    {new Date(session.date).toLocaleDateString()} at {session.time}
                  </Text>
                  <Text style={styles.sessionGoals}>
                    Goals: {session.goals?.join(', ') || 'General fitness'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Completed Sessions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Completed Sessions ({selectedTrainee.pastSessions.length})</Text>
              {selectedTrainee.pastSessions.slice(0, 3).map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                  <Text style={styles.sessionType}>{session.sessionType}</Text>
                  <Text style={styles.sessionDetails}>
                    {new Date(session.date).toLocaleDateString()} • {session.duration} min
                  </Text>
                  {session.feedback && (
                    <Text style={styles.feedback}>
                      Rating: {session.feedback.traineeRating}/5 ⭐
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Trainer Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.subtitle}>Your Trainees ({trainees.length})</Text>
          <Text style={styles.description}>
            All trainee workout data, sessions, and progress are synchronized in real-time.
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading trainee data...</Text>
            </View>
          ) : trainees.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No trainees found</Text>
              <Text style={styles.emptySubtext}>
                Trainees will appear here once they book sessions with you
              </Text>
            </View>
          ) : (
            trainees.map(renderTraineeCard)
          )}
        </ScrollView>

        {renderTraineeDetails()}

        {/* Chat Screen */}
        {selectedTrainee && (
          <ChatScreen
            visible={showChat}
            onClose={() => {
              setShowChat(false);
              setSelectedTrainee(null);
              setChatConversationId('');
            }}
            conversationId={chatConversationId}
            otherUserId={selectedTrainee.id}
            otherUserName={selectedTrainee.name}
            otherUserType="trainee"
          />
        )}
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  traineeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  traineeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  traineeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  traineeInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  traineeInfo: {
    flex: 1,
  },
  traineeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  traineeLevel: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  traineeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 16,
  },
  traineeStats: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  traineeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  recentActivity: {
    marginTop: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recentWorkout: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  detailsContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  workoutItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  workoutDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  exerciseCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  sessionItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  sessionDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  sessionGoals: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  feedback: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
    fontWeight: '500',
  },
});