import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Phone, MessageSquare, Star, Calendar as CalendarIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useStore from '../store/useStore';
import { format, addDays, isSameDay } from 'date-fns';

const Doctor: React.FC = () => {
  const { doctors, appointments, bookAppointment, cancelAppointment, user, darkMode } = useStore();
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'video' | 'audio' | 'chat'>('video');
  const [isBooking, setIsBooking] = useState(false);
  
  const selectedDoctorData = doctors.find(doctor => doctor.id === selectedDoctor);
  
  const userAppointments = appointments.filter(
    appointment => appointment.userId === user.id && appointment.status !== 'cancelled'
  );
  
  const getAvailableTimes = () => {
    // In a real app, this would come from the backend
    const times = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
    
    // Filter out times that are already booked
    return times.filter(time => {
      const isBooked = appointments.some(appointment => 
        appointment.doctorId === selectedDoctor &&
        appointment.date === format(selectedDate, 'yyyy-MM-dd') &&
        appointment.time === time &&
        appointment.status !== 'cancelled'
      );
      
      return !isBooked;
    });
  };
  
  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedTime) return;
    
    setIsBooking(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      bookAppointment({
        doctorId: selectedDoctor,
        userId: user.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        status: 'scheduled',
        type: appointmentType
      });
      
      setIsBooking(false);
      setSelectedTime(null);
    }, 1000);
  };
  
  const handleCancelAppointment = (appointmentId: string) => {
    cancelAppointment(appointmentId);
  };
  
  const formatAppointmentDate = (date: string) => {
    return format(new Date(date), 'MMMM d, yyyy');
  };
  
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={16} />;
      case 'audio': return <Phone size={16} />;
      case 'chat': return <MessageSquare size={16} />;
      default: return <Video size={16} />;
    }
  };
  
  const getDayName = (date: Date) => {
    return format(date, 'EEE');
  };
  
  const getDayNumber = (date: Date) => {
    return format(date, 'd');
  };
  
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Consult a Professional
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Book a consultation with a mental health professional.
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Available Professionals
              </h2>
              
              <div className="space-y-4">
                {doctors.map(doctor => (
                  <motion.div
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`p-4 rounded-lg cursor-pointer ${
                      selectedDoctor === doctor.id
                        ? darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex">
                      <img 
                        src={doctor.avatar} 
                        alt={doctor.name} 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      
                      <div className="ml-4">
                        <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {doctor.name}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {doctor.specialty}
                        </p>
                        
                        <div className="flex items-center mt-1">
                          <Star size={14} className="text-yellow-400" />
                          <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {doctor.rating} ({doctor.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2"
          >
            {selectedDoctor && selectedDoctorData ? (
              <Card>
                <div className="flex flex-col md:flex-row md:items-start md:space-x-6 mb-6">
                  <img 
                    src={selectedDoctorData.avatar} 
                    alt={selectedDoctorData.name} 
                    className="w-24 h-24 rounded-full object-cover mb-4 md:mb-0"
                  />
                  
                  <div>
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {selectedDoctorData.name}
                    </h2>
                    <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedDoctorData.specialty}
                    </p>
                    
                    <div className="flex items-center mb-2">
                      <Star size={16} className="text-yellow-400" />
                      <span className={`ml-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedDoctorData.rating} ({selectedDoctorData.reviews} reviews)
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedDoctorData.bio}
                    </p>
                    
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Clock size={12} className="mr-1" />
                      Available: {selectedDoctorData.availability.days.join(', ')}, {selectedDoctorData.availability.hours}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-b py-4 mb-4 border-gray-200 dark:border-gray-700">
                  <h3 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Select Date
                  </h3>
                  
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {next7Days.map((date) => (
                      <motion.div
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer min-w-[70px] ${
                          isSameDay(selectedDate, date)
                            ? darkMode ? 'bg-purple-700 text-white' : 'bg-purple-500 text-white'
                            : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-xs font-medium">{getDayName(date)}</span>
                        <span className="text-lg font-bold">{getDayNumber(date)}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Available Times
                  </h3>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {getAvailableTimes().map((time) => (
                      <motion.div
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`flex items-center justify-center p-2 rounded-lg cursor-pointer ${
                          selectedTime === time
                            ? darkMode ? 'bg-purple-700 text-white' : 'bg-purple-500 text-white'
                            : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-sm">{time}</span>
                      </motion.div>
                    ))}
                    
                    {getAvailableTimes().length === 0 && (
                      <p className={`col-span-4 text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No available times for this date
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Appointment Type
                  </h3>
                  
                  <div className="flex space-x-2">
                    <motion.div
                      onClick={() => setAppointmentType('video')}
                      className={`flex items-center justify-center p-3 rounded-lg cursor-pointer flex-1 ${
                        appointmentType === 'video'
                          ? darkMode ? 'bg-purple-700 text-white' : 'bg-purple-500 text-white'
                          : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Video size={18} className="mr-2" />
                      <span>Video</span>
                    </motion.div>
                    
                    <motion.div
                      onClick={() => setAppointmentType('audio')}
                      className={`flex items-center justify-center p-3 rounded-lg cursor-pointer flex-1 ${
                        appointmentType === 'audio'
                          ? darkMode ? 'bg-purple-700 text-white' : 'bg-purple-500 text-white'
                          : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone size={18} className="mr-2" />
                      <span>Audio</span>
                    </motion.div>
                    
                    <motion.div
                      onClick={() => setAppointmentType('chat')}
                      className={`flex items-center justify-center p-3 rounded-lg cursor-pointer flex-1 ${
                        appointmentType === 'chat'
                          ? darkMode ? 'bg-purple-700 text-white' : 'bg-purple-500 text-white'
                          : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageSquare size={18} className="mr-2" />
                      <span>Chat</span>
                    </motion.div>
                  </div>
                </div>
                
                <Button
                  onClick={handleBookAppointment}
                  disabled={!selectedTime || isBooking}
                  fullWidth
                >
                  {isBooking ? 'Booking...' : 'Book Appointment'}
                </Button>
              </Card>
            ) : (
              <Card className="h-full">
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <CalendarIcon size={64} className={`mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select a Professional
                  </h3>
                  <p className={`text-center max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Choose a mental health professional from the list to view their availability and book an appointment
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Your Appointments
          </h2>
          
          {userAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAppointments.map((appointment) => {
                const doctor = doctors.find(d => d.id === appointment.doctorId);
                
                return (
                  <Card key={appointment.id}>
                    <div className="flex items-start">
                      {doctor && (
                        <img 
                          src={doctor.avatar} 
                          alt={doctor.name} 
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                      )}
                      
                      <div>
                        <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {doctor?.name}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {doctor?.specialty}
                        </p>
                        
                        <div className="flex items-center mt-2">
                          <Calendar size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {formatAppointmentDate(appointment.date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center mt-1">
                          <Clock size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {appointment.time}
                          </span>
                        </div>
                        
                        <div className={`flex items-center mt-2 px-2 py-1 rounded-full w-fit text-xs ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          {getAppointmentTypeIcon(appointment.type)}
                          <span className="ml-1 capitalize">{appointment.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        fullWidth
                      >
                        Cancel Appointment
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              You don't have any upcoming appointments.
            </p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Doctor;