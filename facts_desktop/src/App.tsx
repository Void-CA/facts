import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BaseLayout from './layout/BaseLayout';
import Home from './pages/Home';
import Invoices from './pages/Invoices';
import Clients from './pages/Clients';
import Export from './pages/Export';
import Settings from './pages/Settings';
import "./App.css"

// Dummy components for remaining routes
const Stats = () => <h1 className="text-3xl font-bold text-text-main tracking-tight">Estadísticas</h1>;
const Notifications = () => <h1 className="text-3xl font-bold text-text-main tracking-tight">Notificaciones</h1>;
const Profile = () => <h1 className="text-3xl font-bold text-text-main tracking-tight">Perfil</h1>;

function App() {
  return (
    <Router>
      <BaseLayout username="Admin User">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/export" element={<Export />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BaseLayout>
    </Router>
  );
}

export default App;
