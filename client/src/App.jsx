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

function AppContent() {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const navigate = useNavigate();

  const handleOrderCreated = (order) => {
    navigate('/officeadmin');
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenNewOrder={() => setIsNewOrderOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home onOpenNewOrder={() => setIsNewOrderOpen(true)} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/track" element={<ClientTrack />} />
          <Route path="/track/:orderId" element={<ClientTrack />} />

          {/* Admin shortcut -> Office Admin Intake */}
          <Route path="/admin" element={<Navigate to="/officeadmin" replace />} />

          {/* Protected: Office Admin Only */}
          <Route
            path="/officeadmin"
            element={
              <ProtectedRoute allowedRoles={['OFFICE_ADMIN']}>
                <OfficeAdmin onOpenNewOrder={() => setIsNewOrderOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/office"
            element={
              <ProtectedRoute allowedRoles={['OFFICE_ADMIN']}>
                <OfficeAdmin onOpenNewOrder={() => setIsNewOrderOpen(true)} />
              </ProtectedRoute>
            }
          />

          {/* Protected: Warehouse Admin & Office Admin */}
          <Route
            path="/warehouseadmin"
            element={
              <ProtectedRoute allowedRoles={['WAREHOUSE_ADMIN', 'OFFICE_ADMIN']}>
                <WarehouseAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute allowedRoles={['WAREHOUSE_ADMIN', 'OFFICE_ADMIN']}>
                <WarehouseAdmin />
              </ProtectedRoute>
            }
          />

          {/* Protected: Authenticated Client Portal */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={['CLIENT']}>
                <ClientPortal />
              </ProtectedRoute>
            }
          />
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
