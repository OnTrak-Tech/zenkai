import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Arena from './pages/Arena';
import Lobby from './pages/Lobby';
import { useWallet } from './context/WalletContext';

function App() {
  const { isConnected } = useWallet();

  return (
    <Router>
      <Routes>
        <Route path="/" element={isConnected ? <Navigate to="/lobby" replace /> : <Home />} />
        <Route element={<Layout />}>
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/arena" element={<Arena />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
