import { FirebaseAuthProvider } from "@/lib/firebase/auth-provider";
import './globals.css';

export const metadata = {
  title: 'HagzZGo - منصة اكتشاف المواهب الرياضية',
  description: 'منصة متكاملة تربط بين اللاعبين والأندية والمدربين',
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar">
      <body>
        <FirebaseAuthProvider>
          {children}
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}