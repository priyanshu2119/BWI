import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Repeat1, Shuffle, List, Maximize2, Minimize2, Heart,
  Download, Share2, CornerLeftUp, Music
} from 'lucide-react';
import Card from '../ui/Card';
import { Track } from '../../types';
import useStore from '../../store/useStore';
import { getMoodTextColor } from '../../utils/theme';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';

interface MusicPlayerProps {
  tracks: Track[];
  currentTrackIndex: number;
  onTrackChange: (index: number) => void;
  mood: 'sad' | 'neutral' | 'happy' | 'anxious' | 'angry';
  playlistTitle?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  tracks,
  currentTrackIndex,
  onTrackChange,
  mood,
  playlistTitle
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(8).fill(0));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextTrackPreloaded, setNextTrackPreloaded] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [audioElementReady, setAudioElementReady] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const audioSource = useRef<MediaElementAudioSourceNode | null>(null);
  const audioAnalyser = useRef<AnalyserNode | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const visualizerRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);
  
  const { darkMode } = useStore();
  
  const currentTrack = tracks[currentTrackIndex];
  const nextTrack = tracks[(currentTrackIndex + 1) % tracks.length];
  const textColorClass = getMoodTextColor(mood, darkMode);
  
  // Motion values for drag
  const miniPlayerX = useMotionValue(0);
  const miniPlayerY = useMotionValue(0);
  const miniPlayerScale = useTransform(
    miniPlayerY, 
    [-100, 0, 100], 
    [0.8, 1, 0.8]
  );
  
  // Dynamic lyrics display
  const currentLyrics = useMemo(() => {
    // In a real app, you would fetch these from an API or database
    const fakeLyrics: Record<string, string[]> = {
      happy: [
        "Sunshine breaking through the clouds",
        "Every moment feels like gold",
        "Dancing through the day with joy",
        "Happiness that never ends"
      ],
      sad: [
        "Memories fade like autumn leaves",
        "Teardrops falling in the rain",
        "Empty spaces in my heart",
        "Shadows where there once was light"
      ],
      anxious: [
        "Racing thoughts that never stop",
        "Heart beats faster than it should",
        "Searching for a moment's peace",
        "Waiting for the storm to pass"
      ],
      neutral: [
        "Steady as the passing time",
        "Walking through the calming breeze",
        "Balance in the everyday",
        "Present in this moment now"
      ],
      angry: [
        "Fire burning deep within",
        "Thunder crashing through the sky",
        "Breaking through these heavy chains",
        "Power rising from within"
      ]
    };
    
    return fakeLyrics[mood] || fakeLyrics.neutral;
  }, [mood]);
  
  // Determine mood-based colors
  const moodColors = useMemo(() => ({
    happy: darkMode ? ['#4ade80', '#3b82f6'] : ['#34d399', '#3b82f6'],
    sad: darkMode ? ['#60a5fa', '#3b82f6'] : ['#93c5fd', '#3b82f6'],
    neutral: darkMode ? ['#a8a29e', '#78716c'] : ['#d6d3d1', '#78716c'],
    anxious: darkMode ? ['#fcd34d', '#f59e0b'] : ['#fcd34d', '#f59e0b'],
    angry: darkMode ? ['#f87171', '#ef4444'] : ['#f87171', '#ef4444']
  }), [darkMode]);
  
  const colors = moodColors[mood as keyof typeof moodColors];
  const progressBgColor = colors[0];
  
  // Keyboard shortcuts for player controls
  useKeyboardShortcut(
    {
      ' ': togglePlay,
      'k': togglePlay,
      'arrowleft': handlePrevious,
      'arrowright': handleNext,
      'm': toggleMute,
      'arrowup': () => {
        const newVolume = Math.min(1, volume + 0.1);
        setVolume(newVolume);
        if (audioRef.current) audioRef.current.volume = newVolume;
        setIsMuted(false);
      },
      'arrowdown': () => {
        const newVolume = Math.max(0, volume - 0.1);
        setVolume(newVolume);
        if (audioRef.current) audioRef.current.volume = newVolume;
        if (newVolume === 0) setIsMuted(true);
      },
      'l': () => {
        const newIsLiked = { ...isLiked };
        newIsLiked[currentTrack.id] = !newIsLiked[currentTrack.id];
        setIsLiked(newIsLiked);
      },
      'f': () => setIsExpanded(!isExpanded),
    },
    [volume, isLiked, currentTrack.id, isExpanded]
  );
  
  // Initialize audio context and analyser
  useEffect(() => {
    try {
      if (!audioContext.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          console.warn('Web Audio API not supported in this browser');
          return;
        }
        
        audioContext.current = new AudioContext();
        audioAnalyser.current = audioContext.current.createAnalyser();
        audioAnalyser.current.fftSize = 64;
      }
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clean up audio nodes
      if (audioSource.current) {
        try {
          audioSource.current.disconnect();
        } catch (error) {
          console.warn('Error disconnecting audio source:', error);
        }
      }
      
      if (audioContext.current?.state !== 'closed') {
        try {
          audioContext.current?.close();
        } catch (error) {
          console.warn('Error closing audio context:', error);
        }
      }
    };
  }, []);
  
  // Track when audio element is ready
  useEffect(() => {
    if (audioRef.current) {
      setAudioElementReady(true);
    }
    return () => setAudioElementReady(false);
  }, []);
  
  // Connect audio element to analyser when ref is available
  useEffect(() => {
    if (!audioElementReady || !audioRef.current || !audioContext.current || !audioAnalyser.current) return;
    
    try {
      if (audioSource.current) {
        audioSource.current.disconnect();
      }
      
      audioSource.current = audioContext.current.createMediaElementSource(audioRef.current);
      audioSource.current.connect(audioAnalyser.current);
      audioAnalyser.current.connect(audioContext.current.destination);
      
      // Start visualizer
      startVisualizer();
    } catch (error) {
      console.error('Error setting up audio nodes:', error);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioElementReady, startVisualizer]);
  
  // Preload next track
  useEffect(() => {
    if (!nextAudioRef.current || tracks.length <= 1) return;
    
    try {
      nextAudioRef.current.src = nextTrack.audioUrl;
      nextAudioRef.current.load();
      setNextTrackPreloaded(true);
    } catch (error) {
      console.warn('Error preloading next track:', error);
      setNextTrackPreloaded(false);
    }
    
    return () => setNextTrackPreloaded(false);
  }, [currentTrackIndex, nextTrack.audioUrl, tracks.length]);
  
  // Track change effect with smooth transition
  useEffect(() => {
    setCurrentTime(0);
    
    if (!audioRef.current) return;
    
    if (isPlaying) {
      setIsTransitioning(true);
      
      // Fade out current track with smooth transition
      const fadeOut = () => {
        if (!audioRef.current) return;
        
        const startVolume = audioRef.current.volume;
        const fadeInterval = 50; // ms
        const fadeDuration = 300; // ms
        const fadeSteps = fadeDuration / fadeInterval;
        const volumeStep = startVolume / fadeSteps;
        
        let currentStep = 0;
        
        const fadeOutInterval = setInterval(() => {
          currentStep++;
          
          if (!audioRef.current || currentStep >= fadeSteps) {
            clearInterval(fadeOutInterval);
            
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              
              // Restore volume and play new track after a small delay
              setTimeout(() => {
                if (!audioRef.current) return;
                
                audioRef.current.volume = isMuted ? 0 : volume;
                
                // With a fade-in effect
                const fadeInInterval = setInterval(() => {
                  if (!audioRef.current) {
                    clearInterval(fadeInInterval);
                    return;
                  }
                  
                  const targetVolume = isMuted ? 0 : volume;
                  const currentVol = audioRef.current.volume;
                  const newVolume = Math.min(targetVolume, currentVol + volumeStep);
                  
                  audioRef.current.volume = newVolume;
                  
                  if (newVolume >= targetVolume) {
                    clearInterval(fadeInInterval);
                  }
                }, fadeInterval);
                
                audioRef.current.play().catch((error) => {
                  console.warn('Audio playback prevented:', error);
                  setIsPlaying(false);
                });
                
                setIsTransitioning(false);
              }, 100);
            }
          } else if (audioRef.current) {
            audioRef.current.volume = Math.max(0, startVolume - (volumeStep * currentStep));
          }
        }, fadeInterval);
        
        return () => clearInterval(fadeOutInterval);
      };
      
      fadeOut();
    } else {
      // Just prepare the audio for when play is pressed
      audioRef.current.currentTime = 0;
    }
  }, [currentTrackIndex, isMuted, volume]);
  
  // Initialize canvas size on resize
  useEffect(() => {
    const handleResize = () => {
      if (!visualizerRef.current) return;
      
      const canvas = visualizerRef.current;
      const container = canvas.parentElement;
      
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Start visualizer animation with optimized rendering
  const startVisualizer = useCallback(() => {
    if (!audioAnalyser.current || !visualizerRef.current) return;
    
    const analyser = audioAnalyser.current;
    const canvas = visualizerRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Keep track of last render time for throttling
    let lastRenderTime = 0;
    const minRenderInterval = 1000 / 30; // Max 30 fps
    
    const renderFrame = (timestamp: number) => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      
      // Throttle rendering for performance
      if (timestamp - lastRenderTime < minRenderInterval) {
        return;
      }
      
      lastRenderTime = timestamp;
      
      // Get frequency data
      analyser.getByteFrequencyData(dataArray);
      
      // Save a simplified version of data for other visualizations
      const simplifiedData = Array.from({ length: 8 }, (_, i) => {
        const startIndex = Math.floor(i * bufferLength / 8);
        const endIndex = Math.floor((i + 1) * bufferLength / 8);
        let sum = 0;
        for (let j = startIndex; j < endIndex; j++) {
          sum += dataArray[j];
        }
        return sum / (endIndex - startIndex);
      });
      
      setVisualizerData(simplifiedData);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw visualization based on mood
      const barWidth = canvas.width / bufferLength;
      let x = 0;
      
      // Create gradient based on mood
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      ctx.fillStyle = gradient;
      
      // Handle different visualizations based on mood
      if (mood === 'happy') {
        drawHappyVisualization(ctx, dataArray, bufferLength, barWidth, canvas.height);
      } else if (mood === 'sad') {
        drawSadVisualization(ctx, dataArray, bufferLength, barWidth, canvas.height);
      } else if (mood === 'anxious') {
        drawAnxiousVisualization(ctx, dataArray, bufferLength, barWidth, canvas.height);
      } else if (mood === 'angry') {
        drawAngryVisualization(ctx, dataArray, bufferLength, barWidth, canvas.height);
      } else {
        drawNeutralVisualization(ctx, dataArray, bufferLength, barWidth, canvas.height);
      }
    };
    
    renderFrame(0);
  }, [colors, mood]);
  
  const drawHappyVisualization = useCallback((
    ctx: CanvasRenderingContext2D, 
    dataArray: Uint8Array, 
    bufferLength: number, 
    barWidth: number, 
    canvasHeight: number
  ) => {
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvasHeight * 0.8;
      
      ctx.beginPath();
      
      // Handle browser compatibility with roundRect
      if (typeof ctx.roundRect === 'function') {
        // TypeScript might not know about roundRect
        (ctx as any).roundRect(
          x, 
          canvasHeight - barHeight, 
          barWidth - 1, 
          barHeight, 
          [4, 4, 0, 0]
        );
      } else {
        // Fallback for browsers without roundRect
        ctx.moveTo(x + 4, canvasHeight - barHeight);
        ctx.arcTo(x + barWidth - 1, canvasHeight - barHeight, x + barWidth - 1, canvasHeight, 4);
        ctx.arcTo(x + barWidth - 1, canvasHeight, x, canvasHeight, 0);
        ctx.arcTo(x, canvasHeight, x, canvasHeight - barHeight, 0);
        ctx.arcTo(x, canvasHeight - barHeight, x + barWidth - 1, canvasHeight - barHeight, 4);
      }
      ctx.fill();
      
      // Add some "dancing" particles on top
      if (i % 3 === 0 && dataArray[i] > 80) {
        const particleSize = Math.random() * 4 + 2;
        ctx.globalAlpha = Math.random() * 0.6 + 0.2;
        ctx.beginPath();
        ctx.arc(
          x + barWidth / 2, 
          canvasHeight - barHeight - 5 - Math.random() * 15,
          particleSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      x += barWidth;
    }
  }, []);
  
  const drawSadVisualization = useCallback((
    ctx: CanvasRenderingContext2D, 
    dataArray: Uint8Array, 
    bufferLength: number, 
    barWidth: number, 
    canvasHeight: number
  ) => {
    let x = 0;
    
    // Soft wave form for sad mood with ripple effect
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    
    for (let i = 0; i < bufferLength; i++) {
      const y = canvasHeight - (dataArray[i] / 255) * canvasHeight * 0.7;
      
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = (i - 1) * barWidth;
        const prevY = canvasHeight - (dataArray[i - 1] / 255) * canvasHeight * 0.7;
        const cpx = prevX + (x - prevX) / 2;
        const cpy = prevY + (y - prevY) / 2;
        ctx.quadraticCurveTo(cpx, cpy, x, y);
      }
      
      x += barWidth;
    }
    
    ctx.lineTo(ctx.canvas.width, canvasHeight);
    ctx.closePath();
    ctx.fill();
    
    // Add subtle ripples
    for (let i = 0; i < 3; i++) {
      if (Math.random() > 0.96) {
        ctx.globalAlpha = Math.random() * 0.2 + 0.1;
        ctx.beginPath();
        const rippleX = Math.random() * ctx.canvas.width;
        const rippleRadius = Math.random() * 30 + 10;
        ctx.arc(rippleX, canvasHeight - 20, rippleRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }, []);
  
  const drawAnxiousVisualization = useCallback((
    ctx: CanvasRenderingContext2D, 
    dataArray: Uint8Array, 
    bufferLength: number, 
    barWidth: number, 
    canvasHeight: number
  ) => {
    let x = 0;
    
    // Spiky visualization for anxious mood
    ctx.lineWidth = 2;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight / 2);
    
    const randomOffset = () => (Math.random() * 6) - 3;
    
    for (let i = 0; i < bufferLength; i++) {
      const y = canvasHeight / 2 - (dataArray[i] / 255) * canvasHeight * 0.4;
      // Add small random variations for nervous effect
      ctx.lineTo(x + randomOffset(), y + randomOffset());
      x += barWidth;
    }
    
    ctx.stroke();
    
    // Add anxiety "sparks"
    ctx.fillStyle = colors[0];
    for (let i = 0; i < bufferLength; i += 2) {
      if (dataArray[i] > 100) {
        const sparkX = i * barWidth + Math.random() * 10 - 5;
        const sparkY = canvasHeight / 2 - (dataArray[i] / 255) * canvasHeight * 0.4;
        const sparkSize = Math.random() * 3 + 1;
        
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add slight tail
        ctx.beginPath();
        ctx.moveTo(sparkX, sparkY);
        ctx.lineTo(sparkX + Math.random() * 6 - 3, sparkY + Math.random() * 6 - 3);
        ctx.stroke();
      }
    }
  }, [colors]);
  
  const drawAngryVisualization = useCallback((
    ctx: CanvasRenderingContext2D, 
    dataArray: Uint8Array, 
    bufferLength: number, 
    barWidth: number, 
    canvasHeight: number
  ) => {
    let x = 0;
    
    // Fiery visualization for angry mood
    const gradient = ctx.fillStyle;
    
    // Base flames
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvasHeight * 0.8;
      
      // Draw flame shape
      ctx.beginPath();
      ctx.moveTo(x, canvasHeight);
      
      // Create flame effect with curves
      ctx.bezierCurveTo(
        x - barWidth / 2, canvasHeight - barHeight * 0.5,
        x + barWidth, canvasHeight - barHeight * 0.8,
        x + barWidth / 2, canvasHeight - barHeight
      );
      
      ctx.bezierCurveTo(
        x + barWidth, canvasHeight - barHeight * 0.8,
        x + barWidth * 2, canvasHeight - barHeight * 0.5,
        x + barWidth, canvasHeight
      );
      
      ctx.fill();
      
      // Add some "sparks" for intensity
      if (i % 2 === 0 && dataArray[i] > 100) {
        ctx.fillStyle = '#FFCB6B';
        ctx.globalAlpha = Math.random() * 0.7 + 0.3;
        
        ctx.beginPath();
        ctx.arc(
          x + barWidth / 2, 
          canvasHeight - barHeight - Math.random() * 20,
          Math.random() * 3 + 1,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
      }
      
      x += barWidth * 1.5;
    }
  }, []);
  
  const drawNeutralVisualization = useCallback((
    ctx: CanvasRenderingContext2D, 
    dataArray: Uint8Array, 
    bufferLength: number, 
    barWidth: number, 
    canvasHeight: number
  ) => {
    let x = 0;
    
    // Neutral - clean bars with subtle effects
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvasHeight * 0.6;
      
      // Add slight pulsing effect
      const pulseOffset = Math.sin(Date.now() * 0.003 + i * 0.2) * 5;
      
      ctx.fillRect(
        x, 
        canvasHeight - barHeight - pulseOffset, 
        barWidth - 1, 
        barHeight + pulseOffset
      );
      
      x += barWidth;
    }
  }, []);
  
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (audioContext.current?.state === 'suspended') {
      audioContext.current.resume();
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().catch((error) => {
        console.warn('Audio playback prevented:', error);
      });
    }
    
    setIsPlaying(!isPlaying);
  }, [isPlaying, isMuted, volume]);
  
  const handlePrevious = useCallback(() => {
    if (!audioRef.current) return;
    
    if (currentTime > 3) {
      // If we're more than 3 seconds into the song, just restart it
      audioRef.current.currentTime = 0;
      return;
    }
    
    let newIndex;
    
    if (isShuffle) {
      newIndex = Math.floor(Math.random() * tracks.length);
      while (newIndex === currentTrackIndex && tracks.length > 1) {
        newIndex = Math.floor(Math.random() * tracks.length);
      }
    } else {
      newIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    }
    
    onTrackChange(newIndex);
  }, [currentTime, currentTrackIndex, isShuffle, onTrackChange, tracks.length]);
  
  const handleNext = useCallback(() => {
    if (!audioRef.current) return;
    
    if (repeatMode === 'one') {
      // Restart current track
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.warn('Audio playback prevented:', error);
      });
      return;
    }
    
    let newIndex;
    
    if (isShuffle) {
      newIndex = Math.floor(Math.random() * tracks.length);
      while (newIndex === currentTrackIndex && tracks.length > 1) {
        newIndex = Math.floor(Math.random() * tracks.length);
      }
    } else {
      newIndex = currentTrackIndex === tracks.length - 1 ? 
        (repeatMode === 'all' ? 0 : currentTrackIndex) : 
        currentTrackIndex + 1;
    }
    
    onTrackChange(newIndex);
  }, [currentTrackIndex, isShuffle, onTrackChange, repeatMode, tracks.length]);
  
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current || isDraggingProgress) return;
    
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
    
    // When near the end of the track, prepare for transition
    if (nextTrackPreloaded && 
        audioRef.current.duration > 0 && 
        audioRef.current.currentTime >= audioRef.current.duration - 2) {
      if (nextAudioRef.current) {
        nextAudioRef.current.currentTime = 0;
      }
    }
  }, [isDraggingProgress, nextTrackPreloaded]);
  
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  }, []);
  
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setPreviousVolume(newVolume > 0 ? newVolume : previousVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    
    setIsMuted(newVolume === 0);
  }, [previousVolume]);
  
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = previousVolume;
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume > 0 ? volume : 0.7);
      audioRef.current.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, previousVolume, volume]);
  
  const toggleRepeat = useCallback(() => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  }, [repeatMode]);
  
  const formatTime = useCallback((time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  const toggleLike = useCallback((trackId: string) => {
    setIsLiked(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
    
    // Show feedback tooltip
    setShowTooltip(isLiked[trackId] ? 'Removed from favorites' : 'Added to favorites');
    setTimeout(() => setShowTooltip(null), 2000);
  }, [isLiked]);
  
  // Calculate progress percentage for animations
  const progressPercent = (currentTime / (duration || 1)) * 100;
  
  // Get current lyrics line based on song progress
  const calculatedLyricIndex = Math.floor((currentTime / (duration || 100)) * currentLyrics.length);
  const currentLyricLine = currentLyrics[Math.min(calculatedLyricIndex, currentLyrics.length - 1)];
  
  return (
    <div className="relative" ref={dragConstraintsRef}>
      {/* Hidden audio elements */}
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        onLoadedMetadata={handleTimeUpdate}
        preload="auto"
      />
      
      <audio
        ref={nextAudioRef}
        preload="auto"
      />
      
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 z-50 px-3 py-1.5 rounded-md bg-gray-800 text-white text-sm"
          >
            {showTooltip}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main player card */}
      <AnimatePresence mode="wait">
        {showMiniPlayer ? (
          <motion.div 
            className="fixed z-30"
            initial={{ bottom: 20, right: 20, scale: 0.8, opacity: 0 }}
            animate={{ 
              x: miniPlayerX.get(),
              y: miniPlayerY.get(),
              scale: miniPlayerScale.get(),
              opacity: 1
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            drag
            dragConstraints={dragConstraintsRef}
            dragElastic={0.2}
            dragMomentum={false}
            style={{ x: miniPlayerX, y: miniPlayerY, scale: miniPlayerScale }}
          >
            <Card variant="glass" className="p-4 flex items-center space-x-4">
              <img
                src={currentTrack.coverImage || `https://source.unsplash.com/100x100/?music,${mood}`}
                alt={currentTrack.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {currentTrack.title}
                </h3>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentTrack.artist}
                </p>
              </div>
              <motion.button
                onClick={() => setShowMiniPlayer(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <CornerLeftUp size={18} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              </motion.button>
            </Card>
            {/* Add this to the mini player section to complete controls */}
            {showMiniPlayer && (
              <div className="absolute bottom-0 right-0 flex space-x-1.5 p-2">
                <motion.button
                  onClick={togglePlay}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 rounded-full bg-${mood}-500 text-white`}
                >
                  {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                </motion.button>
                
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-full bg-gray-500 bg-opacity-20 backdrop-blur-sm text-white"
                >
                  <SkipForward size={12} className="text-white" />
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card variant="glass" className={`p-6 overflow-hidden transition-all duration-500 ${isExpanded ? 'h-auto' : ''}`}>
              {/* Player header with title and expandable controls */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  {playlistTitle && (
                    <p className={`text-xs uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {playlistTitle}
                    </p>
                  )}
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Now Playing
                  </h3>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                  >
                    <List size={18} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setIsExpanded(!isExpanded)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                  >
                    {isExpanded ? (
                      <Minimize2 size={18} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                    ) : (
                      <Maximize2 size={18} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Audio visualization */}
              <div className="relative h-24 mb-4 rounded-lg overflow-hidden">
                <canvas 
                  ref={visualizerRef} 
                  className={`w-full h-full ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg`}
                  width={600} 
                  height={100}
                />
                
                {/* Track info overlay */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center flex-col bg-black bg-opacity-30 backdrop-blur-sm rounded-lg"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isTransitioning ? 1 : 0.5 }}
                  transition={{ duration: 0.5 }}
                  onClick={togglePlay}
                >
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {currentTrack.title}
                    </h3>
                    <p className="text-sm text-white text-opacity-90">
                      {currentTrack.artist}
                    </p>
                  </div>
                </motion.div>
                
                {/* Mood-based visual pulses */}
                {isPlaying && visualizerData.map((value, index) => (
                  <motion.div
                    key={index}
                    className="absolute rounded-full"
                    style={{
                      width: '10px',
                      height: '10px',
                      left: `${(index / 8) * 100}%`,
                      bottom: '10px',
                      background: `${colors[0]}`,
                      boxShadow: `0 0 10px 2px ${colors[0]}`
                    }}
                    animate={{
                      scale: [(value / 255) * 2 + 0.5, 1],
                      opacity: [(value / 255) * 0.8 + 0.2, 0.5]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5 + (index * 0.1),
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              
              {/* Expanded player sections */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Left column - Album art */}
                    <div className="flex justify-center items-center">
                      <motion.div 
                        className="relative w-48 h-48 rounded-lg overflow-hidden shadow-lg"
                        animate={{
                          rotate: isPlaying ? [0, 360] : 0
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 20,
                          ease: "linear"
                        }}
                      >
                        <div 
                          className="absolute inset-0 rounded-full border-8 border-gray-900 border-opacity-80"
                          style={{ transform: 'scale(0.95)' }}
                        />
                        <img
                          src={currentTrack.coverImage || `https://source.unsplash.com/300x300/?music,${mood}`}
                          alt={currentTrack.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20" />
                        
                        {/* Center circle */}
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full z-10" />
                      </motion.div>
                    </div>
                    
                    {/* Right column - Track info */}
                    <div>
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {currentTrack.title}
                      </h3>
                      
                      <p className={`text-base ${textColorClass} mb-2`}>
                        {currentTrack.artist}
                      </p>
                      
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                        From <span className="italic">{playlistTitle || 'Unknown Album'}</span>
                      </p>
                      
                      <div className="flex items-center mb-4">
                        <motion.button
                          onClick={() => toggleLike(currentTrack.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-1.5 rounded-full ${
                            isLiked[currentTrack.id] ? 'text-red-500' : darkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart 
                            size={20} 
                            fill={isLiked[currentTrack.id] ? 'currentColor' : 'none'} 
                          />
                        </motion.button>
                        
                        <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {isLiked[currentTrack.id] ? 'Added to favorites' : 'Add to favorites'}
                        </span>
                      </div>
                      
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center mb-1">
                          <span className="w-24">Mood:</span>
                          <span className={textColorClass}>
                            {mood.charAt(0).toUpperCase() + mood.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex items-center mb-1">
                          <span className="w-24">Duration:</span>
                          <span>{currentTrack.duration || formatTime(duration)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="w-24">Track:</span>
                          <span>{currentTrackIndex + 1} of {tracks.length}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Add lyrics display section */}
              {isExpanded && (
                <motion.div 
                  className="mt-4 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className={`text-sm uppercase tracking-wider mb-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Lyrics
                  </h4>
                  
                  <div className="h-16 relative overflow-hidden rounded-lg">
                    <div 
                      className={`absolute inset-0 ${
                        darkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
                      } backdrop-blur-sm`}
                    />
                    
                    <div className="relative h-full flex items-center justify-center text-center p-4">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={currentLyricIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className={`text-base font-medium ${textColorClass}`}
                        >
                          {currentLyricLine}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Playlist view */}
              <AnimatePresence>
                {showPlaylist && (
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Playlist
                    </h3>
                    
                    <div className={`max-h-48 overflow-y-auto px-2 -mx-2 ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                      {tracks.map((track, index) => (
                        <motion.div
                          key={track.id}
                          className={`flex items-center p-2 rounded-md mb-1 cursor-pointer ${
                            currentTrackIndex === index 
                              ? darkMode ? 'bg-gray-800' : 'bg-gray-100'
                              : darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => onTrackChange(index)}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-6 flex justify-center">
                            {currentTrackIndex === index && isPlaying ? (
                              <div className="flex space-x-0.5">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="w-1 h-8"
                                    style={{ backgroundColor: progressBgColor }}
                                    animate={{
                                      height: [4, 12, 4]
                                    }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 0.8,
                                      delay: i * 0.2,
                                      ease: "easeInOut"
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {index + 1}
                              </span>
                            )}
                          </div>
                          
                          <div className="ml-3 flex-1">
                            <p className={`font-medium truncate ${
                              currentTrackIndex === index
                                ? textColorClass
                                : darkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {track.title}
                            </p>
                            <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {track.artist}
                            </p>
                          </div>
                          
                          <div className="text-xs text-right">
                            {track.duration || '0:00'}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center">
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-10`}>
                    {formatTime(currentTime)}
                  </span>
                  
                  <div className="relative flex-1 mx-2 group">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      onMouseDown={() => setIsDraggingProgress(true)}
                      onMouseUp={() => setIsDraggingProgress(false)}
                      onTouchStart={() => setIsDraggingProgress(true)}
                      onTouchEnd={() => setIsDraggingProgress(false)}
                      className={`w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent`}
                      style={{
                        background: `linear-gradient(to right, ${progressBgColor} ${progressPercent}%, ${
                          darkMode ? '#374151' : '#e5e7eb'
                        } 0)`,
                      }}
                    />
                    
                    {/* Hover effect for progress bar */}
                    <motion.div
                      className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full shadow-md z-10 pointer-events-none ${
                        isDraggingProgress ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: progressBgColor,
                        left: `${progressPercent}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-10 text-right`}>
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Shuffle button */}
                  <motion.button
                    onClick={() => setIsShuffle(!isShuffle)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-full ${isShuffle ? 'bg-blue-500 text-white' : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                  >
                    <Shuffle size={20} className={isShuffle ? 'text-white' : darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </motion.button>
                  
                  {/* Repeat button */}
                  <motion.button
                    onClick={toggleRepeat}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-full ${repeatMode !== 'none' ? 'bg-blue-500 text-white' : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                  >
                    <Repeat size={20} className={repeatMode !== 'none' ? 'text-white' : darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </motion.button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={handlePrevious}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                  >
                    <SkipBack size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </motion.button>
                  
                  <motion.button
                    onClick={togglePlay}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-3 rounded-full ${textColorClass.replace('text', 'bg').replace('-600', '-100').replace('-400', '-900')} ${textColorClass}`}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </motion.button>
                  
                  <motion.button
                    onClick={handleNext}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                  >
                    <SkipForward size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </motion.button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="mr-2">
                    {isMuted ? (
                      <VolumeX size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    ) : (
                      <Volume2 size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className={`w-24 h-1.5 rounded-full appearance-none cursor-pointer ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                    style={{
                      background: `linear-gradient(to right, ${
                        darkMode ? '#9ca3af' : '#6b7280'
                      } ${(isMuted ? 0 : volume) * 100}%, ${
                        darkMode ? '#374151' : '#e5e7eb'
                      } 0)`,
                    }}
                  />
                </div>
              </div>
              {/* Add these buttons to the expanded player view */}
              {isExpanded && (
                <div className="flex justify-center mt-4 space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex items-center px-3 py-1.5 rounded-full ${
                      darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => {
                      // In a real app, this would trigger a download
                      setShowTooltip('Downloading track...');
                      setTimeout(() => setShowTooltip(null), 2000);
                    }}
                  >
                    <Download size={16} className="mr-1.5" />
                    Download
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex items-center px-3 py-1.5 rounded-full ${
                      darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => {
                      // In a real app, this would open share dialog
                      setShowTooltip('Sharing options');
                      setTimeout(() => setShowTooltip(null), 2000);
                    }}
                  >
                    <Share2 size={16} className="mr-1.5" />
                    Share
                  </motion.button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MusicPlayer;