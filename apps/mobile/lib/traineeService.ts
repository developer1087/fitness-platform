import { db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

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
      const traineesRef = collection(db, this.TRAINEES_COLLECTION);
      const q = query(traineesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

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
      const traineeRef = doc(db, this.TRAINEES_COLLECTION, traineeId);
      const traineeDoc = await getDoc(traineeRef);

      if (!traineeDoc.exists()) {
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

      const trainerRef = doc(db, this.TRAINERS_COLLECTION, trainee.trainerId);
      const trainerDoc = await getDoc(trainerRef);

      if (!trainerDoc.exists()) {
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

      const trainerRef = doc(db, this.TRAINERS_COLLECTION, trainee.trainerId);
      const trainerDoc = await getDoc(trainerRef);

      if (!trainerDoc.exists()) {
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
}

export default TraineeService;
