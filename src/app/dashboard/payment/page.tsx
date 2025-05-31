'use client';

import DashboardLayout from "@/components/layout/DashboardLayout.jsx";
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
  popular: boolean;
  icon: string;
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
    ],
    popular: false,
    icon: '⭐'
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
    ],
    popular: true,
    icon: '🏅'
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
    ],
    popular: false,
    icon: '👑'
  }
};

// خيارات الدفع مع الأيقونات
const PAYMENT_METHODS = [
  { id: 'bank', name: 'تحويل بنكي', icon: '🏦' },
  { id: 'mada', name: 'مدى', icon: '💳' },
  { id: 'apple', name: 'أبل باي', icon: '🍎' },
  { id: 'wallet', name: 'تحويل على محفظة', icon: '👛' }
];

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
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          {/* عنوان الصفحة */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">اشترك الآن</h1>
            <p className="text-gray-600">اختر الباقة المناسبة لك وابدأ رحلة النجاح</p>
          </div>

          {/* عرض الباقات */}
          <div className="grid gap-8 mb-12 md:grid-cols-3">
            {Object.entries(PACKAGES).map(([key, pkg]) => (
              <div
                key={key}
                className={`relative p-6 transition-all duration-300 transform border-2 rounded-2xl hover:scale-105 ${
                  selectedPackage === key
                    ? 'border-blue-500 shadow-xl bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => setSelectedPackage(key)}
              >
                {/* شارة الأكثر شعبية */}
                {pkg.popular && (
                  <div className="absolute px-3 py-1 text-sm font-medium text-white transform -translate-y-1/2 bg-yellow-500 rounded-full -top-3 right-6">
                    الأكثر شعبية
                  </div>
                )}

                {/* أيقونة الباقة */}
                <div className="mb-4 text-4xl text-center">{pkg.icon}</div>

                {/* عنوان الباقة */}
                <h3 className="mb-2 text-xl font-bold text-center text-gray-900">{pkg.title}</h3>

                {/* السعر */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-blue-600">{pkg.price} جنيه</span>
                  <span className="text-sm text-gray-500 line-through">{pkg.originalPrice} جنيه</span>
                  <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                    {pkg.discount} خصم
                  </span>
                </div>

                {/* المدة */}
                <div className="mb-4 text-center">
                  <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                    {pkg.period}
                  </span>
                </div>

                {/* المميزات */}
                <ul className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* طرق الدفع */}
          <div className="p-6 mb-8 bg-white rounded-2xl shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-gray-900">اختر طريقة الدفع</h3>
            <div className="grid gap-4 md:grid-cols-4">
              {PAYMENT_METHODS.map(method => (
                <label
                  key={method.id}
                  className={`flex flex-col items-center p-4 transition-all duration-200 border-2 rounded-xl cursor-pointer hover:border-blue-300 ${
                    paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="hidden"
                  />
                  <span className="mb-2 text-2xl">{method.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{method.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* تعليمات خاصة عند اختيار تحويل على محفظة */}
          {paymentMethod === 'wallet' && (
            <div className="p-6 mb-8 text-center bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
              <h4 className="mb-3 text-lg font-bold text-yellow-800">تعليمات التحويل</h4>
              <p className="mb-2 text-yellow-700">
                يرجى التحويل على محفظة <b>فودافون كاش</b> أو <b>انستا باي</b> على الرقم:
              </p>
              <div className="p-3 mb-3 text-xl font-bold text-yellow-900 bg-yellow-100 rounded-lg select-all">
                01017799580
              </div>
              <p className="text-sm text-yellow-600">
                يرجى رفع صورة إيصال التحويل بعد الدفع
              </p>
            </div>
          )}

          {/* رسائل الخطأ والنجاح */}
          {error && (
            <div className="p-4 mb-6 text-red-700 bg-red-100 border-2 border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 mb-6 text-green-700 bg-green-100 border-2 border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <p>تم استلام طلب الدفع بنجاح! جاري تحويلك...</p>
              </div>
            </div>
          )}

          {/* نموذج الدفع */}
          <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  رقم العملية البنكية
                </label>
                <input
                  type="text"
                  value={transactionNumber}
                  onChange={e => setTransactionNumber(e.target.value)}
                  className="w-full p-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="أدخل رقم العملية البنكية"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  يمكنك العثور على رقم العملية في إيصال التحويل
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  إرفاق إيصال التحويل
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setReceipt(e.target.files?.[0] || null)}
                    className="w-full p-3 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  {receipt && (
                    <div className="mt-2 p-2 text-sm text-green-600 bg-green-50 rounded-lg">
                      تم اختيار الملف: {receipt.name}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  يرجى رفع صورة واضحة للإيصال
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full p-4 text-white font-medium rounded-xl transition-all duration-200 ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإرسال...
                  </div>
                ) : (
                  'إرسال طلب الدفع'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
