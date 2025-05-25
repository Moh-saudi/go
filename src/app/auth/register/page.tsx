'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { registerUser } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Home,
  Loader2,
  Lock,
  Phone,
  Shield,
  Star,
  User,
  UserCheck,
  Users
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: '',
    name: '',
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const accountTypes = [
    { value: 'player', label: 'لاعب', icon: Star },
    { value: 'club', label: 'نادي', icon: Home },
    { value: 'agent', label: 'وكيل لاعبين', icon: UserCheck },
    { value: 'marketer', label: 'مسوق لاعبين', icon: Users }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    // إذا كان الحقل هو رقم الهاتف، نتأكد من أنه يحتوي فقط على أرقام
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    // التحقق من الاسم
    if (!formData.name.trim()) {
      setError('يرجى إدخال الاسم الكامل');
      return false;
    }

    // التحقق من رقم الهاتف
    if (!formData.phone.trim()) {
      setError('يرجى إدخال رقم الهاتف');
      return false;
    }

    // التحقق من صحة تنسيق رقم الهاتف
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام');
      return false;
    }

    // التحقق من كلمة المرور
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return false;
    }

    // التحقق من نوع الحساب
    if (!formData.accountType) {
      setError('يرجى اختيار نوع الحساب');
      return false;
    }

    // التحقق من الموافقة على الشروط
    if (!formData.agreeToTerms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerUser(formData);
      setMessage('تم التسجيل بنجاح! جاري تحويلك...');
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
      } else {
        setError('حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-600 to-purple-700" dir="rtl">
      <div className="w-full max-w-xl overflow-hidden bg-white shadow-2xl rounded-xl">
        {/* Header Section */}
        <div className="p-6 text-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">إنشاء حساب جديد</h1>
          <p className="text-blue-100">انضم إلى مجتمعنا الرياضي</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-6">
          {/* Error and Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-4 text-red-700 rounded-lg bg-red-50">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}
          {message && (
            <div className="flex items-center gap-2 p-4 text-green-700 rounded-lg bg-green-50">
              <CheckCircle className="w-5 h-5" />
              <p>{message}</p>
            </div>
          )}

          {/* Account Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            {accountTypes.map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  formData.accountType === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={value}
                  checked={formData.accountType === value}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <Icon className={`h-5 w-5 ${formData.accountType === value ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={formData.accountType === value ? 'text-blue-700' : 'text-gray-600'}>{label}</span>
              </label>
            ))}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block mb-2 text-gray-700">الاسم الكامل</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل اسمك الكامل"
                  required
                  maxLength={50}
                />
                <User className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
              </div>
            </div>
            {/* Phone Input */}
            <div>
              <label className="block mb-2 text-gray-700">رقم الهاتف</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل رقم الهاتف"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
                <Phone className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
              </div>
            </div>
            {/* Password Input */}
            <div>
              <label className="block mb-2 text-gray-700">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8 أحرف على الأقل"
                  required
                  minLength={8}
                />
                <Lock className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {/* Confirm Password Input */}
            <div>
              <label className="block mb-2 text-gray-700">تأكيد كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أعد إدخال كلمة المرور"
                  required
                />
                <Lock className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-base text-gray-600">أوافق على
              <button type="button" className="ml-1 text-blue-600 hover:underline" onClick={() => setShowTerms(true)}>
                الشروط والأحكام
              </button>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg text-white font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري التسجيل...
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                إنشاء حساب جديد
              </>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center text-gray-600">
            لديك حساب بالفعل؟{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              تسجيل الدخول
            </button>
          </div>
        </form>
      </div>

      {/* Terms and Conditions Dialog */}
      <AlertDialog open={showTerms} onOpenChange={setShowTerms}>
  <AlertDialogContent className="max-w-3xl">
    <AlertDialogHeader>
      <AlertDialogTitle className="mb-4 text-2xl font-bold">
        الشروط والأحكام وسياسة الخصوصية
      </AlertDialogTitle>
    </AlertDialogHeader>
    <div className="space-y-4 text-gray-700 overflow-y-auto max-h-[60vh]">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">1. مقدمة</h3>
        <div className="text-sm text-gray-600">
          مرحباً بك في منصة Hagzz-Go. نحن نقدم خدمات رياضية متخصصة تهدف إلى ربط اللاعبين بالفرص المناسبة.
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold">2. شروط التسجيل</h3>
        <div className="space-y-2">
          <div className="flex gap-2 text-sm text-gray-600">
            <span>•</span>
            <span>يجب أن تكون فوق 16 عاماً للتسجيل في المنصة</span>
          </div>
          <div className="flex gap-2 text-sm text-gray-600">
            <span>•</span>
            <span>يجب تقديم معلومات صحيحة ودقيقة عند التسجيل</span>
          </div>
          <div className="flex gap-2 text-sm text-gray-600">
            <span>•</span>
            <span>يجب الحفاظ على سرية معلومات حسابك</span>
          </div>
          <div className="flex gap-2 text-sm text-gray-600">
            <span>•</span>
            <span>يحق لنا إيقاف أي حساب يخالف شروط الاستخدام</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold">3. سياسة الخصوصية</h3>
        <div className="space-y-2">
          <div className="flex gap-2 text-sm text-gray-600">
            <span>•</span>
            <span>نحن نحمي معلوماتك الشخصية ونحترم خصوصيتك</span>
          </div>
          <div className="flex gap-2 text-sm text-gray-600">
            <span>•</span>
            <span>لن نشارك معلوماتك مع أي طرف ثالث دون موافقتك</span>
          </div>
          <div className="flex gap-2 text-sm text-gray-600">
            <span>•</span>
            <span>يمكنك طلب حذف حسابك وبياناتك في أي وقت</span>
          </div>
          <div className="flex gap-2 text-sm text-gray-600">
            <span>•</span>
            <span>نستخدم تقنيات تشفير متقدمة لحماية بياناتك</span>
          </div>
        </div>
      </div>
    </div>
  </AlertDialogContent>
</AlertDialog>
    </div>
  );
}