import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MoodTracker from './pages/MoodTracker';
import Forum from './pages/Forum';
import Resources from './pages/Resources';
import Music from './pages/Music';
import Achievements from './pages/Achievements';
import Emergency from './pages/Emergency';
import TimeCapsule from './pages/TimeCapsule';
import BodyMap from './pages/BodyMap';
import VentBox from './pages/VentBox';
import Friends from './pages/Friends';
import Doctor from './pages/Doctor';
import useStore from './store/useStore';

const App: React.FC = () => {
  const { darkMode } = useStore();
  
  return (
    <div className={darkMode ? 'dark' : ''}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mood-tracker" element={<MoodTracker />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/music" element={<Music />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/time-capsule" element={<TimeCapsule />} />
          <Route path="/body-map" element={<BodyMap />} />
          <Route path="/vent-box" element={<VentBox />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/doctor" element={<Doctor />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;