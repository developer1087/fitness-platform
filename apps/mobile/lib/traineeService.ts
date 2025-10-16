import firestore from '@react-native-firebase/firestore';

export interface TraineeData {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  trainerId: string;
  status: 'pending' | 'active' | 'inactive';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
}

/**
 * Service for trainee-related Firestore operations
 */
export class TraineeService {
  private static TRAINEES_COLLECTION = 'trainees';
  private static TRAINERS_COLLECTION = 'trainers';

  /**
   * Get trainee data by Firebase Auth user ID
   */
  static async getTraineeByUserId(userId: string): Promise<TraineeData | null> {
    try {
      const querySnapshot = await firestore()
        .collection(this.TRAINEES_COLLECTION)
        .where('userId', '==', userId)
        .get();

      if (querySnapshot.empty) {
        console.log('No trainee found for userId:', userId);
        return null;
      }

      const traineeDoc = querySnapshot.docs[0];
      return {
        id: traineeDoc.id,
        ...traineeDoc.data()
      } as TraineeData;
    } catch (error) {
      console.error('Error fetching trainee by userId:', error);
      throw error;
    }
  }

  /**
   * Get trainee data by trainee ID
   */
  static async getTraineeById(traineeId: string): Promise<TraineeData | null> {
    try {
      const traineeDoc = await firestore()
        .collection(this.TRAINEES_COLLECTION)
        .doc(traineeId)
        .get();

      if (!traineeDoc.exists) {
        console.log('No trainee found for ID:', traineeId);
        return null;
      }

      return {
        id: traineeDoc.id,
        ...traineeDoc.data()
      } as TraineeData;
    } catch (error) {
      console.error('Error fetching trainee by ID:', error);
      throw error;
    }
  }

  /**
   * Get trainer data for a trainee
   */
  static async getTrainerForTrainee(traineeId: string): Promise<TrainerData | null> {
    try {
      const trainee = await this.getTraineeById(traineeId);
      if (!trainee) {
        return null;
      }

      const trainerDoc = await firestore()
        .collection(this.TRAINERS_COLLECTION)
        .doc(trainee.trainerId)
        .get();

      if (!trainerDoc.exists) {
        console.log('No trainer found for ID:', trainee.trainerId);
        return null;
      }

      return {
        id: trainerDoc.id,
        ...trainerDoc.data()
      } as TrainerData;
    } catch (error) {
      console.error('Error fetching trainer:', error);
      throw error;
    }
  }

  /**
   * Get trainer data by user ID
   */
  static async getTrainerByUserId(userId: string): Promise<TrainerData | null> {
    try {
      // First, get the trainee to find their trainer ID
      const trainee = await this.getTraineeByUserId(userId);
      if (!trainee) {
        console.log('No trainee found, cannot fetch trainer');
        return null;
      }

      const trainerDoc = await firestore()
        .collection(this.TRAINERS_COLLECTION)
        .doc(trainee.trainerId)
        .get();

      if (!trainerDoc.exists) {
        console.log('No trainer found for ID:', trainee.trainerId);
        return null;
      }

      return {
        id: trainerDoc.id,
        ...trainerDoc.data()
      } as TrainerData;
    } catch (error) {
      console.error('Error fetching trainer by user ID:', error);
      throw error;
    }
  }

  /**
   * Update trainee status (e.g., pending → active)
   */
  static async updateTraineeStatus(
    userId: string,
    status: 'pending' | 'active' | 'inactive'
  ): Promise<void> {
    try {
      const trainee = await this.getTraineeByUserId(userId);
      if (!trainee) {
        console.log('No trainee found for userId:', userId);
        return;
      }

      await firestore()
        .collection(this.TRAINEES_COLLECTION)
        .doc(trainee.id)
        .update({
          status,
          updatedAt: new Date().toISOString(),
        });

      console.log(`✅ Trainee status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating trainee status:', error);
      throw error;
    }
  }

  /**
   * Update trainee by phone number and link to userId
   * This is used when trainee signs up without an invitation token
   */
  static async updateTraineeByPhone(
    phoneNumber: string,
    userId: string,
    status: 'pending' | 'active' | 'inactive'
  ): Promise<void> {
    try {
      const trainee = await this.getTraineeByPhone(phoneNumber);
      if (!trainee) {
        console.log('No trainee found for phone:', phoneNumber);
        return;
      }

      await firestore()
        .collection(this.TRAINEES_COLLECTION)
        .doc(trainee.id)
        .update({
          userId,
          status,
          updatedAt: new Date().toISOString(),
        });

      console.log(`✅ Trainee linked to userId and status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating trainee by phone:', error);
      throw error;
    }
  }

  /**
   * Get trainee by phone number
   */
  static async getTraineeByPhone(phoneNumber: string): Promise<TraineeData | null> {
    try {
      const querySnapshot = await firestore()
        .collection(this.TRAINEES_COLLECTION)
        .where('phone', '==', phoneNumber)
        .get();

      if (querySnapshot.empty) {
        console.log('No trainee found for phone:', phoneNumber);
        return null;
      }

      const traineeDoc = querySnapshot.docs[0];
      return {
        id: traineeDoc.id,
        ...traineeDoc.data()
      } as TraineeData;
    } catch (error) {
      console.error('Error fetching trainee by phone:', error);
      throw error;
    }
  }

  /**
   * Accept invitation and update trainee status to active
   * This is called after trainee completes phone auth signup
   */
  static async acceptInvitation(invitationToken: string, userId: string): Promise<void> {
    try {
      console.log('🎟️ Accepting invitation with token:', invitationToken);

      // Get invitation by token
      const invitationsSnapshot = await firestore()
        .collection('trainee_invitations')
        .where('inviteToken', '==', invitationToken)
        .where('status', '==', 'pending')
        .get();

      if (invitationsSnapshot.empty) {
        console.warn('⚠️ No pending invitation found for token:', invitationToken);
        throw new Error('Invalid or expired invitation token');
      }

      const invitationDoc = invitationsSnapshot.docs[0];
      const invitationId = invitationDoc.id;

      // Update invitation status to accepted
      await firestore()
        .collection('trainee_invitations')
        .doc(invitationId)
        .update({
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
        });

      console.log('✅ Invitation marked as accepted:', invitationId);

      // Find trainee record by invitationId
      const traineesSnapshot = await firestore()
        .collection(this.TRAINEES_COLLECTION)
        .where('invitationId', '==', invitationId)
        .get();

      if (!traineesSnapshot.empty) {
        const traineeDoc = traineesSnapshot.docs[0];

        // Update trainee with userId and set status to active
        await firestore()
          .collection(this.TRAINEES_COLLECTION)
          .doc(traineeDoc.id)
          .update({
            userId,
            status: 'active',
            updatedAt: new Date().toISOString(),
          });

        console.log('✅ Trainee status updated to active:', traineeDoc.id);

        // Update user role to 'trainee' in users collection
        await firestore()
          .collection('users')
          .doc(userId)
          .update({
            role: 'trainee',
          });

        console.log('✅ User role updated to trainee');
      } else {
        console.warn('⚠️ No trainee record found for invitationId:', invitationId);
      }
    } catch (error) {
      console.error('❌ Error accepting invitation:', error);
      throw error;
    }
  }
}

export default TraineeService;
