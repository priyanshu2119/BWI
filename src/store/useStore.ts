import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  MoodEntry, 
  Resource, 
  ForumPost, 
  Playlist, 
  EmergencyContact,
  DailyChallenge,
  Mood,
  Friend,
  Message,
  TimeCapsule,
  Doctor,
  Appointment,
  MotivationalFlashcard,
  GlobalEmotion,
  BodyMapPoint,
  VentBoxRecording
} from '../types';

type User = {
  id: string;
  name: string;
  xp: number;
  streak: number;
  lastActive: string;
  isAuthenticated?: boolean;
};

interface State {
  user: User;
  currentMood: Mood;
  resources: Resource[];
  forumPosts: ForumPost[];
  playlists: Playlist[];
  emergencyContacts: EmergencyContact[];
  dailyChallenge: DailyChallenge;
  darkMode: boolean;
  showConfetti: boolean;
  messages: Message[];
  doctors: Doctor[];
  appointments: Appointment[];
  flashcards: MotivationalFlashcard[];
  globalEmotions: GlobalEmotion[];
  showFlashcards: boolean;
  
  // Actions
  setCurrentMood: (mood: Mood) => void;
  addMoodEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
  toggleDarkMode: () => void;
  saveResource: (resourceId: string) => void;
  unsaveResource: (resourceId: string) => void;
  upvotePost: (postId: string) => void;
  downvotePost: (postId: string) => void;
  addForumPost: (content: string) => void;
  completeChallenge: () => void;
  setShowConfetti: (show: boolean) => void;
  addXp: (amount: number) => void;
  addFriend: (friend: Omit<Friend, 'id'>) => void;
  removeFriend: (friendId: string) => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  markMessageAsRead: (messageId: string) => void;
  createTimeCapsule: (message: string, unlockInDays: number) => void;
  bookAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  cancelAppointment: (appointmentId: string) => void;
  addBodyMapPoint: (moodEntryId: string, point: BodyMapPoint) => void;
  addVentBoxRecording: (duration: number) => void;
  deleteVentBoxRecording: (recordingId: string) => void;
  waterGarden: () => void;
  sendHeartToGlobalEmotion: (emotionId: string) => void;
  setShowFlashcards: (show: boolean) => void;
  incrementStreak: () => void;
  setUser: (userData: User) => void;
  logout: () => void;
}

// Mock initial data
const mockUser: User = {
  id: '1',
  name: 'Student',
  xp: 120,
  level: 2,
  streak: 3,
  lastActive: Date.now().toString(),
  isAuthenticated: true,
  badges: [
    {
      id: '1',
      name: 'First Mood',
      description: 'Tracked your first mood',
      icon: 'Award',
      unlocked: true
    },
    {
      id: '2',
      name: 'Week Streak',
      description: 'Tracked mood for 7 days in a row',
      icon: 'Flame',
      unlocked: false
    },
    {
      id: '3',
      name: 'Garden Enthusiast',
      description: 'Grew your first plant to maturity',
      icon: 'Flower2',
      unlocked: false
    },
    {
      id: '4',
      name: 'Mindfulness Master',
      description: 'Completed 10 breathing exercises',
      icon: 'Wind',
      unlocked: false
    }
  ],
  moodEntries: [
    { id: '1', mood: 'happy', timestamp: Date.now() - 86400000 * 2 },
    { id: '2', mood: 'neutral', timestamp: Date.now() - 86400000 },
    { id: '3', mood: 'sad', note: 'Feeling stressed about exams', timestamp: Date.now() - 43200000 }
  ],
  savedResources: ['1', '3'],
  friends: [
    {
      id: '1',
      name: 'Alex',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      status: 'online',
      lastActive: Date.now()
    },
    {
      id: '2',
      name: 'Jordan',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      status: 'offline',
      lastActive: Date.now() - 3600000
    }
  ],
  timeCapsules: [
    {
      id: '1',
      message: 'Remember how strong you were during finals week!',
      createdAt: Date.now() - 86400000 * 30,
      unlockAt: Date.now() + 86400000 * 30,
      unlocked: false
    }
  ],
  gardenProgress: {
    level: 1,
    plants: [
      {
        id: '1',
        type: 'tree',
        stage: 2,
        plantedAt: Date.now() - 86400000 * 5
      }
    ],
    lastWatered: Date.now() - 86400000
  },
  ventBoxRecordings: [
    {
      id: '1',
      timestamp: Date.now() - 86400000,
      duration: 120, // seconds
      expiresAt: Date.now() + 86400000
    }
  ]
};

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Managing Exam Stress',
    description: 'Learn effective techniques to manage stress during exam periods',
    category: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: '#'
  },
  {
    id: '2',
    title: '5-Minute Meditation',
    description: 'A quick guided meditation to help you refocus and calm your mind',
    category: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: '#'
  },
  {
    id: '3',
    title: 'Sleep Hygiene Tips',
    description: 'Improve your sleep quality with these evidence-based tips',
    category: 'tip',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: '#'
  },
  {
    id: '4',
    title: 'Progressive Muscle Relaxation',
    description: 'Learn how to release tension through this guided exercise',
    category: 'exercise',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: '#'
  },
  {
    id: '5',
    title: 'Anxiety Grounding Techniques',
    description: 'Quick exercises to help you stay present during anxiety',
    category: 'exercise',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: '#'
  },
  {
    id: '6',
    title: 'Understanding Panic Attacks',
    description: 'Learn what happens during a panic attack and how to manage them',
    category: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: '#'
  }
];

