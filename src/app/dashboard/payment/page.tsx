'use client';

import DashboardLayout from "@/components/layout/DashboardLayout.jsx";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { auth, db } from '@/lib/firebase/config';
import { createBrowserClient } from '@supabase/ssr';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import 'react-photo-view/dist/react-photo-view.css';


// أنواع البيانات
interface PackageType {
  title: string;
  price: number;
  originalPrice: number;
  period: string;
  discount: string;
  features: string[];
}

interface PaymentInfo {
  transactionNumber: string;
  packageType: string;
  amount: number;
  receiptUrl?: string;
  status: 'pending' | 'completed' | 'failed';
}

// تكوين الباقات (3 خطط)
const PACKAGES: Record<string, PackageType> = {
  '3months': {
    title: 'باقة النجم الصاعد ⭐',
    price: 70,
    originalPrice: 100,
    period: '3 شهور',
    discount: '30%',
    features: [
      'إنشاء ملف شخصي احترافي كامل',
      'إضافة صور وفيديوهات غير محدودة',
      'إمكانية التواصل مع الأندية مباشرة',
      'ظهور ملفك في نتائج البحث للأندية',
      'دعم فني عبر البريد الإلكتروني',
      'تحديث بياناتك في أي وقت',
      'إشعارات بالعروض الجديدة',
    ]
  },
  '6months': {
    title: 'باقة النجم الذهبي 🏅',
    price: 120,
    originalPrice: 160,
    period: '6 شهور',
    discount: '25%',
    features: [
      'كل ميزات النجم الصاعد',
      'إعلانات مميزة في البحث',
      'دعم فني أسرع عبر الواتساب',
      'إمكانية إضافة روابط سوشيال ميديا',
      'تحليل أداء ملفك وزياراته',
      'أولوية في الظهور للأندية',
      'إشعار عند مشاهدة ملفك',
    ]
  },
  '12months': {
    title: 'باقة النجم الأسطوري 👑',
    price: 180,
    originalPrice: 200,
    period: '12 شهر',
    discount: '10%',
    features: [
      'كل ميزات النجم الذهبي',
      'ترويج خاص على منصات التواصل الاجتماعي',
      'شهادة اشتراك مميزة',
      'استشارة مجانية مع خبير تسويق رياضي',
      'إمكانية تثبيت ملفك في أعلى نتائج البحث',
      'دعم فني VIP على مدار الساعة',
      'تقرير شهري مفصل عن أداء ملفك',
    ]
  }
};

// خيارات الدفع
const PAYMENT_METHODS = ['تحويل بنكي', 'مدى', 'أبل باي', 'تحويل على محفظة'];

export default function PaymentPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [supabase, setSupabase] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('3months');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [transactionNumber, setTransactionNumber] = useState<string>('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  // كود تشخيصي
  console.log('user:', user, 'loading:', loading, 'supabase:', supabase, 'selectedPackage:', selectedPackage, 'error:', error);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return;
    }

    const client = createBrowserClient(supabaseUrl, supabaseKey);
    setSupabase(client);

    // إعداد مستمع حالة المصادقة
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // الحصول على توكن Firebase
        const token = await user.getIdToken();
        // تعيين التوكن في عميل Supabase
        await client.auth.setSession({
          access_token: token,
          refresh_token: '',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // معالجة رفع الإيصال
  const handleReceiptUpload = async (file: File): Promise<string> => {
    try {
      if (!user) throw new Error('User not authenticated');

      // تحديث التوكن قبل الرفع
      const token = await user.getIdToken();
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: '',
      });

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.uid}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('wallet')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('خطأ في الرفع:', uploadError);
        throw new Error(`فشل في رفع الإيصال: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('wallet')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('خطأ في رفع الإيصال:', error);
      throw new Error('فشل في رفع الإيصال');
    }
  };

  // معالجة تقديم الدفع
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !receipt || !transactionNumber || !paymentMethod) {
      setError('يرجى إكمال جميع البيانات المطلوبة');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // رفع الإيصال
      const receiptUrl = await handleReceiptUpload(receipt);

      // حفظ معلومات الدفع
      const paymentInfo: PaymentInfo = {
        transactionNumber,
        packageType: selectedPackage,
        amount: PACKAGES[selectedPackage].price,
        receiptUrl,
        status: 'pending'
      };

      // حفظ في Firestore
      await setDoc(doc(db, 'payments', `${user.uid}-${Date.now()}`), {
        ...paymentInfo,
        paymentMethod,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error) {
      console.error('Error submitting payment:', error);
      setError('حدث خطأ أثناء معالجة الدفع');
    } finally {
      setSubmitting(false);
    }
  };

  // عرض حالة التحميل
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
        <div className="max-w-2xl py-8 mx-auto">
          <h2 className="mb-4 text-2xl font-bold text-center">اختر الباقة</h2>
          <div className="grid gap-4 mb-8 md:grid-cols-3">
            {Object.entries(PACKAGES).map(([key, pkg]) => (
              <div
                key={key}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPackage === key ? 'border-blue-600 shadow-lg bg-blue-50' : 'border-gray-300 bg-white'}`}
                onClick={() => setSelectedPackage(key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold">{pkg.title}</span>
                  <span className="font-bold text-green-600">{pkg.price} جنيه</span>
                </div>
                <div className="mb-2 text-sm text-gray-500">
                  <span className="line-through">{pkg.originalPrice} جنيه</span>
                  <span className="ml-2 text-red-500">{pkg.discount} خصم</span>
                </div>
                <div className="mb-2 text-xs text-gray-700">{pkg.period}</div>
                <ul className="ml-5 text-sm text-gray-700 list-disc">
                  {pkg.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="mb-2 text-xl font-bold">اختر طريقة الدفع</h3>
          <div className="flex gap-6 mb-6">
            {PAYMENT_METHODS.map(method => (
              <label key={method} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                {method}
              </label>
            ))}
          </div>

          {/* تعليمات خاصة عند اختيار تحويل على محفظة */}
          {paymentMethod === 'تحويل على محفظة' && (
            <div className="p-3 mb-4 text-center text-yellow-900 bg-yellow-100 border border-yellow-400 rounded">
              يرجى التحويل على محفظة <b>فودافون كاش</b> أو <b>انستا باي</b> على الرقم:
              <br />
              <span className="text-lg font-bold select-all">01017799580</span>
              <br />
              <span className="text-xs text-gray-600">يرجى رفع صورة إيصال التحويل بعد الدفع.</span>
            </div>
          )}

          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-4 border-red-500">
              <Alert open={Boolean(error)} onOpenChange={() => setError('')}>
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* رسالة النجاح */}
          {success && (
            <Alert open={success} onOpenChange={() => setSuccess(false)}>
              <AlertDescription className="text-green-600">
                تم استلام طلب الدفع بنجاح! جاري تحويلك...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-4 mb-32 space-y-4">
            <div>
              <label>رقم العملية البنكية:</label>
              <input
                type="text"
                value={transactionNumber}
                onChange={e => setTransactionNumber(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label>إرفاق إيصال التحويل:</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setReceipt(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded"
              disabled={submitting}
            >
              {submitting ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
