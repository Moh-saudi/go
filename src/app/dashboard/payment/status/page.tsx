'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SubscriptionStatus {
  plan_name: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  payment_method: string;
  amount: number;
  currency: string;
  receipt_url?: string;
  receipt_uploaded_at?: string;
  autoRenew: boolean;
}

function SubscriptionStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user] = useAuthState(auth);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const subscriptionRef = doc(db, 'subscriptions', user.uid);
        const subscriptionDoc = await getDoc(subscriptionRef);

        if (subscriptionDoc.exists()) {
          const data = subscriptionDoc.data() as SubscriptionStatus;
          setSubscription(data);
        } else {
          setError('لم يتم العثور على بيانات الاشتراك');
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('حدث خطأ أثناء جلب بيانات الاشتراك');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في انتظار التأكيد';
      case 'active':
        return 'نشط';
      case 'expired':
        return 'منتهي';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-800">حدث خطأ</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/dashboard/payment')}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            العودة إلى صفحة الدفع
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <AlertCircle className="w-12 h-12 mx-auto text-yellow-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-800">لا يوجد اشتراك</h2>
          <p className="mt-2 text-gray-600">لم يتم العثور على أي اشتراك نشط</p>
          <button
            onClick={() => router.push('/dashboard/payment')}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            العودة إلى صفحة الدفع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="max-w-2xl mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          {/* حالة الاشتراك */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">حالة الاشتراك</h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
              {getStatusText(subscription.status)}
            </span>
          </div>

          {/* تفاصيل الاشتراك */}
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-gray-50">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">تفاصيل الاشتراك</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">الباقة</p>
                  <p className="font-medium">{subscription.plan_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">المبلغ</p>
                  <p className="font-medium">{subscription.amount} {subscription.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ البدء</p>
                  <p className="font-medium">{new Date(subscription.start_date).toLocaleDateString('ar-EG')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الانتهاء</p>
                  <p className="font-medium">{new Date(subscription.end_date).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
            </div>

            {/* معلومات الدفع */}
            <div className="p-4 rounded-lg bg-gray-50">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">معلومات الدفع</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">طريقة الدفع</p>
                  <p className="font-medium">
                    {subscription.payment_method === 'bank_transfer' ? 'تحويل بنكي' : 'بطاقة ائتمان'}
                  </p>
                </div>
                {subscription.receipt_url && (
                  <div>
                    <p className="text-sm text-gray-500">صورة الإيصال</p>
                    <a
                      href={subscription.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      عرض الإيصال
                    </a>
                  </div>
                )}
                {subscription.receipt_uploaded_at && (
                  <div>
                    <p className="text-sm text-gray-500">تاريخ رفع الإيصال</p>
                    <p className="font-medium">
                      {new Date(subscription.receipt_uploaded_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* رسالة الحالة */}
            {subscription.status === 'pending' && (
              <div className="p-4 rounded-lg bg-yellow-50">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <Clock className="w-5 h-5 mt-1 text-yellow-500" />
                  <div>
                    <h3 className="font-medium text-yellow-800">في انتظار التأكيد</h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      تم استلام طلب الاشتراك الخاص بك وسيتم مراجعته من قبل إدارة المنصة قريباً.
                      سيتم إعلامك عبر البريد الإلكتروني عند تأكيد الاشتراك.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* أزرار التحكم */}
            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => router.push('/dashboard/payment')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                العودة
              </button>
              {subscription.status === 'pending' && (
                <button
                  onClick={() => router.push('/dashboard/payment')}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  تحديث الحالة
                </button>
              )}
            </div>

            {/* تجديد تلقائي */}
            <div className="p-4 rounded-lg bg-gray-50">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">تجديد تلقائي</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">تجديد تلقائي</p>
                  <input 
                    type="checkbox" 
                    id="autoRenew" 
                    checked={subscription.autoRenew} 
                    readOnly
                    className="w-4 h-4 ml-2 text-blue-600 border-gray-300 rounded" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionStatusPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    }>
      <SubscriptionStatusContent />
    </Suspense>
  );
}