const mockForumPosts: ForumPost[] = [
  {
    id: '1',
    content: 'Does anyone have tips for managing anxiety before presentations?',
    timestamp: Date.now() - 3600000,
    upvotes: 12,
    downvotes: 0,
    replies: [
      {
        id: '1-1',
        content: 'Deep breathing exercises help me a lot. Try 4-7-8 breathing!',
        timestamp: Date.now() - 1800000,
        upvotes: 5,
        downvotes: 0
      }
    ]
  },
  {
    id: '2',
    content: 'I\'ve been feeling really unmotivated lately. How do you all stay focused?',
    timestamp: Date.now() - 86400000,
    upvotes: 8,
    downvotes: 1,
    replies: []
  }
];

const mockPlaylists: Playlist[] = [
  {
    id: '1',
    title: 'Uplifting Vibes',
    mood: 'happy',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    tracks: [
      {
        id: '1-1',
        title: 'Happy Day',
        artist: 'Mood Lifters',
        duration: '3:24',
        audioUrl: 'https://example.com/audio1.mp3'
      },
      {
        id: '1-2',
        title: 'Sunshine',
        artist: 'The Positives',
        duration: '4:12',
        audioUrl: 'https://example.com/audio2.mp3'
      }
    ]
  },
  {
    id: '2',
    title: 'Calm Focus',
    mood: 'neutral',
    coverImage: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    tracks: [
      {
        id: '2-1',
        title: 'Study Flow',
        artist: 'Concentration',
        duration: '5:30',
        audioUrl: 'https://example.com/audio3.mp3'
      }
    ]
  },
  {
    id: '3',
    title: 'Comfort Sounds',
    mood: 'sad',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    tracks: [
      {
        id: '3-1',
        title: 'Gentle Rain',
        artist: 'Nature Sounds',
        duration: '6:15',
        audioUrl: 'https://example.com/audio4.mp3'
      }
    ]
  },
  {
    id: '4',
    title: 'Anxiety Relief',
    mood: 'anxious',
    coverImage: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    tracks: [
      {
        id: '4-1',
        title: 'Calm Waters',
        artist: 'Peaceful Mind',
        duration: '7:30',
        audioUrl: 'https://example.com/audio5.mp3'
      }
    ]
  },
  {
    id: '5',
    title: 'Stress Relief',
    mood: 'stressed',
    coverImage: 'https://images.unsplash.com/photo-1474418397713-2f1091c6d482?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    tracks: [
      {
        id: '5-1',
        title: 'Forest Sounds',
        artist: 'Nature Therapy',
        duration: '8:45',
        audioUrl: 'https://example.com/audio6.mp3'
      }
    ]
  }
];

const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Campus Counseling Center',
    phone: '(555) 123-4567',
    description: 'Professional counseling services for students',
    available: '24/7'
  },
  {
    id: '2',
    name: 'National Crisis Hotline',
    phone: '1-800-273-8255',
    description: 'Immediate support for those in emotional distress',
    available: '24/7'
  },
  {
    id: '3',
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Text-based crisis support',
    available: '24/7'
  }
];

const mockDailyChallenge: DailyChallenge = {
  id: '1',
  title: 'Mindful Moment',
  description: 'Take 5 minutes today to practice mindful breathing',
  xpReward: 50,
  completed: false,
  moodCategory: 'neutral'
};

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2', // Jordan
    receiverId: '1', // User
    content: 'Hey, how are you feeling today?',
    timestamp: Date.now() - 86400000,
    read: true
  },
  {
    id: '2',
    senderId: '1', // User
    receiverId: '2', // Jordan
    content: 'I\'m doing okay, just a bit stressed about exams',
    timestamp: Date.now() - 86400000 + 3600000,
    read: true
  },
  {
    id: '3',
    senderId: '2', // Jordan
    receiverId: '1', // User
    content: 'I understand. Remember to take breaks and practice self-care!',
    timestamp: Date.now() - 3600000,
    read: false
  }
];

