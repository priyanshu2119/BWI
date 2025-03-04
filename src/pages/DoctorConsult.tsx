import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Video, MessageCircle, Calendar as CalendarIcon,
  Check, X, AlertTriangle, Bell, Shield, User, Search, Star, Info
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useStore from '../store/useStore';
import VideoConsultationRoom from '../components/doctor/VideoConsultationRoom';
import ChatInterface from '../components/doctor/ChatInterface';

// Define types
type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  availability: string[];
  image: string;
  experience: number;
  bio: string;
};

type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

type AppointmentType = 'video' | 'chat';

const DoctorConsult: React.FC = () => {
  const { user, darkMode } = useStore();
  const navigate = useNavigate();
  
  // Auth check state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  
  // Doctor selection states
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  
  // Appointment scheduling states
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType>('video');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookingStep, setBookingStep] = useState(1);
  
  // Confirmation & reminder states
  const [isConfirming, setIsConfirming] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState('30');
  const [reminderType, setReminderType] = useState<'push' | 'email'>('push');
  
  // Active session states
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Mock data for doctors
  const doctors: Doctor[] = [
    {
      id: 'doc1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Mental Health Therapist',
      rating: 4.9,
      availability: ['Mon', 'Wed', 'Fri'],
      image: '/images/doctor1.jpg',
      experience: 8,
      bio: 'Specialized in cognitive behavioral therapy for students dealing with anxiety and stress management.'
    },
    {
      id: 'doc2',
      name: 'Dr. Michael Chen',
      specialty: 'Clinical Psychologist',
      rating: 4.7,
      availability: ['Tue', 'Thu', 'Sat'],
      image: '/images/doctor2.jpg',
      experience: 12,
      bio: 'Experienced in addressing academic pressure, identity development, and relationship challenges.'
    },
    {
      id: 'doc3',
      name: 'Dr. Priya Sharma',
      specialty: 'Wellness Counselor',
      rating: 4.8,
      availability: ['Mon', 'Tue', 'Wed', 'Fri'],
      image: '/images/doctor3.jpg',
      experience: 6,
      bio: 'Focuses on holistic well-being, including sleep health, nutrition counseling, and mindfulness practices.'
    }
  ];
  
  // Specialties from doctor data
  const specialties = ['all', ...new Set(doctors.map(doc => doc.specialty))];
  
  // Check for authentication
  useEffect(() => {
    if (user && user.isAuthenticated) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setShowAuthWarning(true);
    }
  }, [user]);
  
  // Filter doctors based on search and specialty
  useEffect(() => {
    let filtered = [...doctors];
    
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doc => doc.specialty === selectedSpecialty);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredDoctors(filtered);
  }, [searchQuery, selectedSpecialty]);
  
  // Generate time slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()];
      const isAvailable = selectedDoctor.availability.includes(dayOfWeek);
      
      if (isAvailable) {
        // Generate slots from 9 AM to 5 PM
        const generatedSlots: TimeSlot[] = [];
        for (let i = 9; i <= 17; i++) {
          // Randomly determine availability (for demo purposes)
          const available = Math.random() > 0.3;
          generatedSlots.push({
            id: `slot-${i}`,
            time: `${i}:00 ${i < 12 ? 'AM' : 'PM'}`.replace('12:00 PM', '12:00 PM').replace('13:00 PM', '1:00 PM')
              .replace('14:00 PM', '2:00 PM').replace('15:00 PM', '3:00 PM')
              .replace('16:00 PM', '4:00 PM').replace('17:00 PM', '5:00 PM'),
            available
          });
        }
        setTimeSlots(generatedSlots);
      } else {
        setTimeSlots([]);
      }
    }
  }, [selectedDate, selectedDoctor]);
  
  // Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep(2);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedTimeSlot(slot);
  };
  
  // Handle consultation type selection
  const handleTypeSelect = (type: AppointmentType) => {
    setSelectedType(type);
  };
  
  // Navigate to next step in booking process
  const handleNextStep = () => {
    if (bookingStep < 4) {
      setBookingStep(bookingStep + 1);
    }
  };
  
  // Navigate to previous step in booking process
  const handlePreviousStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };
  
  // Confirm appointment booking
  const handleConfirmBooking = () => {
    if (!isAuthenticated) {
      setShowAuthWarning(true);
      return;
    }
    
    setIsConfirming(true);
    
    // Simulate API call
    setTimeout(() => {
      const newAppointmentId = `appt-${Date.now()}`;
      setAppointmentId(newAppointmentId);
      setIsBooked(true);
      setIsConfirming(false);
      
      // Schedule notification based on reminder time
      const appointmentTimestamp = selectedDate?.getTime() || 0;
      const reminderMinutes = parseInt(reminderTime);
      const reminderTimestamp = appointmentTimestamp - (reminderMinutes * 60 * 1000);
      
      // For demo, we'll just log this
      console.log(`Reminder will be sent at: ${new Date(reminderTimestamp).toLocaleString()}`);
      
      // In a real app, you would set up a proper notification system
    }, 1500);
  };
  
  // Start consultation session
  const handleStartSession = () => {
    setIsSessionActive(true);
  };
  
  // End consultation session
  const handleEndSession = () => {
    setIsSessionActive(false);
  };
  
  // Authentication prompt
  if (showAuthWarning) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <AlertTriangle 
              size={48} 
              className={`mx-auto mb-4 ${darkMode ? 'text-amber-500' : 'text-amber-600'}`} 
            />
            
            <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Authentication Required
            </h1>
            
            <p className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              You need to be logged in to book a consultation with our mental health professionals.
            </p>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => navigate('/')}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Back to Home
              </Button>
              
              <Button 
                onClick={() => {
                  setShowAuthWarning(false);
                  navigate('/'); // Should navigate to login in a real app
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }
  
  // Active consultation session view
  if (isSessionActive) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-6 px-4">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedType === 'video' ? 'Video Consultation' : 'Chat Consultation'}
              </h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                with {selectedDoctor?.name}
              </p>
            </div>
            
            <Button
              onClick={handleEndSession}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              End Session
            </Button>
          </div>
          
          <Card variant="default" className={`p-0 overflow-hidden ${darkMode ? "bg-gray-800 text-white" : ""}`}>
            {selectedType === 'video' ? (
              <VideoConsultationRoom doctorName={selectedDoctor?.name || 'Doctor'} />
            ) : (
              <ChatInterface doctorName={selectedDoctor?.name || 'Doctor'} />
            )}
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Booked confirmation view
  if (isBooked) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 shadow-lg'
            }`}
          >
            <div className="flex flex-col items-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                darkMode ? 'bg-green-500 bg-opacity-20' : 'bg-green-100'
              }`}>
                <Check size={32} className="text-green-500" />
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold">Appointment Confirmed</h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Your consultation has been successfully scheduled
              </p>
            </div>
            
            <div className={`p-4 rounded-lg mb-6 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Doctor</p>
                  <p className="font-medium">{selectedDoctor?.name}</p>
                </div>
                
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date & Time</p>
                  <p className="font-medium">
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}, {selectedTimeSlot?.time}
                  </p>
                </div>
                
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Consultation Type</p>
                  <p className="font-medium flex items-center">
                    {selectedType === 'video' ? (
                      <>
                        <Video size={16} className="mr-1" />
                        Video Call
                      </>
                    ) : (
                      <>
                        <MessageCircle size={16} className="mr-1" />
                        Chat
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className={`px-4 py-3 rounded-md flex items-center ${
                darkMode ? 'bg-blue-500 bg-opacity-10 text-blue-300' : 'bg-blue-50 text-blue-700'
              }`}>
                <Bell size={18} className="mr-2" />
                <p className="text-sm">
                  Reminder set for {reminderTime} minutes before appointment{' '}
                  ({reminderType === 'push' ? 'Push Notification' : 'Email'})
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                fullWidth
                onClick={() => {
                  setIsBooked(false);
                  setBookingStep(1);
                  setSelectedDoctor(null);
                  setSelectedDate(null);
                  setSelectedTimeSlot(null);
                }}
                className={`border ${
                  darkMode 
                    ? 'border-gray-600 hover:bg-gray-700' 
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                variant="ghost"
              >
                Book Another Appointment
              </Button>
              
              <Button
                fullWidth
                onClick={handleStartSession}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!isDateToday()}
              >
                {isDateToday() ? 'Join Session Now' : 'Available on Appointment Day'}
              </Button>
            </div>
            
            {!isDateToday() && (
              <p className={`mt-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                The consultation link will be available on the day of your appointment
              </p>
            )}
          </motion.div>
        </div>
      </Layout>
    );
  }
  
  // Helper function to check if selected date is today
  const isDateToday = () => {
    const today = new Date();
    
    return (
      selectedDate &&
      today.getDate() === selectedDate.getDate() &&
      today.getMonth() === selectedDate.getMonth() &&
      today.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Main booking flow
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Mental Health Consultation
          </h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Schedule a secure video or chat session with our mental health professionals
          </p>
        </motion.div>
        
        {/* Booking progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            {['Select Doctor', 'Schedule Appointment', 'Consultation Details', 'Confirm Booking'].map((step, index) => (
              <div 
                key={step} 
                className={`flex flex-col items-center ${index > 0 ? 'flex-1' : ''} relative`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${bookingStep > index + 1 
                    ? 'bg-green-500 text-white' 
                    : bookingStep === index + 1 
                      ? `${darkMode ? 'bg-purple-500' : 'bg-purple-600'} text-white` 
                      : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                  }
                `}>
                  {bookingStep > index + 1 ? <Check size={16} /> : index + 1}
                </div>
                <p className={`text-xs mt-2 hidden md:block ${
                  bookingStep === index + 1 
                    ? darkMode ? 'text-purple-400' : 'text-purple-600'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {step}
                </p>
                
                {index < 3 && (
                  <div className={`absolute top-4 w-full left-0 h-0.5 -z-10 ${
                    bookingStep > index + 1 
                      ? 'bg-green-500' 
                      : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} style={{ left: '50%', width: '100%' }} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Step 1: Doctor Selection */}
        <AnimatePresence mode="wait">
          {bookingStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search by name or specialty"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      />
                    </div>
                  </div>
                  
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className={`px-4 py-2 rounded-lg ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  >
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>
                        {specialty === 'all' ? 'All Specialties' : specialty}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.map(doctor => (
                    <motion.div
                      key={doctor.id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        onClick={() => handleDoctorSelect(doctor)}
                        className={`cursor-pointer overflow-hidden transition-all ${
                          darkMode ? 'hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'hover:shadow-lg'
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                            <img 
                              src={doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`}
                              alt={doctor.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`;
                              }}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {doctor.name}
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {doctor.specialty}
                            </p>
                            
                            <div className="flex items-center mt-1">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i}
                                    size={14}
                                    fill={i < Math.floor(doctor.rating) ? "#FBBF24" : "none"}
                                    color={i < Math.floor(doctor.rating) ? "#FBBF24" : "#D1D5DB"}
                                    className="mr-0.5"
                                  />
                                ))}
                              </div>
                              <span className={`ml-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {doctor.rating}
                              </span>
                            </div>
                            
                            <p className={`mt-2 text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                              {doctor.experience} years experience
                            </p>
                          </div>
                        </div>
                        
                        <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Available on:
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {doctor.availability.map(day => (
                              <span 
                                key={day}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                {filteredDoctors.length === 0 && (
                  <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Info size={40} className="mx-auto mb-3 opacity-50" />
                    <p>No doctors found matching your criteria</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Step 2: Schedule Appointment */}
          {bookingStep === 2 && selectedDoctor && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="md:col-span-1 overflow-hidden">
                <button 
                  onClick={() => setBookingStep(1)}
                  className={`flex items-center mb-4 text-sm ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-1"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to Doctors
                </button>
                
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                    <img 
                      src={selectedDoctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=random`}
                      alt={selectedDoctor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=random`;
                      }}
                    />
                  </div>
                  
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedDoctor.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedDoctor.specialty}
                    </p>
                    
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i}
                            size={14}
                            fill={i < Math.floor(selectedDoctor.rating) ? "#FBBF24" : "none"}
                            color={i < Math.floor(selectedDoctor.rating) ? "#FBBF24" : "#D1D5DB"}
                            className="mr-0.5"
                          />
                        ))}
                      </div>
                      <span className={`ml-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedDoctor.rating}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className={`mt-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedDoctor.bio}
                </p>
                
                <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Available on:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedDoctor.availability.map(day => (
                      <span 
                        key={day}
                        className={`text-xs px-2 py-1 rounded-full ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Consultation Type:
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedType('video')}
                      className={`flex items-center px-3 py-2 rounded-lg flex-1 ${
                        selectedType === 'video'
                          ? darkMode 
                            ? 'bg-purple-500 bg-opacity-20 border-purple-500 text-purple-400'
                            : 'bg-purple-50 border-purple-500 text-purple-700'
                          : darkMode
                            ? 'bg-gray-800 border-gray-700 text-gray-400'
                            : 'bg-white border-gray-300 text-gray-600'
                      } border transition-colors`}
                    >
                      <Video size={18} className="mr-2" />
                      Video Call
                    </button>
                    
                    <button
                      onClick={() => setSelectedType('chat')}
                      className={`flex items-center px-3 py-2 rounded-lg flex-1 ${
                        selectedType === 'chat'
                          ? darkMode 
                            ? 'bg-purple-500 bg-opacity-20 border-purple-500 text-purple-400'
                            : 'bg-purple-50 border-purple-500 text-purple-700'
                          : darkMode
                            ? 'bg-gray-800 border-gray-700 text-gray-400'
                            : 'bg-white border-gray-300 text-gray-600'
                      } border transition-colors`}
                    >
                      <MessageCircle size={18} className="mr-2" />
                      Chat
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 pt-3 flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                    darkMode ? 'bg-purple-500 bg-opacity-20' : 'bg-purple-100'
                  }`}>
                    <Shield size={24} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                  </div>
                  
                  <p className={`text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    All consultations are encrypted and confidential, ensuring your privacy and data security.
                  </p>
                </div>
              </Card>
              
              <Card className="md:col-span-2 overflow-hidden">
                <h3 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Schedule Appointment
                </h3>
                
                <div className="mb-4">
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select Date:
                  </p>
                  
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <DoctorCalendar 
                      selectedDate={selectedDate} 
                      onDateSelect={handleDateSelect}
                      availableDays={selectedDoctor.availability}
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select Time:
                  </p>
                  
                  <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2 ${
                    timeSlots.length === 0 ? 'opacity-50' : ''
                  }`}>
                    {timeSlots.length > 0 ? (
                      timeSlots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => handleTimeSlotSelect(slot)}
                          disabled={!slot.available}
                          className={`py-2 px-1 rounded text-center text-sm ${
                            selectedTimeSlot?.id === slot.id
                              ? darkMode
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-600 text-white'
                              : slot.available
                                ? darkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                : darkMode
                                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full py-4 text-center">
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {selectedDate ? 'No available slots on this day' : 'Please select a date first'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button
                    onClick={handlePreviousStep}
                    variant="ghost"
                    className={darkMode ? 'text-gray-300' : 'text-gray-700'}
                  >
                    Back
                  </Button>
                  
                  <Button
                    onClick={handleNextStep}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!selectedDate || !selectedTimeSlot}
                  >
                    Continue
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
          
          {/* Step 3: Consultation Details */}
          {bookingStep === 3 && selectedDoctor && selectedDate && selectedTimeSlot && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <h3 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Appointment Summary
                  </h3>
                  
                  <div className={`p-4 rounded-lg mb-6 ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Doctor
                        </p>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 mr-2">
                            <img 
                              src={selectedDoctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=random`}
                              alt={selectedDoctor.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedDoctor.name}
                          </p>
                        </div>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedDoctor.specialty}
                        </p>
                      </div>
                      
                      <div>
                        <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Date & Time
                        </p>
                        <div className="flex items-center">
                          <CalendarIcon size={16} className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedDate?.toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock size={16} className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTimeSlot.time}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Consultation Type
                        </p>
                        <div className="flex items-center">
                          {selectedType === 'video' ? (
                            <>
                              <Video size={16} className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Video Call
                              </p>
                            </>
                          ) : (
                            <>
                              <MessageCircle size={16} className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Chat Consultation
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Set Appointment Reminder
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Remind me before:
                      </p>
                      <select
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      >
                        <option value="10">10 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="1440">1 day</option>
                      </select>
                    </div>
                    
                    <div>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Notification Type:
                      </p>
                      <div className="flex space-x-3">
                        <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <input
                            type="radio"
                            name="notificationType"
                            checked={reminderType === 'push'}
                            onChange={() => setReminderType('push')}
                            className="mr-2"
                          />
                          Push Notification
                        </label>
                        
                        <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <input
                            type="radio"
                            name="notificationType"
                            checked={reminderType === 'email'}
                            onChange={() => setReminderType('email')}
                            className="mr-2"
                          />
                          Email
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="md:col-span-1">
                  <h3 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Guidelines
                  </h3>
                  
                  <ul className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                    <li className="flex items-start">
                      <Check size={16} className={`mr-2 mt-0.5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      Be ready 5 minutes before your scheduled appointment time.
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className={`mr-2 mt-0.5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      Ensure you have a stable internet connection for video calls.
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className={`mr-2 mt-0.5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      Find a quiet, private space for your consultation.
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className={`mr-2 mt-0.5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      Have a list of questions or concerns ready to discuss.
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className={`mr-2 mt-0.5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      Consultations typically last 30-45 minutes.
                    </li>
                  </ul>
                  
                  <div className={`mt-6 p-3 rounded-lg ${
                    darkMode ? 'bg-blue-900 bg-opacity-20 text-blue-300' : 'bg-blue-50 text-blue-800'
                  }`}>
                    <p className="text-sm">
                      Need to cancel or reschedule? Please do so at least 4 hours in advance.
                    </p>
                  </div>
                </Card>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button
                  onClick={handlePreviousStep}
                  variant="ghost"
                  className={darkMode ? 'text-gray-300' : 'text-gray-700'}
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleNextStep}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Review & Confirm
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Step 4: Confirm Booking */}
          {bookingStep === 4 && selectedDoctor && selectedDate && selectedTimeSlot && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <Calendar className={`w-12 h-12 mx-auto mb-3 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <h3 className={`font-semibold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Confirm Your Appointment
                  </h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Please verify all details before confirming
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg mb-6 ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Doctor:</p>
                      <p className="font-medium text-right">{selectedDoctor.name}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Specialty:</p>
                      <p className="text-right">{selectedDoctor.specialty}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Date:</p>
                      <p className="text-right">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Time:</p>
                      <p className="text-right">{selectedTimeSlot.time}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Type:</p>
                      <p className="text-right">
                        {selectedType === 'video' ? 'Video Consultation' : 'Chat Consultation'}
                      </p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Reminder:</p>
                      <p className="text-right">
                        {reminderTime} minutes before ({reminderType === 'push' ? 'Push Notification' : 'Email'})
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg mb-6 ${
                  darkMode ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50'
                }`}>
                  <div className="flex items-start">
                    <Shield className={`flex-shrink-0 mr-3 ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        darkMode ? 'text-purple-300' : 'text-purple-800'
                      }`}>
                        Privacy Notice
                      </p>
                      <p className={`text-sm mt-1 ${
                        darkMode ? 'text-purple-200' : 'text-purple-700'
                      }`}>
                        Your consultation will be conducted through our secure platform, ensuring your privacy and confidentiality. All communication is encrypted end-to-end.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button
                    onClick={handlePreviousStep}
                    variant="ghost"
                    className={darkMode ? 'text-gray-300' : 'text-gray-700'}
                  >
                    Back
                  </Button>
                  
                  <Button
                    onClick={handleConfirmBooking}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isConfirming}
                  >
                    {isConfirming ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      "Confirm Appointment"
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

// Helper component: Calendar for selecting appointment dates
const DoctorCalendar: React.FC<{
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availableDays: string[];
}> = ({ selectedDate, onDateSelect, availableDays }) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = startOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const { darkMode } = useStore();
  
  // Map day names to shortened day names
  const dayNameMapping: Record<string, number> = {
    'Sun': 0,
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6
  };
  
  const availableDayNumbers = availableDays.map(day => dayNameMapping[day]);
  
  const weeks = [];
  let days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), i);
    const isToday = i === today.getDate();
    const isPast = date < today && !isToday;
    const dayOfWeek = date.getDay();
    const isAvailable = availableDayNumbers.includes(dayOfWeek) && !isPast;
    
    days.push({ day: i, isToday, isAvailable, date });
    
    if ((i + startDay) % 7 === 0 || i === daysInMonth) {
      // Fill the last week with empty cells if needed
      while (days.length % 7 !== 0) {
        days.push(null);
      }
      
      weeks.push([...days]);
      days = [];
    }
  }
  
  // Helper function to check if a date is selected
  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}
        </h3>
      </div>
      
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div 
            key={day} 
            className={`text-center text-xs font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((day, dayIndex) => {
            if (!day) {
              return <div key={`empty-${weekIndex}-${dayIndex}`} />;
            }
            
            const isSelected = day.date && isDateSelected(day.date);
            
            return (
              <button
                key={`day-${day.day}`}
                onClick={() => day.isAvailable && onDateSelect(day.date)}
                disabled={!day.isAvailable}
                className={`h-9 w-full flex items-center justify-center rounded ${
                  isSelected
                    ? darkMode
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-600 text-white'
                    : day.isToday
                      ? darkMode
                        ? 'bg-purple-900 bg-opacity-30 text-purple-400 border border-purple-500'
                        : 'bg-purple-100 text-purple-800 border border-purple-400'
                      : day.isAvailable
                        ? darkMode
                          ? 'text-white hover:bg-gray-700'
                          : 'text-gray-900 hover:bg-gray-100'
                        : darkMode
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                {day.day}
              </button>
            );
          })}
        </div>
      ))}
      
export default DoctorConsult;f selected date is today
const isDateToday = () => {
  const today = new Date();
  
  return (
    selectedDate &&
    today.getDate() === selectedDate.getDate() &&
    today.getMonth() === selectedDate.getMonth() &&
    today.getFullYear() === selectedDate.getFullYear()
  );
};

export default DoctorConsult;