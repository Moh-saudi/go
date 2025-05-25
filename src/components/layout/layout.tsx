// components/layout/layout.tsx
import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout'; // أو استيراد أي مكون تخطيط مناسب

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, ...props }) => {
  // إعادة استخدام أحد مكونات التخطيط الموجودة
  return <DashboardLayout {...props}>{children}</DashboardLayout>;
};
// يمكنك إضافة المزيد من الخصائص أو الوظائف هنا إذا لزم الأمر
export default Layout;
