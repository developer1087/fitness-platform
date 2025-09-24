// Temporary shared types - copy from shared-types package
import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Signup schema
export const signupSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Reset password schema
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

// Trainee invitation schema
export const traineeInvitationSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  goals: z.array(z.string()).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// User profile schema
export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  userType: z.enum(['trainer', 'trainee']),
  trainerId: z.string().optional(), // Only for trainees
  profilePicture: z.string().optional(),
  phone: z.string().optional(),
  createdAt: z.string(), // ISO string
  updatedAt: z.string(), // ISO string
});

// Trainee invitation record
export const traineeInvitationRecordSchema = z.object({
  id: z.string(),
  trainerId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  goals: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'expired']),
  inviteToken: z.string(),
  invitedAt: z.string(), // ISO string
  acceptedAt: z.string().optional(), // ISO string
  expiresAt: z.string(), // ISO string
});

// Enhanced trainee schema with more fields
export const traineeSchema = z.object({
  id: z.string(),
  userId: z.string().optional(), // Links to user profile when they sign up
  trainerId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  profilePicture: z.string().optional(),
  joinDate: z.string(), // ISO string
  status: z.enum(['pending', 'active', 'inactive', 'trial']),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  goals: z.array(z.string()),
  notes: z.string().optional(),
  lastSession: z.string().optional(), // ISO string
  totalSessions: z.number().min(0),
  invitationId: z.string().optional(), // Links back to invitation record
});

// Exercise and workout schemas
export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Exercise name is required'),
  category: z.enum(['cardio', 'strength', 'flexibility', 'balance', 'sports']),
  muscleGroups: z.array(z.string()),
  equipment: z.array(z.string()).optional(),
  instructions: z.string().optional(),
});

export const exerciseSetSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  setNumber: z.number().min(1),
  reps: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  duration: z.number().min(0).optional(), // in seconds
  distance: z.number().min(0).optional(), // in meters
  restTime: z.number().min(0).optional(), // in seconds
  notes: z.string().optional(),
});

export const workoutSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1, 'Workout name is required'),
  date: z.string(), // ISO date string
  startTime: z.string().optional(), // ISO datetime string
  endTime: z.string().optional(), // ISO datetime string
  exercises: z.array(exerciseSetSchema),
  notes: z.string().optional(),
  totalCalories: z.number().min(0).optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'skipped']),
});

export const workoutLogSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    sets: z.array(z.object({
      reps: z.number().min(0).optional(),
      weight: z.number().min(0).optional(),
      duration: z.number().min(0).optional(),
      distance: z.number().min(0).optional(),
      notes: z.string().optional(),
    })),
  })),
  notes: z.string().optional(),
});

// Exercise database
export const exerciseDatabase = [
  {
    id: 'push_ups',
    name: 'Push-ups',
    category: 'strength' as const,
    muscleGroups: ['chest', 'shoulders', 'triceps', 'core'],
    equipment: [],
  },
  {
    id: 'squats',
    name: 'Squats',
    category: 'strength' as const,
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'calves'],
    equipment: [],
  },
  {
    id: 'running',
    name: 'Running',
    category: 'cardio' as const,
    muscleGroups: ['legs', 'core'],
    equipment: [],
  },
  {
    id: 'deadlifts',
    name: 'Deadlifts',
    category: 'strength' as const,
    muscleGroups: ['hamstrings', 'glutes', 'back', 'core'],
    equipment: ['barbell'],
  },
  {
    id: 'bench_press',
    name: 'Bench Press',
    category: 'strength' as const,
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
  },
  {
    id: 'plank',
    name: 'Plank',
    category: 'strength' as const,
    muscleGroups: ['core', 'shoulders'],
    equipment: [],
  },
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'cardio' as const,
    muscleGroups: ['full body'],
    equipment: [],
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    category: 'cardio' as const,
    muscleGroups: ['core', 'shoulders', 'legs'],
    equipment: [],
  },
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    category: 'cardio' as const,
    muscleGroups: ['legs', 'shoulders'],
    equipment: [],
  },
  {
    id: 'lunges',
    name: 'Lunges',
    category: 'strength' as const,
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: [],
  },
];

// Workout templates
export const workoutTemplates = [
  {
    id: 'quick_hiit',
    name: 'Quick HIIT',
    duration: '15 min',
    category: 'cardio',
    description: 'High-intensity interval training for quick results',
    exercises: ['burpees', 'mountain_climbers', 'jumping_jacks', 'push_ups'],
    difficulty: 'intermediate',
  },
  {
    id: 'push_day',
    name: 'Push Day',
    duration: '45 min',
    category: 'strength',
    description: 'Focus on pushing movements for chest, shoulders, and triceps',
    exercises: ['push_ups', 'bench_press', 'squats'],
    difficulty: 'intermediate',
  },
  {
    id: 'core_blast',
    name: 'Core Blast',
    duration: '20 min',
    category: 'strength',
    description: 'Intense core workout for stability and strength',
    exercises: ['plank', 'mountain_climbers', 'burpees'],
    difficulty: 'beginner',
  },
  {
    id: 'full_body',
    name: 'Full Body Workout',
    duration: '40 min',
    category: 'strength',
    description: 'Complete workout targeting all major muscle groups',
    exercises: ['squats', 'push_ups', 'deadlifts', 'plank', 'lunges'],
    difficulty: 'advanced',
  },
  {
    id: 'cardio_blast',
    name: 'Cardio Blast',
    duration: '25 min',
    category: 'cardio',
    description: 'High-energy cardio session to boost endurance',
    exercises: ['running', 'burpees', 'jumping_jacks', 'mountain_climbers'],
    difficulty: 'intermediate',
  },
];

// Infer types from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type TraineeInvitationFormData = z.infer<typeof traineeInvitationSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type TraineeInvitationRecord = z.infer<typeof traineeInvitationRecordSchema>;
export type Trainee = z.infer<typeof traineeSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseSet = z.infer<typeof exerciseSetSchema>;
export type Workout = z.infer<typeof workoutSchema>;
export type WorkoutLogFormData = z.infer<typeof workoutLogSchema>;