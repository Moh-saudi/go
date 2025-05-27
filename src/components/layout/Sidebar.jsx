'use client';

import { auth } from '@/lib/firebase/config';
import {
  BarChart,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Search,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';

const menuItems = [
  {
    title: 'الرئيسية',
    icon: <Home className="w-5 h-5" />,
    path: '/dashboard/player'
  },
  {
    title: 'الملف الشخصي',
    icon: <User className="w-5 h-5" />,
    path: '/dashboard/player/profile'
  },
  {
    title: 'التقارير',
    icon: <FileText className="w-5 h-5" />,
    path: '/dashboard/player/reports'
  },
  {
    title: 'بحث اللاعبين',
    icon: <Search className="w-5 h-5" />,
    path: '/dashboard/player/search'
  },
  {
    title: 'الإحصائيات',
    icon: <BarChart className="w-5 h-5" />,
    path: '/dashboard/player/stats'
  },
  {
    title: 'الفوترة والاشتراكات',
    icon: <CreditCard className="w-5 h-5" />,
    path: '/dashboard/payment'
  },
  {
    title: 'حالة الاشتراك',
    icon: <Clock className="w-5 h-5" />,
    path: '/dashboard/payment/status'
  }
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  return (
    <aside className="h-full w-64 flex flex-col bg-gradient-to-b from-[#2563eb] to-[#1e3a8a] text-white shadow-xl sticky top-16 self-start">
      {/* Logo Section */}
      <div className="p-6 text-center border-b border-blue-700">
        <h1 className="text-xl font-bold text-white">منصة اللاعب</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 min-h-0 p-2 pt-0 mt-0 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 group
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-white hover:bg-blue-700 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-transform duration-200 group-hover:scale-110
                  ${isActive ? 'text-white' : 'text-blue-200'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.title}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform duration-200
                ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto mb-6 border-t border-blue-300">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-2 p-3 text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;