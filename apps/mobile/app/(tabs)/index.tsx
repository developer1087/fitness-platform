import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { router } from 'expo-router';
import { LogWorkoutModal } from '../../components/workouts/LogWorkoutModal';
import { LiveWorkoutScreen } from '../../components/workouts/LiveWorkoutScreen';
import { BookSessionModal } from '../../components/sessions/BookSessionModal';
import { TrainerDashboard } from '../../components/trainer/TrainerDashboard';
import { ConversationsList } from '../../components/messaging/ConversationsList';
import { MessageNotificationBadge } from '../../components/messaging/MessageNotificationBadge';
import { workoutService } from '../../lib/workouts';
import { workoutTemplates } from '../../lib/shared-types';
import { sessionService } from '../../lib/sessions';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [showLogWorkoutModal, setShowLogWorkoutModal] = useState(false);
  const [showLiveWorkout, setShowLiveWorkout] = useState(false);
  const [showBookSessionModal, setShowBookSessionModal] = useState(false);
  const [showTrainerDashboard, setShowTrainerDashboard] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({
    workoutsCompleted: 0,
    caloriesBurned: 0,
    minutesActive: 0,
    currentStreak: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (user?.uid) {
      loadTodayStats();
      loadUpcomingSessions();
    }
  }, [user]);

  const loadTodayStats = async () => {
    try {
      setLoading(true);
      const stats = await workoutService.getTodayStats(user?.uid || 'demo');
      setTodayStats(stats);
    } catch (error) {
      console.error('Error loading today stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingSessions = async () => {
    try {
      const sessions = await sessionService.getUserSessions(user?.uid || 'demo');
      const todayDate = new Date().toISOString().split('T')[0];
      const upcoming = sessions
        .filter(session =>
          session.status === 'scheduled' &&
          session.date >= todayDate
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Show only next 3 sessions
      setUpcomingSessions(upcoming);
    } catch (error) {
      console.error('Error loading upcoming sessions:', error);
    }
  };


  const quickActions = [
    { id: 1, title: 'Start Workout', icon: '💪', color: '#2563EB' },
    { id: 2, title: 'Log Exercise', icon: '📝', color: '#059669' },
    { id: 3, title: 'View Progress', icon: '📊', color: '#7C3AED' },
    { id: 4, title: 'Book Session', icon: '📅', color: '#DC2626' },
    { id: 5, title: 'Messages', icon: '💬', color: '#0EA5E9' },
  ];

  const handleQuickAction = (actionTitle: string) => {
    switch (actionTitle) {
      case 'Start Workout':
        // Start with a quick HIIT template for fast access
        const quickTemplate = workoutTemplates.find(t => t.id === 'quick_hiit');
        setSelectedTemplate(quickTemplate);
        setShowLiveWorkout(true);
        break;
      case 'Log Exercise':
        setShowLogWorkoutModal(true);
        break;
      case 'View Progress':
        router.push('/(tabs)/progress');
        break;
      case 'Book Session':
        setShowBookSessionModal(true);
        break;
      case 'Messages':
        setShowMessages(true);
        break;
      default:
        console.log(`${actionTitle} pressed`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowMessages(true)}
              style={styles.messageButton}
            >
              <Text style={styles.messageIcon}>💬</Text>
              <MessageNotificationBadge userType="trainee" />
            </TouchableOpacity>
            <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayStats.workoutsCompleted}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayStats.caloriesBurned}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayStats.minutesActive}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderColor: action.color }]}
                onPress={() => handleQuickAction(action.title)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.workoutsContainer}>
          <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <View key={session.id} style={styles.workoutCard}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle}>{session.sessionType}</Text>
                  <Text style={styles.workoutTrainer}>with {session.trainerName}</Text>
                  <Text style={styles.workoutTime}>
                    {new Date(session.date).toLocaleDateString()} at {session.time} • {session.duration} min
                  </Text>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No sessions scheduled
              </Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => setShowBookSessionModal(true)}
              >
                <Text style={styles.bookButtonText}>Book a Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Demo Section */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>🔍 Demo: Trainer View</Text>
          <Text style={styles.demoDescription}>
            See how trainers can view all trainee data, workouts, and progress in real-time
          </Text>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setShowTrainerDashboard(true)}
          >
            <Text style={styles.demoButtonText}>View Trainer Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Motivation Quote */}
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationQuote}>
            "The only bad workout is the one that didn't happen."
          </Text>
          <Text style={styles.motivationAuthor}>- Unknown</Text>
        </View>
      </ScrollView>

      {/* Log Workout Modal */}
      <LogWorkoutModal
        visible={showLogWorkoutModal}
        onClose={() => setShowLogWorkoutModal(false)}
        onSave={async (workoutData) => {
          try {
            await workoutService.saveWorkout(user?.uid || 'demo', workoutData);
            setShowLogWorkoutModal(false);
            await loadTodayStats(); // Refresh stats after saving
          } catch (error) {
            console.error('Error saving workout:', error);
          }
        }}
      />

      {/* Live Workout Screen */}
      <LiveWorkoutScreen
        visible={showLiveWorkout}
        onClose={() => {
          setShowLiveWorkout(false);
          setSelectedTemplate(null);
          loadTodayStats(); // Refresh stats after live workout
        }}
        workoutTemplate={selectedTemplate}
      />

      {/* Book Session Modal */}
      <BookSessionModal
        visible={showBookSessionModal}
        onClose={() => setShowBookSessionModal(false)}
        onBookingComplete={(bookingData) => {
          console.log('Session booked:', bookingData);
          setShowBookSessionModal(false);
          loadUpcomingSessions(); // Refresh sessions list
        }}
      />

      {/* Trainer Dashboard */}
      <TrainerDashboard
        visible={showTrainerDashboard}
        onClose={() => setShowTrainerDashboard(false)}
      />

      {/* Messages */}
      <ConversationsList
        visible={showMessages}
        onClose={() => setShowMessages(false)}
        userType="trainee"
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
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    position: 'relative',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  messageIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  workoutsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  workoutTrainer: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  workoutTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  joinButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  motivationContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#2563EB',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  motivationQuote: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  motivationAuthor: {
    fontSize: 14,
    color: '#93C5FD',
    textAlign: 'center',
  },
  demoContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoDescription: {
    fontSize: 14,
    color: '#0369A1',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  demoButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
