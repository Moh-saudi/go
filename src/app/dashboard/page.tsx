'use client';

import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Success Message Component
type SuccessMessageProps = {
  message: string;
};

const SuccessMessage = ({ message }: SuccessMessageProps): JSX.Element => (
  <div className="fixed inset-x-0 top-0 z-50 p-4">
    <div className="w-full max-w-md p-4 mx-auto bg-green-100 rounded-lg shadow-lg">
      <div className="flex items-center">
        <Check className="w-5 h-5 mr-2 text-green-500" />
        <p className="text-green-700">{message}</p>
      </div>
    </div>
  </div>
);

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, loading, userData } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('DEBUG: [useEffect 1] user:', user);
    console.log('DEBUG: [useEffect 1] loading:', loading);
    console.log('DEBUG: [useEffect 1] userData:', userData);

    if (!loading) {
      setIsInitialized(true);
    }
  }, [loading, user, userData]);

  useEffect(() => {
    if (!isInitialized) return;

    const redirectUser = async () => {
      console.log('Starting redirect process...');

      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/auth/login');
        return;
      }

      try {
        console.log('Fetching user data for:', user.uid);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (userSnap.exists() && userData) {
          console.log('User data found:', userData);
          // Set success message based on account type
          const accountTypeMessages = {
            admin: 'تم تسجيل دخولك بنجاح كمسؤول',
            player: 'تم تسجيل دخولك بنجاح كلاعب',
            marketer: 'تم تسجيل دخولك بنجاح كمسوق'
          };

          const message = accountTypeMessages[userData.accountType as keyof typeof accountTypeMessages] || 'تم تسجيل دخولك بنجاح';
          setSuccessMessage(message);
          setIsRedirecting(true);

          // Redirect after showing message
          const redirectPath = (() => {
            switch (userData.accountType) {
              case 'admin':
                return '/dashboard/admin';
              case 'player':
                return '/dashboard/player';
              case 'marketer':
                return '/dashboard/marketer';
              default:
                console.warn('Unknown account type:', userData.accountType);
                return '/auth/login';
            }
          })();

          console.log('Redirecting to:', redirectPath);
          setTimeout(() => {
            console.log('Executing redirect to:', redirectPath);
            router.push(redirectPath);
          }, 2000);
        } else {
          console.warn('No user data found for:', user.uid);
          setError('لم يتم العثور على بيانات المستخدم');
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('حدث خطأ أثناء جلب بيانات المستخدم');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    };

    redirectUser();
  }, [isInitialized, user, router]);

  if (loading || !isInitialized) {
    console.log('DEBUG: [render] loading:', loading, 'isInitialized:', isInitialized, 'user:', user);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="p-4 text-red-600 bg-red-100 rounded-lg">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main state:', { successMessage, isRedirecting });
  return (
    <div className="min-h-screen bg-gray-50">
      {successMessage && <SuccessMessage message={successMessage} />}
      {isRedirecting && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري تحويلك إلى لوحة التحكم...</p>
          </div>
        </div>
      )}
    </div>
  );
}