const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Anxiety & Stress Management',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    bio: 'Specializes in helping students manage academic stress and anxiety',
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      hours: '9:00 AM - 5:00 PM'
    },
    rating: 4.8,
    reviews: 24
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Depression & Mood Disorders',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    bio: 'Experienced in treating depression and helping students find motivation',
    availability: {
      days: ['Tuesday', 'Thursday'],
      hours: '10:00 AM - 6:00 PM'
    },
    rating: 4.9,
    reviews: 31
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorId: '1',
    userId: '1',
    date: '2025-06-15',
    time: '10:00 AM',
    status: 'scheduled',
    type: 'video'
  }
];

const mockFlashcards: MotivationalFlashcard[] = [
  {
    id: '1',
    mood: 'happy',
    frontText: 'Your positivity is contagious!',
    backText: 'Share your good mood with someone today',
    color: 'bg-emerald-400'
  },
  {
    id: '2',
    mood: 'sad',
    frontText: 'It\'s okay not to be okay',
    backText: 'Be gentle with yourself today',
    color: 'bg-indigo-400'
  },
  {
    id: '3',
    mood: 'neutral',
    frontText: 'Every day is a fresh start',
    backText: 'What small thing can you do today to feel better?',
    color: 'bg-blue-400'
  },
  {
    id: '4',
    mood: 'anxious',
    frontText: 'Breathe in calm, breathe out worry',
    backText: 'Try 4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8',
    color: 'bg-purple-400'
  },
  {
    id: '5',
    mood: 'stressed',
    frontText: 'One step at a time',
    backText: 'Break down your tasks into smaller, manageable pieces',
    color: 'bg-orange-400'
  }
];

const mockGlobalEmotions: GlobalEmotion[] = [
  {
    id: '1',
    mood: 'happy',
    location: 'New York',
    timestamp: Date.now() - 300000,
    hearts: 5
  },
  {
    id: '2',
    mood: 'anxious',
    location: 'London',
    timestamp: Date.now() - 600000,
    hearts: 3
  },
  {
    id: '3',
    mood: 'neutral',
    location: 'Tokyo',
    timestamp: Date.now() - 900000,
    hearts: 2
  },
  {
    id: '4',
    mood: 'sad',
    location: 'Sydney',
    timestamp: Date.now() - 1200000,
    hearts: 7
  }
];

