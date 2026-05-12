import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Arena from './pages/Arena';
import Ranks from './pages/Ranks';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/ranks" element={<Ranks />} />
          <Route path="/profile" element={<div className="text-center py-20 font-headline text-on-surface-variant uppercase tracking-widest">Profile Screen (Coming Soon)</div>} />
          <Route path="/game/:matchId" element={<div className="text-center py-20 font-headline text-on-surface-variant uppercase tracking-widest">Game Screen (Coming Soon)</div>} />
          <Route path="/settlement" element={<div className="text-center py-20 font-headline text-on-surface-variant uppercase tracking-widest">Settlement Screen (Coming Soon)</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
