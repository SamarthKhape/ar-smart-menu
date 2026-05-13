import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  PlusCircle, 
  QrCode, 
  Settings, 
  LogOut,
  Menu,
  X,
  Smartphone,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useStore } from '../store/useStore';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'All Dishes', path: '/dashboard/dishes', icon: UtensilsCrossed },
    { name: 'Add Dish', path: '/dashboard/dishes/add', icon: PlusCircle },
    { name: 'QR Code', path: '/dashboard/qr', icon: QrCode },
    { name: 'Customer Preview', path: `/menu/${user?.id || 'preview'}`, icon: Smartphone },
    { name: 'Billing', path: '/dashboard/billing', icon: CreditCard },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-surface border-r border-border px-4 py-6">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/20">
          <UtensilsCrossed className="text-black h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">AR Smart Menu</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          if (item.name === 'Customer Preview') {
            return (
              <a
                key={item.name}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-item"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </a>
            );
          }
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'nav-item',
                  isActive ? 'active' : ''
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="text-primary h-6 w-6" />
          <span className="font-bold text-white">AR Smart Menu</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-gray-300 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-72 bg-surface z-50 shadow-2xl"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="mx-auto max-w-6xl p-6 md:p-10 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