const useStore = create<State>()(
  persist(
    (set) => ({
      user: mockUser,
      currentMood: 'neutral',
      resources: mockResources,
      forumPosts: mockForumPosts,
      playlists: mockPlaylists,
      emergencyContacts: mockEmergencyContacts,
      dailyChallenge: mockDailyChallenge,
      darkMode: false,
      showConfetti: false,
      messages: mockMessages,
      doctors: mockDoctors,
      appointments: mockAppointments,
      flashcards: mockFlashcards,
      globalEmotions: mockGlobalEmotions,
      showFlashcards: false,
      
      setCurrentMood: (mood) => set({ currentMood: mood }),
      
      addMoodEntry: (entry) => set((state) => {
        const newEntry: MoodEntry = {
          id: uuidv4(),
          timestamp: Date.now(),
          ...entry
        };
        
        const updatedEntries = [newEntry, ...state.user.moodEntries];
        
        // Update daily challenge if it's related to mood tracking
        let updatedChallenge = state.dailyChallenge;
        if (state.dailyChallenge.title.includes('mood') && !state.dailyChallenge.completed) {
          updatedChallenge = {
            ...state.dailyChallenge,
            completed: true
          };
        }
        
        return {
          user: {
            ...state.user,
            moodEntries: updatedEntries,
            streak: state.user.streak + 1
          },
          currentMood: entry.mood,
          dailyChallenge: updatedChallenge,
          showFlashcards: true
        };
      }),
      
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      saveResource: (resourceId) => set((state) => ({
        user: {
          ...state.user,
          savedResources: [...state.user.savedResources, resourceId]
        }
      })),
      
      unsaveResource: (resourceId) => set((state) => ({
        user: {
          ...state.user,
          savedResources: state.user.savedResources.filter(id => id !== resourceId)
        }
      })),
      
      upvotePost: (postId) => set((state) => ({
        forumPosts: state.forumPosts.map(post => 
          post.id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
        )
      })),
      
      downvotePost: (postId) => set((state) => ({
        forumPosts: state.forumPosts.map(post => 
          post.id === postId ? { ...post, downvotes: post.downvotes + 1 } : post
        )
      })),
      
      addForumPost: (content) => set((state) => ({
        forumPosts: [
          {
            id: uuidv4(),
            content,
            timestamp: Date.now(),
            upvotes: 0,
            downvotes: 0,
            replies: []
          },
          ...state.forumPosts
        ]
      })),
      
      completeChallenge: () => 
        set((state) => {
          // Add XP and mark challenge as completed
          return { 
            user: { 
              ...state.user, 
              xp: state.user.xp + 10 
            },
            dailyChallenge: {
              ...state.dailyChallenge,
              completed: true
            }
          }; 
        }),
      
      setShowConfetti: (show) => set({ showConfetti: show }),
      
      addXp: (amount) => set((state) => {
        const newXp = state.user.xp + amount;
        const xpPerLevel = 100;
        const newLevel = Math.floor(newXp / xpPerLevel);
        
        return {
          user: {
            ...state.user,
            xp: newXp,
            level: newLevel > state.user.level ? newLevel : state.user.level,
            showConfetti: newLevel > state.user.level
          }
        };
      }),
      
      addFriend: (friend) => set((state) => ({
        user: {
          ...state.user,
          friends: [...state.user.friends, { ...friend, id: uuidv4() }]
        }
      })),
      
      removeFriend: (friendId) => set((state) => ({
        user: {
          ...state.user,
          friends: state.user.friends.filter(friend => friend.id !== friendId)
        }
      })),
      
      sendMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            id: uuidv4(),
            ...message,
            timestamp: Date.now(),
            read: false
          }
        ]
      })),
      
      markMessageAsRead: (messageId) => set((state) => ({
        messages: state.messages.map(message => 
          message.id === messageId ? { ...message, read: true } : message
        )
      })),
      
      createTimeCapsule: (message, unlockInDays) => set((state) => ({
        user: {
          ...state.user,
          timeCapsules: [
            ...state.user.timeCapsules,
            {
              id: uuidv4(),
              message,
              createdAt: Date.now(),
              unlockAt: Date.now() + (unlockInDays * 86400000),
              unlocked: false
            }
          ]
        }
      })),
      
      bookAppointment: (appointment) => set((state) => ({
        appointments: [
          ...state.appointments,
          {
            id: uuidv4(),
            ...appointment
          }
        ]
      })),
      
      cancelAppointment: (appointmentId) => set((state) => ({
        appointments: state.appointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: 'cancelled' } 
            : appointment
        )
      })),
      
      addBodyMapPoint: (moodEntryId, point) => set((state) => ({
        user: {
          ...state.user,
          moodEntries: state.user.moodEntries.map(entry => 
            entry.id === moodEntryId 
              ? { 
                  ...entry, 
                  bodyMap: entry.bodyMap ? [...entry.bodyMap, point] : [point] 
                } 
              : entry
          )
        }
      })),
      
      addVentBoxRecording: (duration) => set((state) => ({
        user: {
          ...state.user,
          ventBoxRecordings: [
            ...state.user.ventBoxRecordings,
            {
              id: uuidv4(),
              timestamp: Date.now(),
              duration,
              expiresAt: Date.now() + 86400000 // 24 hours
            }
          ]
        }
      })),
      
      deleteVentBoxRecording: (recordingId) => set((state) => ({
        user: {
          ...state.user,
          ventBoxRecordings: state.user.ventBoxRecordings.filter(
            recording => recording.id !== recordingId
          )
        }
      })),
      
      waterGarden: () => set((state) => {
        // Advance plant growth if it's been at least a day since last watered
        const daysSinceLastWatered = (Date.now() - state.user.gardenProgress.lastWatered) / 86400000;
        
        if (daysSinceLastWatered < 1) return state;
        
        const updatedPlants = state.user.gardenProgress.plants.map(plant => {
          if (plant.stage < 5) {
            return {
              ...plant,
              stage: plant.stage + 1
            };
          }
          return plant;
        });
        
        return {
          user: {
            ...state.user,
            gardenProgress: {
              ...state.user.gardenProgress,
              plants: updatedPlants,
              lastWatered: Date.now()
            }
          }
        };
      }),
      
      sendHeartToGlobalEmotion: (emotionId) => set((state) => ({
        globalEmotions: state.globalEmotions.map(emotion => 
          emotion.id === emotionId 
            ? { ...emotion, hearts: emotion.hearts + 1 } 
            : emotion
        )
      })),
      
      setShowFlashcards: (show) => set({ showFlashcards: show }),
      
      incrementStreak: () => 
        set((state) => ({ 
          user: { ...state.user, streak: state.user.streak + 1 } 
        })),

      setUser: (userData) => set({ 
        user: { ...userData, isAuthenticated: true } 
      }),

      logout: () => set({ 
        user: { 
          id: '', 
          name: '', 
          xp: 0, 
          streak: 0, 
          lastActive: '',
          isAuthenticated: false
        }
      })
    }),
    {
      name: 'mental-health-hub-storage'
    }
  )
);

export default useStore;