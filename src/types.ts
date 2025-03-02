export type Mood = 'sad' | 'neutral' | 'happy' | 'anxious' | 'stressed';

export interface MoodEntry {
  id: string;
  mood: Mood;
  note?: string;
  timestamp: number;
  bodyMap?: BodyMapPoint[];
}

export interface BodyMapPoint {
  x: number;
  y: number;
  intensity: number;
}

export interface User {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  badges: Badge[];
  moodEntries: MoodEntry[];
  savedResources: string[];
  friends: Friend[];
  timeCapsules: TimeCapsule[];
  gardenProgress: GardenProgress;
  ventBoxRecordings: VentBoxRecording[];
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastActive: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface TimeCapsule {
  id: string;
  message: string;
  createdAt: number;
  unlockAt: number;
  unlocked: boolean;
}

export interface GardenProgress {
  level: number;
  plants: Plant[];
  lastWatered: number;
}

export interface Plant {
  id: string;
  type: 'tree' | 'flower' | 'bush';
  stage: number; // 1-5 growth stages
  plantedAt: number;
}

export interface VentBoxRecording {
  id: string;
  timestamp: number;
  duration: number;
  expiresAt: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'article' | 'video' | 'tip' | 'exercise';
  imageUrl: string;
  link: string;
}

export interface ForumPost {
  id: string;
  content: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  replies: ForumReply[];
}

export interface ForumReply {
  id: string;
  content: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
}

export interface Playlist {
  id: string;
  title: string;
  mood: Mood;
  coverImage: string;
  tracks: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  audioUrl: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  available: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  moodCategory: Mood;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  bio: string;
  availability: {
    days: string[];
    hours: string;
  };
  rating: number;
  reviews: number;
}

export interface Appointment {
  id: string;
  doctorId: string;
  userId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'video' | 'audio' | 'chat';
}

export interface MotivationalFlashcard {
  id: string;
  mood: Mood;
  frontText: string;
  backText: string;
  color: string;
}

export interface GlobalEmotion {
  id: string;
  mood: Mood;
  location: string;
  timestamp: number;
  hearts: number;
}