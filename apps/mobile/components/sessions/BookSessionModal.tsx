import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { sessionService } from '../../lib/sessions';

interface Trainer {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  experience: string;
  avatar: string;
  pricePerHour: number;
  availability: {
    [date: string]: string[]; // available time slots
  };
}

interface BookSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onBookingComplete: (booking: any) => void;
}

export function BookSessionModal({
  visible,
  onClose,
  onBookingComplete,
}: BookSessionModalProps) {
  const { user } = useAuth();
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<'personal' | 'group'>('personal');
  const [sessionGoal, setSessionGoal] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [step, setStep] = useState<'trainers' | 'schedule' | 'details' | 'confirm'>('trainers');

  // Mock trainers data - in real app this would come from API
  const trainers: Trainer[] = [
    {
      id: 'trainer1',
      name: 'Sarah Johnson',
      specialties: ['Strength Training', 'Weight Loss', 'HIIT'],
      rating: 4.9,
      experience: '5+ years',
      avatar: '💪',
      pricePerHour: 75,
      availability: {
        [getDateString(0)]: ['09:00', '10:00', '14:00', '15:00', '16:00'],
        [getDateString(1)]: ['08:00', '09:00', '13:00', '14:00', '17:00'],
        [getDateString(2)]: ['10:00', '11:00', '15:00', '16:00'],
      },
    },
    {
      id: 'trainer2',
      name: 'Mike Chen',
      specialties: ['Cardio', 'Endurance', 'Running'],
      rating: 4.8,
      experience: '7+ years',
      avatar: '🏃‍♂️',
      pricePerHour: 80,
      availability: {
        [getDateString(0)]: ['08:00', '11:00', '13:00', '17:00'],
        [getDateString(1)]: ['09:00', '10:00', '15:00', '16:00', '18:00'],
        [getDateString(2)]: ['08:00', '12:00', '14:00', '16:00'],
      },
    },
    {
      id: 'trainer3',
      name: 'Emma Wilson',
      specialties: ['Yoga', 'Flexibility', 'Mindfulness'],
      rating: 5.0,
      experience: '4+ years',
      avatar: '🧘‍♀️',
      pricePerHour: 70,
      availability: {
        [getDateString(0)]: ['07:00', '12:00', '16:00', '18:00'],
        [getDateString(1)]: ['08:00', '11:00', '14:00', '17:00'],
        [getDateString(2)]: ['09:00', '13:00', '15:00', '19:00'],
      },
    },
  ];

  function getDateString(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  const getAvailableDates = () => {
    if (!selectedTrainer) return [];
    return Object.keys(selectedTrainer.availability).sort();
  };

  const getAvailableTimeSlots = () => {
    if (!selectedTrainer || !selectedDate) return [];
    return selectedTrainer.availability[selectedDate] || [];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleBookSession = async () => {
    if (!selectedTrainer || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a trainer, date, and time.');
      return;
    }

    const booking = {
      id: Date.now().toString(),
      traineeId: user?.uid || 'demo',
      trainerId: selectedTrainer.id,
      trainerName: selectedTrainer.name,
      date: selectedDate,
      time: selectedTime,
      sessionType,
      sessionGoal,
      notes,
      price: selectedTrainer.pricePerHour,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      // Save session using session service
      const sessionData = {
        traineeId: user?.uid || 'demo',
        trainerId: selectedTrainer.id,
        trainerName: selectedTrainer.name,
        sessionType: sessionGoal || sessionType,
        date: selectedDate,
        time: selectedTime,
        duration: 60, // Default 60 minutes
        price: selectedTrainer.pricePerHour,
        goals: sessionGoal ? [sessionGoal] : [],
        notes,
      };

      const bookedSession = await sessionService.bookSession(sessionData);
      console.log('Session booked successfully:', bookedSession);

      Alert.alert(
        'Session Booked! 🎉',
        `Your ${sessionType} session with ${selectedTrainer.name} is scheduled for ${formatDate(selectedDate)} at ${selectedTime}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onBookingComplete(booking);
              onClose();
              resetForm();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error booking session:', error);
      Alert.alert('Error', 'Failed to book session. Please try again.');
    }
  };

  const resetForm = () => {
    setSelectedTrainer(null);
    setSelectedDate('');
    setSelectedTime('');
    setSessionType('personal');
    setSessionGoal('');
    setNotes('');
    setStep('trainers');
  };

  const renderTrainerStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose Your Trainer</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {trainers.map(trainer => (
          <TouchableOpacity
            key={trainer.id}
            style={[
              styles.trainerCard,
              selectedTrainer?.id === trainer.id && styles.trainerCardSelected,
            ]}
            onPress={() => setSelectedTrainer(trainer)}
          >
            <View style={styles.trainerHeader}>
              <Text style={styles.trainerAvatar}>{trainer.avatar}</Text>
              <View style={styles.trainerInfo}>
                <Text style={styles.trainerName}>{trainer.name}</Text>
                <Text style={styles.trainerExperience}>{trainer.experience}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>⭐ {trainer.rating}</Text>
                  <Text style={styles.price}>${trainer.pricePerHour}/hr</Text>
                </View>
              </View>
            </View>

            <View style={styles.specialtiesContainer}>
              {trainer.specialties.map(specialty => (
                <View key={specialty} style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderScheduleStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>

      {/* Date Selection */}
      <Text style={styles.sectionLabel}>Available Dates</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        {getAvailableDates().map(date => (
          <TouchableOpacity
            key={date}
            style={[
              styles.dateCard,
              selectedDate === date && styles.dateCardSelected,
            ]}
            onPress={() => {
              setSelectedDate(date);
              setSelectedTime(''); // Reset time when date changes
            }}
          >
            <Text style={[
              styles.dateText,
              selectedDate === date && styles.dateTextSelected,
            ]}>
              {formatDate(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Time Selection */}
      {selectedDate && (
        <>
          <Text style={styles.sectionLabel}>Available Times</Text>
          <View style={styles.timeGrid}>
            {getAvailableTimeSlots().map(time => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.timeTextSelected,
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Session Details</Text>

      {/* Session Type */}
      <Text style={styles.sectionLabel}>Session Type</Text>
      <View style={styles.sessionTypeContainer}>
        <TouchableOpacity
          style={[
            styles.sessionTypeButton,
            sessionType === 'personal' && styles.sessionTypeButtonSelected,
          ]}
          onPress={() => setSessionType('personal')}
        >
          <Text style={[
            styles.sessionTypeText,
            sessionType === 'personal' && styles.sessionTypeTextSelected,
          ]}>
            Personal Training
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sessionTypeButton,
            sessionType === 'group' && styles.sessionTypeButtonSelected,
          ]}
          onPress={() => setSessionType('group')}
        >
          <Text style={[
            styles.sessionTypeText,
            sessionType === 'group' && styles.sessionTypeTextSelected,
          ]}>
            Group Session
          </Text>
        </TouchableOpacity>
      </View>

      {/* Session Goal */}
      <Text style={styles.sectionLabel}>What's your goal for this session?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g., Weight loss, strength building, technique improvement..."
        placeholderTextColor="#9CA3AF"
        value={sessionGoal}
        onChangeText={setSessionGoal}
        multiline
      />

      {/* Additional Notes */}
      <Text style={styles.sectionLabel}>Additional Notes (Optional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Any specific requests or information for your trainer..."
        placeholderTextColor="#9CA3AF"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirm Booking</Text>

      <View style={styles.confirmationCard}>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Trainer:</Text>
          <Text style={styles.confirmationValue}>{selectedTrainer?.name}</Text>
        </View>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Date:</Text>
          <Text style={styles.confirmationValue}>{formatDate(selectedDate)}</Text>
        </View>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Time:</Text>
          <Text style={styles.confirmationValue}>{selectedTime}</Text>
        </View>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Type:</Text>
          <Text style={styles.confirmationValue}>
            {sessionType === 'personal' ? 'Personal Training' : 'Group Session'}
          </Text>
        </View>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Price:</Text>
          <Text style={styles.confirmationPrice}>${selectedTrainer?.pricePerHour}</Text>
        </View>

        {sessionGoal && (
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Goal:</Text>
            <Text style={styles.confirmationValue}>{sessionGoal}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const getNextButtonText = () => {
    switch (step) {
      case 'trainers': return 'Select Schedule';
      case 'schedule': return 'Add Details';
      case 'details': return 'Review Booking';
      case 'confirm': return 'Book Session';
      default: return 'Next';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'trainers': return selectedTrainer !== null;
      case 'schedule': return selectedDate && selectedTime;
      case 'details': return sessionGoal.trim().length > 0;
      case 'confirm': return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 'trainers') setStep('schedule');
    else if (step === 'schedule') setStep('details');
    else if (step === 'details') setStep('confirm');
    else if (step === 'confirm') handleBookSession();
  };

  const handleBack = () => {
    if (step === 'schedule') setStep('trainers');
    else if (step === 'details') setStep('schedule');
    else if (step === 'confirm') setStep('details');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Book Session</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {['trainers', 'schedule', 'details', 'confirm'].map((stepName, index) => (
            <View
              key={stepName}
              style={[
                styles.progressDot,
                (step === stepName || index < ['trainers', 'schedule', 'details', 'confirm'].indexOf(step)) && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Step Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 'trainers' && renderTrainerStep()}
          {step === 'schedule' && renderScheduleStep()}
          {step === 'details' && renderDetailsStep()}
          {step === 'confirm' && renderConfirmStep()}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          {step !== 'trainers' && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled,
              step === 'trainers' && styles.nextButtonFull,
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>{getNextButtonText()}</Text>
          </TouchableOpacity>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    backgroundColor: '#2563EB',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  trainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainerCardSelected: {
    borderColor: '#2563EB',
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trainerAvatar: {
    fontSize: 40,
    marginRight: 16,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  trainerExperience: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#F59E0B',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specialtyText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 20,
  },
  dateScroll: {
    marginBottom: 20,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateCardSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeSlotSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeTextSelected: {
    color: '#FFFFFF',
  },
  sessionTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sessionTypeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  sessionTypeButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  sessionTypeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sessionTypeTextSelected: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  confirmationLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  confirmationValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  confirmationPrice: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});