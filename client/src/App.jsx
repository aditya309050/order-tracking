import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OfficeAdmin from './pages/OfficeAdmin';
import WarehouseAdmin from './pages/WarehouseAdmin';
import ClientTrack from './pages/ClientTrack';
import ClientPortal from './pages/ClientPortal';
import Login from './pages/Login';
import NewOrderModal from './components/NewOrderModal';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import AdminGateway from './pages/AdminGateway';
import { useAuth } from './context/AuthContext';

function RedirectToPayload() {
  React.useEffect(() => {
    window.location.href = 'http://localhost:3001/admin';
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 p-6">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <div>
        <h2 className="text-base font-bold text-white font-mono">Redirecting to Payload CMS Admin...</h2>
        <p className="text-xs text-slate-400 mt-1">Opening the Admin Studio at <code className="text-purple-300">http://localhost:3001/admin</code></p>
      </div>
      <a
        href="http://localhost:3001/admin"
        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
      >
        Click here if not redirected automatically &rarr;
      </a>
    </div>
  );
}

function RootLanding() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is logged in as client, send them to their orders
  if (isAuthenticated && user?.role === 'CLIENT') {
    return <Navigate to="/client" replace />;
  }

  // Default starting page: always show the Login / Tracking Portal
  return <Login />;
}

function AppContent() {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const navigate = useNavigate();

  const handleOrderCreated = (order) => {
    navigate('/client');
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenNewOrder={() => setIsNewOrderOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        <Routes>
          {/* Default Starting Point: Client Tracking Portal & Login */}
          <Route path="/" element={<RootLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/overview" element={<Home onOpenNewOrder={() => setIsNewOrderOpen(true)} />} />
          <Route path="/track" element={<ClientTrack />} />
          <Route path="/track/:orderId" element={<ClientTrack />} />

          {/* Authenticated Client Orders Portal */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={['CLIENT']}>
                <ClientPortal />
              </ProtectedRoute>
            }
          />

          {/* All Admin routes automatically forward to Payload CMS (Port 3001) */}
          <Route path="/admin" element={<RedirectToPayload />} />
          <Route path="/officeadmin" element={<RedirectToPayload />} />
          <Route path="/office" element={<RedirectToPayload />} />
          <Route path="/warehouseadmin" element={<RedirectToPayload />} />
          <Route path="/warehouse" element={<RedirectToPayload />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f2533] bg-[#090b10] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px]">Vanguard OMS &bull; Fabrication Operations & Dispatch Ledger</p>
          <p className="font-mono text-[10px] text-slate-600">Role-Based Security &bull; Port 3000 / Port 5000</p>
        </div>
      </footer>

      {/* Global New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
