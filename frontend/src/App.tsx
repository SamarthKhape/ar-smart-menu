import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import CustomerLayout from './layouts/CustomerLayout';
import { useStore } from './store/useStore';
import { Loader2 } from 'lucide-react';

// Placeholders for pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AllDishes from './pages/AllDishes';
import AddDish from './pages/AddDish';
import QrCode from './pages/QrCode';
import Settings from './pages/Settings';
import CustomerMenu from './pages/CustomerMenu';
import Pricing from './pages/Pricing';
import Billing from './pages/Billing';
import { PaymentSuccess, PaymentFailed } from './pages/PaymentStatus';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useStore();
  
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  // Bypassed for demonstration purposes
  return <>{children}</>;
}

function App() {
  const initialize = useStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<SubscriptionGuard><Dashboard /></SubscriptionGuard>} />
          <Route path="dishes" element={<SubscriptionGuard><AllDishes /></SubscriptionGuard>} />
          <Route path="dishes/add" element={<SubscriptionGuard><AddDish /></SubscriptionGuard>} />
          <Route path="qr" element={<SubscriptionGuard><QrCode /></SubscriptionGuard>} />
          <Route path="settings" element={<SubscriptionGuard><Settings /></SubscriptionGuard>} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="billing" element={<Billing />} />
        </Route>

        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />

        {/* Customer Menu Routes */}
        <Route path="/menu" element={<CustomerLayout />}>
          <Route path="preview" element={<CustomerMenu />} />
          <Route path=":restaurantId" element={<CustomerMenu />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
