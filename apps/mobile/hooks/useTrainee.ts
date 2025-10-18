import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { TraineeService, type TraineeData, type TrainerData } from '../lib/traineeService';

/**
 * Hook to fetch and manage trainee data for the logged-in user
 */
export function useTrainee() {
  const { user } = useAuth();
  const [trainee, setTrainee] = useState<TraineeData | null>(null);
  const [trainer, setTrainer] = useState<TrainerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    loadTraineeData();
  }, [user?.uid]);

  const loadTraineeData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch trainee data
      const traineeData = await TraineeService.getTraineeByUserId(user.uid);

      if (!traineeData) {
        setError('No trainee profile found. Please contact your trainer.');
        setLoading(false);
        return;
      }

      setTrainee(traineeData);

      // Fetch trainer data
      const trainerData = await TraineeService.getTrainerByUserId(user.uid);
      if (trainerData) {
        setTrainer(trainerData);
      }

    } catch (err) {
      console.error('Error loading trainee data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trainee data');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadTraineeData();
  };

  return {
    trainee,
    trainer,
    loading,
    error,
    refresh,
  };
}
