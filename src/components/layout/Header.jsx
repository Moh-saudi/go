'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'تم تحديث ملفك الشخصي', time: 'منذ 5 دقائق' },
    { id: 2, title: 'لديك تقرير جديد', time: 'منذ ساعة' },
    { id: 3, title: 'تم إضافة صورة جديدة', time: 'منذ 3 ساعات' }
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/hagzz-logo.png" alt="Logo" className="w-auto h-10" />
          </div>
          {/* Search Bar */}
          <div className="flex-1 hidden max-w-xl mx-4 lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder="بحث..."
                className="w-full px-4 py-2 pr-10 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
          {/* Right Side Icons */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg w-80"
                  >
                    <div className="p-4">
                      <h3 className="mb-4 text-lg font-semibold">الإشعارات</h3>
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="p-3 rounded-lg bg-gray-50">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-gray-500">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages */}
            <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Help */}
            <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
              <HelpCircle className="w-6 h-6" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <img
                  src="/default-avatar.png"
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 w-48 mt-2 bg-white rounded-lg shadow-lg"
                  >
                    <div className="p-2">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <User className="w-5 h-5" />
                        <span>الملف الشخصي</span>
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <Settings className="w-5 h-5" />
                        <span>الإعدادات</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden"
          >
            <div className="px-4 py-2 space-y-2 bg-gray-50">
              <input
                type="text"
                placeholder="بحث..."
                className="w-full px-4 py-2 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <nav className="flex flex-col space-y-2">
                <Link href="/dashboard" className="p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                  الرئيسية
                </Link>
                <Link href="/dashboard/profile" className="p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                  الملف الشخصي
                </Link>
                <Link href="/dashboard/settings" className="p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                  الإعدادات
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header; 