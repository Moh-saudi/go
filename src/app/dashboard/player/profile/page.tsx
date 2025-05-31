'use client';

import DashboardLayout from "@/components/layout/DashboardLayout.jsx";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/firebase/auth-provider';
import { auth, db } from "@/lib/firebase/config";
import { deleteImage } from '@/lib/utils/upload';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import 'firebase/compat/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Check, Plus, Trash, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
  </div>
);

// Success Message Component
const SuccessMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-x-0 top-0 z-50 p-4">
    <div className="w-full max-w-md p-4 mx-auto bg-green-100 rounded-lg shadow-lg">
      <div className="flex items-center">
        <Check className="w-5 h-5 mr-2 text-green-500" />
        <p className="text-green-700">{message}</p>
      </div>
    </div>
  </div>
);

// Types
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

interface PlayerState {
  full_name: string;
  birth_date: string | null;
  nationality: string;
  city: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  brief: string;
  education_level: string;
  graduation_year: string;
  degree: string;
  english_level: string;
  arabic_level: string;
  spanish_level: string;
  blood_type: string;
  height: string;
  weight: string;
  chronic_conditions: boolean;
  chronic_details: string;
  injuries: string[];
  surgeries: string[];
  allergies: string;
  medical_notes: string;
  primary_position: string;
  secondary_position: string;
  preferred_foot: string;
  club_history: string[];
  experience_years: string;
  sports_notes: string;
  technical_skills: Record<string, number>;
  physical_skills: Record<string, number>;
  social_skills: Record<string, number>;
  objectives: Record<string, boolean>;
  profile_image: string | null;
  additional_images: string[];
  videos: { url: string; desc: string }[];
  training_courses: string[];
  has_passport: 'yes' | 'no';
  ref_source: string;
  contract_history: string[];
  agent_history: string[];
  official_contact: {
    name: string;
    title: string;
    phone: string;
    email: string;
  };
  currently_contracted: 'yes' | 'no';
  achievements: Array<{
    title: string;
    date: string;
    description?: string;
  }>;
  medical_history: {
    blood_type: string;
    chronic_conditions?: string[];
    allergies?: string[];
    injuries?: Array<{
      type: string;
      date: string;
      recovery_status: string;
    }>;
    last_checkup?: string;
  };
  current_club?: string;
  previous_clubs?: string[];
  documents?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

interface FormErrors {
  fetch?: string;
  submit?: string;
  profileImage?: string;
  additionalImage?: string;
  video?: string;
  general?: string;
  [key: string]: string | undefined;
}

interface PlayerFormData {
  full_name: string;
  birth_date: string;
  nationality: string;
  city: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  brief: string;
  education_level: string;
  graduation_year: string;
  degree: string;
  english_level: string;
  arabic_level: string;
  spanish_level: string;
  blood_type: string;
  height: string;
  weight: string;
  chronic_conditions: boolean;
  chronic_details: string;
  injuries: Array<{ type: string; date: string; status: string }>;
  surgeries: Array<{ type: string; date: string }>;
  allergies: string;
  medical_notes: string;
  primary_position: string;
  secondary_position: string;
  preferred_foot: string;
  club_history: Array<{ name: string; from: string; to: string }>;
  experience_years: string;
  sports_notes: string;
  technical_skills: Record<string, number>;
  physical_skills: Record<string, number>;
  social_skills: Record<string, number>;
  objectives: Record<string, boolean> & { other?: string };
  profile_image: { url: string } | null;
  additional_images: Array<{ url: string }>;
  videos: { url: string; desc: string }[];
  training_courses: string[];
  has_passport: 'yes' | 'no';
  ref_source: string;
  contract_history: Array<{ club: string; from: string; to: string; role: string }>;
  agent_history: Array<{ agent: string; from: string; to: string }>;
  official_contact: {
    name: string;
    title: string;
    phone: string;
    email: string;
  };
  currently_contracted: 'yes' | 'no';
  achievements: Array<{
    title: string;
    date: string;
    description?: string;
  }>;
  medical_history: {
    blood_type: string;
    chronic_conditions?: string[];
    allergies?: string[];
    injuries?: Array<{
      type: string;
      date: string;
      recovery_status: string;
    }>;
    last_checkup?: string;
  };
  current_club?: string;
  previous_clubs?: string[];
  documents?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

// Constants
const STEPS = {
  PERSONAL: 1,
  EDUCATION: 2,
  MEDICAL: 3,
  SPORTS: 4,
  SKILLS: 5,
  OBJECTIVES: 6,
  MEDIA: 7,
  CONTRACTS: 8 // التعاقدات والاتصالات
};

const STEP_TITLES = {
  [STEPS.PERSONAL]: 'البيانات الشخصية',
  [STEPS.EDUCATION]: 'المعلومات التعليمية',
  [STEPS.MEDICAL]: 'السجل الطبي',
  [STEPS.SPORTS]: 'المعلومات الرياضية',
  [STEPS.SKILLS]: 'المهارات والقدرات',
  [STEPS.OBJECTIVES]: 'الأهداف والطموحات',
  [STEPS.MEDIA]: 'الصور والفيديوهات',
  [STEPS.CONTRACTS]: 'التعاقدات والاتصالات'
};

const REFERENCE_DATA = {
  educationLevels: ['ابتدائي', 'متوسط', 'ثانوي', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'],
  languageLevels: ['مبتدئ', 'متوسط', 'متقدم', 'محترف'],
  bloodTypes: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  positions: [
    'حارس مرمى',
    'مدافع أيمن',
    'مدافع أيسر',
    'قلب دفاع',
    'وسط دفاعي',
    'وسط',
    'جناح أيمن',
    'جناح أيسر',
    'مهاجم صريح',
    'مهاجم ثاني'
  ],
  footPreferences: ['اليمنى', 'اليسرى', 'كلتاهما']
};

// Default player fields
const defaultPlayerFields: PlayerFormData = {
  full_name: '',
  birth_date: '',
  nationality: '',
  city: '',
  country: '',
  phone: '',
  whatsapp: '',
  email: '',
  brief: '',
  education_level: '',
  graduation_year: '',
  degree: '',
  english_level: '',
  arabic_level: '',
  spanish_level: '',
  blood_type: '',
  height: '',
  weight: '',
  chronic_conditions: false,
  chronic_details: '',
  injuries: [],
  surgeries: [],
  allergies: '',
  medical_notes: '',
  primary_position: '',
  secondary_position: '',
  preferred_foot: '',
  club_history: [],
  experience_years: '',
  sports_notes: '',
  technical_skills: {},
  physical_skills: {},
  social_skills: {},
  objectives: {},
  profile_image: null,
  additional_images: [],
  videos: [],
  training_courses: [],
  has_passport: 'no',
  ref_source: '',
  contract_history: [],
  agent_history: [],
  official_contact: {
    name: '',
    title: '',
    phone: '',
    email: ''
  },
  currently_contracted: 'no',
  achievements: [],
  medical_history: {
    blood_type: '',
    chronic_conditions: [],
    allergies: [],
    injuries: [],
    last_checkup: ''
  },
  current_club: '',
  previous_clubs: [],
  documents: []
};

// Helper function to combine classes
const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Supabase Setup with Type Safety
let supabaseInstance: SupabaseClient | null = null;

const initSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });
    return supabaseInstance;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw new Error('Failed to initialize Supabase client');
  }
};

// قائمة الأهداف والطموحات
const OBJECTIVES_OPTIONS = [
  "الاحتراف في نادٍ محلي",
  "الاحتراف في نادٍ خارجي",
  "تمثيل المنتخب الوطني",
  "الحصول على منحة رياضية",
  "تطوير المهارات الشخصية",
  "الحصول على جوائز فردية",
  "المساهمة في العمل الجماعي",
  "العمل في مجال التدريب مستقبلاً"
];

// قوائم الجنسيات والدول (مختصرة هنا، يمكن استبدالها بقائمة كاملة)
const NATIONALITIES = [
  "سعودي", "مصري", "أردني", "سوري", "مغربي", "جزائري", "تونسي", "ليبي", "فلسطيني", "يمني", "سوداني", "إماراتي", "قطري", "بحريني", "كويتي", "عماني", "لبناني", "عراقي", "تركي", "فرنسي", "أمريكي", "بريطاني", "ألماني", "إيطالي", "إسباني", "هندي", "باكستاني", "إيراني", "صيني", "ياباني"
];
const COUNTRIES = [
  "السعودية", "مصر", "الأردن", "سوريا", "المغرب", "الجزائر", "تونس", "ليبيا", "فلسطين", "اليمن", "السودان", "الإمارات", "قطر", "البحرين", "الكويت", "عمان", "لبنان", "العراق", "تركيا", "فرنسا", "أمريكا", "بريطانيا", "ألمانيا", "إيطاليا", "إسبانيا", "الهند", "باكستان", "إيران", "الصين", "اليابان"
];

// قوائم المؤهلات والدرجات والمستويات
const EDUCATION_LEVELS = [
  'ابتدائي', 'متوسط', 'ثانوي', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'
];
const DEGREES = [
  'مقبول', 'جيد', 'جيد جدًا', 'ممتاز', 'امتياز مع مرتبة الشرف'
];
const LANGUAGE_LEVELS = [
  'مبتدئ', 'متوسط', 'متقدم', 'محترف'
];

const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
];

const POSITIONS = [
  'حارس مرمى', 'مدافع أيمن', 'مدافع أيسر', 'قلب دفاع', 'وسط دفاعي', 'وسط', 'جناح أيمن', 'جناح أيسر', 'مهاجم صريح', 'مهاجم ثاني'
];
const FOOT_PREFERENCES = [
  'اليمنى', 'اليسرى', 'كلتاهما'
];

const TECHNICAL_SKILLS = [
  { key: 'ball_control', label: 'التحكم بالكرة' },
  { key: 'passing', label: 'التمرير' },
  { key: 'shooting', label: 'التسديد' },
  { key: 'dribbling', label: 'المراوغة' },
];
const PHYSICAL_SKILLS = [
  { key: 'speed', label: 'السرعة' },
  { key: 'strength', label: 'القوة البدنية' },
  { key: 'stamina', label: 'التحمل' },
  { key: 'agility', label: 'الرشاقة' },
  { key: 'balance', label: 'التوازن' },
  { key: 'flexibility', label: 'المرونة' },
];
const SOCIAL_SKILLS = [
  { key: 'teamwork', label: 'العمل الجماعي' },
  { key: 'communication', label: 'التواصل' },
  { key: 'discipline', label: 'الانضباط' },
  { key: 'self_confidence', label: 'الثقة بالنفس' },
  { key: 'pressure_handling', label: 'تحمل الضغط' },
  { key: 'punctuality', label: 'الالتزام بالمواعيد' },
];

const OBJECTIVES_CHECKBOXES = [
  { key: 'professional', label: 'الاحتراف الكامل' },
  { key: 'trials', label: 'معايشات احترافية' },
  { key: 'local_leagues', label: 'المشاركة في دوريات محلية' },
  { key: 'arab_leagues', label: 'المشاركة في دوريات عربية' },
  { key: 'european_leagues', label: 'المشاركة في دوريات أوروبية' },
  { key: 'training', label: 'تدريبات احترافية' },
];

const MAX_IMAGES = 10;
const MAX_VIDEOS = 10;

interface UploadResponse {
  url: string;
  error?: string;
}

const getSupabaseWithAuth = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  try {
    const token = await user.getIdToken();
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('فشل في الحصول على رمز المصادقة');
  }
};

export default function PlayerProfile() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [supabase] = useState(() => initSupabase());

  // تعريف جميع المتغيرات اللازمة
  const [playerData, setPlayerData] = useState<PlayerFormData | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>(defaultPlayerFields);
  const [editFormData, setEditFormData] = useState<PlayerFormData>(defaultPlayerFields);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(STEPS.PERSONAL);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [newVideo, setNewVideo] = useState<{ url: string; desc: string }>({ url: '', desc: '' });
  const [showVideoForm, setShowVideoForm] = useState(false);

  useEffect(() => {
    if (playerData) {
      setFormData(playerData);
      setEditFormData(playerData);
      setIsLoading(false);
    }
  }, [playerData]);

  // جلب بيانات اللاعب عند توفر المستخدم
  useEffect(() => {
    if (user) {
      fetchPlayerData();
    }
  }, [user]);

  const fetchPlayerData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const docRef = doc(db, 'players', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('[fetchPlayerData] player data:', data);
        const processedData = {
          full_name: data.full_name || '',
          birth_date: data.birth_date || '', // Handle as string
          nationality: data.nationality || '',
          city: data.city || '',
          country: data.country || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          brief: data.brief || '',
          education_level: data.education_level || '',
          graduation_year: data.graduation_year || '',
          degree: data.degree || '',
          english_level: data.english_level || '',
          arabic_level: data.arabic_level || '',
          spanish_level: data.spanish_level || '',
          blood_type: data.blood_type || '',
          height: data.height || '',
          weight: data.weight || '',
          chronic_conditions: data.chronic_conditions || false,
          chronic_details: data.chronic_details || '',
          injuries: data.injuries || [],
          surgeries: data.surgeries || [],
          allergies: data.allergies || '',
          medical_notes: data.medical_notes || '',
          primary_position: data.primary_position || '',
          secondary_position: data.secondary_position || '',
          preferred_foot: data.preferred_foot || '',
          club_history: data.club_history || [],
          experience_years: data.experience_years || '',
          sports_notes: data.sports_notes || '',
          technical_skills: data.technical_skills || {},
          physical_skills: data.physical_skills || {},
          social_skills: data.social_skills || {},
          objectives: data.objectives || {},
          profile_image: data.profile_image || null,
          additional_images: data.additional_images || [],
          videos: data.videos || [],
          training_courses: data.training_courses || [],
          has_passport: data.has_passport || 'no',
          ref_source: data.ref_source || '',
          contract_history: data.contract_history || [],
          agent_history: data.agent_history || [],
          official_contact: data.official_contact || {
            name: '',
            title: '',
            phone: '',
            email: ''
          },
          currently_contracted: data.currently_contracted || 'no',
          achievements: data.achievements || [],
          medical_history: data.medical_history || {
            blood_type: '',
            chronic_conditions: [],
            allergies: [],
            injuries: [],
            last_checkup: ''
          },
          current_club: data.current_club || '',
          previous_clubs: data.previous_clubs || [],
          documents: data.documents || []
        };

        setPlayerData(processedData);
        setFormData(processedData);
        setIsLoading(false);
      } else {
        setError("لم يتم العثور على بيانات اللاعب");
        setIsLoading(false);
        console.log('[fetchPlayerData] no player data found');
      }
    } catch (err) {
      setError("حدث خطأ أثناء جلب البيانات");
      setIsLoading(false);
      console.log('[fetchPlayerData] error:', err);
    }
  };

  console.log('PlayerProfile: state initialized', { isLoading, playerData, formData });

  if (isLoading || isUploading) {
    console.log('PlayerProfile: Rendering loading state', {
      isLoading,
      isUploading,
      authState: isLoading ? 'Auth loading' : 'Auth loaded',
      dataState: isLoading ? 'Data loading' : 'Data loaded'
    });
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || (formErrors && 'fetch' in formErrors)) {
    console.log('PlayerProfile: Rendering error state', error, formErrors.fetch);
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-2xl font-semibold text-red-600">حدث خطأ</h2>
            <p className="mb-6 text-gray-600">{typeof error === 'string' ? error : formErrors.fetch}</p>
            <Button onClick={() => router.push('/auth/login')} className="text-white bg-blue-600 hover:bg-blue-700">
              العودة إلى صفحة تسجيل الدخول
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    console.log('PlayerProfile: No user found, redirecting to login');
    router.push('/auth/login');
    return null;
  }

  console.log('PlayerProfile: Rendering main form');
  // =========== Supabase Storage Functions ===========

  /**
   * رفع صورة البروفايل إلى bucket للصور الشخصية
   * @param {File} file - ملف الصورة
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<string>} - رابط الصورة
   */
  const uploadProfileImage = async () => {
    return { url: '', error: 'خدمة رفع الصور معطلة حالياً' };
  };

  const uploadImageToSupabase = async () => {
    throw new Error('خدمة رفع الصور معطلة حالياً');
  };

  const handleImageUpload = async () => {
    setError('خدمة رفع الصور معطلة حالياً');
  };

  const handleDeleteProfileImage = async () => {
    setError('خدمة حذف الصور معطلة حالياً');
  };

  /**
   * رفع صورة إضافية إلى bucket للصور الإضافية
   * @param {File} file - ملف الصورة
   * @param {string} userId - معرف المستخدم
   * @param {number} idx - فهرس الصورة (اختياري)
   * @returns {Promise<string>} - رابط الصورة
   */
  const uploadAdditionalImage = async (file: File, userId: string, userToken: string): Promise<UploadResponse> => {
    const supabase = await getSupabaseWithAuth();
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/additional/${Date.now()}.${fileExt}`;
      console.log('Uploading to path:', filePath);
      const { data, error } = await supabase.storage
        .from('player-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      if (error) {
        console.error('Error uploading additional image:', error.message, error);
        throw new Error(`فشل في رفع الصورة: ${error.message || 'خطأ غير معروف'}`);
      }
      const { data: urlData } = supabase.storage
        .from('player-uploads')
        .getPublicUrl(filePath);
      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }
      return {
        url: urlData.publicUrl,
        error: undefined
      };
    } catch (error) {
      console.error('Error in uploadAdditionalImage:', error);
      return {
        url: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  // Add these functions after the initSupabase function
  const uploadImageToSupabase = async (file: File, bucket: string, path: string) => {
    try {
      const supabase = initSupabase();
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        throw new Error('الملف يجب أن يكون صورة');
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Remove duplicate declarations and keep only the first ones
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, profileImage: 'يجب أن يكون الملف صورة' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, profileImage: 'حجم الصورة يجب أن لا يتجاوز 5 ميجابايت' }));
        return;
      }
      setUploadingProfileImage(true);
      const userId = user?.uid;
      if (!userId) {
        setFormErrors(prev => ({ ...prev, profileImage: 'يجب تسجيل الدخول أولاً' }));
        return;
      }
      const userToken = await user.getIdToken();
      const result = await uploadProfileImage(file, userId, userToken);
      if (result.error) {
        setFormErrors(prev => ({ ...prev, profileImage: result.error }));
        return;
      }
      setEditFormData(prev => ({ ...prev, profile_image: { url: result.url } }));
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setFormErrors(prev => ({
        ...prev,
        profileImage: error instanceof Error ? error.message : 'فشل في رفع الصورة. يرجى المحاولة مرة أخرى'
      }));
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!user || !user.uid) {
      setError('يجب تسجيل الدخول أولاً قبل رفع الصور.');
      return;
    }
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const userToken = await user.getIdToken();
      const result = await uploadAdditionalImage(file, user.uid, userToken);
      if (result.url) {
        setFormData(prev => ({
          ...prev,
          additional_images: [...(prev.additional_images || []), { url: result.url }]
        }));
      } else {
        throw new Error(result.error || 'Invalid upload response');
      }
    } catch (error) {
      setError('فشل في رفع الصورة الإضافية');
    } finally {
      setIsUploading(false);
    }
  };

  // حذف صورة إضافية من البوكت الجديد
  const deleteAdditionalImageFromSupabase = async (path: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    try {
      const { error } = await supabase.storage
        .from('player-uploads') // ← استخدم البوكت الجديد
        .remove([path]);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting additional image:', error);
      throw error;
    }
  };

  // Add delete image functions
  const deleteImageFromSupabase = async (path: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await supabase.storage
        .from('player-uploads')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!formData.profile_image?.url) return;
    try {
      const result = await deleteImage(formData.profile_image.url);
      if (result.error) {
        setFormErrors(prev => ({ ...prev, profileImage: result.error }));
        return;
      }
      setFormData(prev => ({ ...prev, profile_image: null }));
    } catch (error) {
      setFormErrors(prev => ({ ...prev, profileImage: 'حدث خطأ أثناء حذف الصورة' }));
    }
  };

  const handleDeleteAdditionalImage = async (index: number) => {
    try {
      const image = formData.additional_images[index];
      if (!image?.url) return;
      const result = await deleteImage(image.url);
      if (result.error) {
        setFormErrors(prev => ({ ...prev, additionalImage: result.error }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        additional_images: prev.additional_images.filter((_, i) => i !== index)
      }));
    } catch (error) {
      setFormErrors(prev => ({ ...prev, additionalImage: 'حدث خطأ أثناء حذف الصورة' }));
    }
  };

  // =========== Form Handling Functions ===========

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // دالة التحقق حسب التبويب الحالي
  const validateCurrentStep = (step: number, data: PlayerFormData) => {
    if (step === STEPS.PERSONAL) return validatePersonalInfo(data);
    if (step === STEPS.EDUCATION) return validateEducation(data);
    if (step === STEPS.MEDICAL) return validateMedical(data);
    if (step === STEPS.SPORTS) return validateSports(data);
    if (step === STEPS.SKILLS) return validateSkills(data);
    if (step === STEPS.OBJECTIVES) return validateObjectives(data);
    if (step === STEPS.MEDIA) return validateMedia(data);
    return {};
  };

  // زر التالي
  const handleNext = () => {
    const errors = validateCurrentStep(currentStep, editFormData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setCurrentStep(currentStep + 1);
  };

  // Handle Save Button
  const handleSave = async () => {
    setEditLoading(true);
    setEditError('');

    try {
      // التحقق من صحة البيانات
      const errors = validateCurrentStep(currentStep, editFormData);
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) {
        throw new Error('يرجى تصحيح الأخطاء قبل الحفظ');
      }

      // التحقق من وجود المستخدم
      if (!user?.uid) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      // استخراج المسارات النسبية للصور
      const profileImageUrl = editFormData.profile_image?.url || '';
      const additionalImageUrls = editFormData.additional_images?.map(img => img.url) || [];

      // تهيئة الكائن الذي سيتم حفظه في Firestore
      const playerDataToSave = {
        ...editFormData,
        profile_image: profileImageUrl ? { url: profileImageUrl } : null,
        additional_images: additionalImageUrls.map(url => ({ url })),
        birth_date: editFormData.birth_date || undefined,
        updated_at: new Date()
      };

      // حفظ البيانات في Firestore
      await setDoc(doc(db, 'players', user.uid), playerDataToSave, { merge: true });

      // تحديث بيانات النموذج المحلية
      setFormData({ ...editFormData });
      setIsEditing(false);
      setSuccessMessage('تم حفظ البيانات بنجاح');

      // إخفاء رسالة النجاح بعد 3 ثوانٍ
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (err) {
      console.error("خطأ أثناء حفظ البيانات:", err);

      // رسائل خطأ مخصصة
      if (err instanceof Error) {
        if (err.message.includes('permission-denied')) {
          setEditError('ليس لديك صلاحية لحفظ البيانات');
        } else if (err.message.includes('not-found')) {
          setEditError('لم يتم العثور على المستخدم');
        } else if (err.message.includes('invalid-argument')) {
          setEditError('بيانات غير صالحة');
        } else {
          setEditError(err.message);
        }
      } else {
        setEditError('حدث خطأ غير متوقع أثناء حفظ البيانات');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Cancel button
  const handleCancel = () => {
    setEditFormData({ ...formData });
    setIsEditing(false);
    setEditError('');
  };

  // =========== Media Handling Functions ===========

  // Add/remove images and videos
  const handleAddImage = (url: string) => {
    setEditFormData(prev => ({
      ...prev,
      additional_images: [...(prev.additional_images || []), { url }]
    }));
  };

  const handleRemoveImage = (idx: number) => {
    setEditFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, i) => i !== idx),
    }));
  };

  const handleAddVideo = (video: { url: string; desc: string }) => {
    setEditFormData(prev => ({
      ...prev,
      videos: [...(prev.videos || []), video],
    }));
  };

  const handleRemoveVideo = (idx: number) => {
    setEditFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== idx),
    }));
  };

  /**
   * معالج رفع الصور إلى Supabase
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user?.uid) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const userToken = await user.getIdToken();
      const result = await uploadProfileImage(file, user.uid, userToken);
      if (result.url) {
        setFormData(prev => ({
          ...prev,
          profile_image: { url: result.url }
        }));
      } else {
        throw new Error(result.error || 'Invalid upload response');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('فشل في رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  // =========== Field Rendering Helpers ===========

  // Render input or value based on edit mode
  const renderField = (name: keyof PlayerFormData, type: string = 'text') =>
    isEditing ? (
      <input
        type={type}
        name={name}
        value={typeof editFormData[name] === 'string' ? editFormData[name] as string : ''}
        onChange={handleInputChange}
        className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
      />
    ) : (
      <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
        {typeof formData[name] === 'string' ? formData[name] as string :
         typeof formData[name] === 'object' ? JSON.stringify(formData[name]) : 'غير محدد'}
      </div>
    );

  // Render textarea based on edit mode
  const renderTextarea = (name: keyof PlayerFormData) =>
    isEditing ? (
      <textarea
        name={name}
        value={typeof editFormData[name] === 'string' ? editFormData[name] as string : ''}
        onChange={handleInputChange}
        className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
      />
    ) : (
      <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
        {typeof formData[name] === 'string' ? formData[name] as string :
         typeof formData[name] === 'object' ? JSON.stringify(formData[name]) :
         'غير محدد'}
      </div>
    );

  // Helper to check if a video URL is embeddable
  const getVideoEmbed = (url: string) => {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})/);
    if (ytMatch) {
      return (
        <div className="relative w-full pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo.com\/(\d+)/);
    if (vimeoMatch) {
      return (
        <div className="relative w-full pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return null;
  };

  // =========== Validation Functions ===========
  const validatePersonalInfo = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    if (!data.profile_image) errors.profile_image = 'الصورة الشخصية مطلوبة';
    if (!data.full_name) errors.full_name = 'الاسم الكامل مطلوب';
    if (!data.birth_date) errors.birth_date = 'تاريخ الميلاد مطلوب';
    if (!data.nationality) errors.nationality = 'الجنسية مطلوبة';
    if (!data.city) errors.city = 'المدينة مطلوبة';
    if (!data.country) errors.country = 'الدولة مطلوبة';
    if (!data.phone) errors.phone = 'رقم الهاتف مطلوب';
    if (!data.whatsapp) errors.whatsapp = 'رقم الواتساب مطلوب';
    if (!data.email) errors.email = 'البريد الإلكتروني مطلوب';
    if (!data.brief) errors.brief = 'نبذة مختصرة مطلوبة';
    return errors;
  };

  const validateEducation = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    if (!data.education_level) errors.education_level = 'المؤهل الدراسي مطلوب';
    if (!data.graduation_year) errors.graduation_year = 'سنة التخرج مطلوبة';
    if (!data.degree) errors.degree = 'الدرجة مطلوبة';
    if (!data.english_level) errors.english_level = 'مستوى الإنجليزية مطلوب';
    return errors;
  };

  const validateMedical = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    // الطول والوزن اختياريان لكن يمكن التحقق من الأرقام
    if (data.height && isNaN(Number(data.height))) errors.height = 'الطول يجب أن يكون رقمًا';
    if (data.weight && isNaN(Number(data.weight))) errors.weight = 'الوزن يجب أن يكون رقمًا';
    // إذا كان هناك أمراض مزمنة يجب إدخال التفاصيل
    if (data.chronic_conditions && !data.chronic_details) errors.chronic_details = 'يرجى إدخال تفاصيل الأمراض المزمنة';
    // تحقق من الإصابات والعمليات (يمكنك تخصيصه أكثر)
    return errors;
  };

  const validateSports = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    if (!data.primary_position) errors.primary_position = 'المركز الأساسي مطلوب';
    if (!data.preferred_foot) errors.preferred_foot = 'القدم المفضلة مطلوبة';
    // تحقق من تاريخ الأندية (يمكن تخصيصه)
    return errors;
  };

  const validateSkills = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    // المهارات اختيارية لكن يمكن التحقق من وجود تقييمات أساسية إذا رغبت
    return errors;
  };

  const validateObjectives = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    const hasAny = OBJECTIVES_CHECKBOXES.some(obj => data.objectives?.[obj.key]) ||
      (typeof data.objectives?.other === 'string' && data.objectives.other.trim() !== '');
    if (!hasAny) errors.objectives = 'يرجى اختيار هدف واحد على الأقل أو كتابة هدف آخر';
    return errors;
  };

  const validateMedia = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    if ((data.additional_images || []).length > MAX_IMAGES) errors.additionalImage = `يمكن رفع حتى ${MAX_IMAGES} صور فقط`;
    if ((data.videos || []).length > MAX_VIDEOS) errors.video = `يمكن رفع حتى ${MAX_VIDEOS} فيديو فقط`;
    // تحقق من وجود وصف لكل فيديو
    if ((data.videos || []).some(v => !v || !v.url || !v.desc || v.desc.trim() === '')) errors.video = 'يجب كتابة وصف لكل فيديو';
    return errors;
  };

  // =========== Section Renderers ===========

  // Render Personal Info Section
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="pr-4 text-2xl font-semibold border-r-4 border-blue-500">البيانات الشخصية</h2>
      {/* Profile Image */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">الصورة الشخصية <span className="text-red-500">*</span></label>
        {isEditing ? (
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="flex-1"
            />
            {uploadingProfileImage && <span className="text-blue-600">جاري الرفع...</span>}
            {editFormData.profile_image?.url && (
              <div className="relative w-24 h-24">
                <Image
                  src={editFormData.profile_image.url}
                  alt="Profile"
                  fill
                  className="object-cover rounded-full"
                  sizes="96px"
                  priority
                />
              </div>
            )}
          </div>
        ) : (
          formData.profile_image?.url ? (
            <div className="relative w-24 h-24">
              <Image
                src={formData.profile_image.url}
                alt="Profile"
                fill
                className="object-cover rounded-full"
                sizes="96px"
                priority
              />
            </div>
          ) : (
            <span className="text-gray-400">لا توجد صورة شخصية</span>
          )
        )}
        {formErrors.profile_image && <span className="text-xs text-red-500">{formErrors.profile_image}</span>}
      </div>
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">الاسم الكامل <span className="text-red-500">*</span></label>
          {renderField('full_name')}
          {formErrors.full_name && <span className="text-xs text-red-500">{formErrors.full_name}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">تاريخ الميلاد <span className="text-red-500">*</span></label>
          {renderField('birth_date', 'date')}
          {formErrors.birth_date && <span className="text-xs text-red-500">{formErrors.birth_date}</span>}
          {/* حساب العمر تلقائيًا */}
          {editFormData.birth_date && (
            <span className="text-xs text-gray-500">العمر: {Math.floor((new Date().getTime() - new Date(editFormData.birth_date).getTime()) / (365.25*24*60*60*1000))} سنة</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
       <div>
          <label className="block text-sm font-medium text-gray-700">الجنسية <span className="text-red-500">*</span></label>
          {isEditing ? (
            <select
              name="nationality"
              value={editFormData.nationality || ''}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
            >
              <option value="">اختر</option>
              {NATIONALITIES.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
              {formData.nationality || 'غير محدد'}
            </div>
          )}
          {formErrors.nationality && <span className="text-xs text-red-500">{formErrors.nationality}</span>}
       </div>
       <div>
          <label className="block text-sm font-medium text-gray-700">المدينة <span className="text-red-500">*</span></label>
         {renderField('city')}
          {formErrors.city && <span className="text-xs text-red-500">{formErrors.city}</span>}
       </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
       <div>
          <label className="block text-sm font-medium text-gray-700">الدولة <span className="text-red-500">*</span></label>
          {isEditing ? (
            <select
              name="country"
              value={editFormData.country || ''}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
            >
              <option value="">اختر</option>
              {COUNTRIES.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
              {formData.country || 'غير محدد'}
       </div>
          )}
          {formErrors.country && <span className="text-xs text-red-500">{formErrors.country}</span>}
     </div>
       <div>
          <label className="block text-sm font-medium text-gray-700">رقم الهاتف <span className="text-red-500">*</span></label>
         {renderField('phone')}
          {formErrors.phone && <span className="text-xs text-red-500">{formErrors.phone}</span>}
       </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
       <div>
         <label className="block text-sm font-medium text-gray-700">رقم الواتساب</label>
         {renderField('whatsapp')}
          {formErrors.whatsapp && <span className="text-xs text-red-500">{formErrors.whatsapp}</span>}
       </div>
       <div>
         <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
         {renderField('email')}
          {formErrors.email && <span className="text-xs text-red-500">{formErrors.email}</span>}
       </div>
     </div>
   </div>
 );

 // Render Education Section
 const renderEducation = () => (
   <div className="space-y-6">
     <h2 className="pr-4 text-2xl font-semibold border-r-4 border-blue-500">المعلومات التعليمية</h2>
     <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
       <div>
          <label className="block text-sm font-medium text-gray-700">المؤهل الدراسي <span className="text-red-500">*</span></label>
         {isEditing ? (
           <select
             name="education_level"
             value={editFormData.education_level || ''}
             onChange={handleInputChange}
             className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
           >
             <option value="">اختر</option>
              {EDUCATION_LEVELS.map(opt => (
               <option key={opt} value={opt}>{opt}</option>
             ))}
           </select>
         ) : (
           <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
             {formData.education_level || 'غير محدد'}
           </div>
         )}
          {formErrors.education_level && <span className="text-xs text-red-500">{formErrors.education_level}</span>}
       </div>
       <div>
          <label className="block text-sm font-medium text-gray-700">سنة التخرج <span className="text-red-500">*</span></label>
          {isEditing ? (
            <input
              type="date"
              name="graduation_year"
              value={editFormData.graduation_year || ''}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
            />
          ) : (
            <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
              {formData.graduation_year || 'غير محدد'}
       </div>
          )}
          {formErrors.graduation_year && <span className="text-xs text-red-500">{formErrors.graduation_year}</span>}
     </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
       <div>
          <label className="block text-sm font-medium text-gray-700">الدرجة <span className="text-red-500">*</span></label>
          {isEditing ? (
            <select
              name="degree"
              value={editFormData.degree || ''}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
            >
              <option value="">اختر</option>
              {DEGREES.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
              {formData.degree || 'غير محدد'}
            </div>
          )}
          {formErrors.degree && <span className="text-xs text-red-500">{formErrors.degree}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">اللغة الإنجليزية <span className="text-red-500">*</span></label>
         {isEditing ? (
           <select
             name="english_level"
             value={editFormData.english_level || ''}
             onChange={handleInputChange}
             className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
           >
             <option value="">اختر</option>
              {LANGUAGE_LEVELS.map(opt => (
               <option key={opt} value={opt}>{opt}</option>
             ))}
           </select>
         ) : (
           <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
             {formData.english_level || 'غير محدد'}
           </div>
         )}
          {formErrors.english_level && <span className="text-xs text-red-500">{formErrors.english_level}</span>}
       </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
       <div>
          <label className="block text-sm font-medium text-gray-700">اللغة العربية</label>
         {isEditing ? (
           <select
             name="arabic_level"
             value={editFormData.arabic_level || ''}
             onChange={handleInputChange}
             className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
           >
             <option value="">اختر</option>
              {LANGUAGE_LEVELS.map(opt => (
               <option key={opt} value={opt}>{opt}</option>
             ))}
           </select>
         ) : (
           <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
             {formData.arabic_level || 'غير محدد'}
           </div>
         )}
       </div>
       <div>
          <label className="block text-sm font-medium text-gray-700">اللغة الإسبانية</label>
         {isEditing ? (
           <select
             name="spanish_level"
             value={editFormData.spanish_level || ''}
             onChange={handleInputChange}
             className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
           >
             <option value="">اختر</option>
              {LANGUAGE_LEVELS.map(opt => (
               <option key={opt} value={opt}>{opt}</option>
             ))}
           </select>
         ) : (
           <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
             {formData.spanish_level || 'غير محدد'}
           </div>
         )}
       </div>
     </div>
      {/* الكورسات */}
     <div>
       <label className="block text-sm font-medium text-gray-700">الدورات التدريبية</label>
       {isEditing ? (
         <div>
           {(editFormData.training_courses || []).map((course, idx) => (
             <div key={idx} className="flex gap-2 mb-2">
               <input
                 type="text"
                 value={course}
                 onChange={e => {
                   const updated = [...editFormData.training_courses];
                   updated[idx] = e.target.value;
                   setEditFormData({ ...editFormData, training_courses: updated });
                 }}
                 className="flex-1 p-2 border rounded"
               />
               <button
                 type="button"
                 onClick={() => {
                   const updated = [...editFormData.training_courses];
                   updated.splice(idx, 1);
                   setEditFormData({ ...editFormData, training_courses: updated });
                 }}
                 className="p-1 text-red-500 rounded bg-red-50 hover:bg-red-100"
               >
                 <Trash size={18} />
               </button>
             </div>
           ))}
           <button
             type="button"
             onClick={() => setEditFormData({
               ...editFormData,
               training_courses: [...(editFormData.training_courses || []), '']
             })}
             className="flex items-center mt-2 text-blue-600 hover:text-blue-700"
           >
             <Plus size={16} className="mr-1" /> إضافة دورة
           </button>
         </div>
       ) : (
         <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
           {(formData.training_courses || []).length === 0 ?
             'لا توجد دورات' :
             formData.training_courses.map((course, idx) => (
               <div key={idx} className="py-1">
                 {idx + 1}. {course}
               </div>
             ))
           }
         </div>
       )}
     </div>
   </div>
 );

 // Render Medical Record Section
 const renderMedicalRecord = () => (
   <div className="space-y-6">
     <h2 className="pr-4 text-2xl font-semibold border-r-4 border-blue-500">السجل الطبي</h2>
     <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
       <div>
         <label className="block text-sm font-medium text-gray-700">فصيلة الدم</label>
         {isEditing ? (
           <select
             name="blood_type"
             value={editFormData.blood_type || ''}
             onChange={handleInputChange}
             className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
           >
             <option value="">اختر</option>
              {BLOOD_TYPES.map(opt => (
               <option key={opt} value={opt}>{opt}</option>
             ))}
           </select>
         ) : (
           <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
             {formData.blood_type || 'غير محدد'}
           </div>
         )}
       </div>
       <div>
         <label className="block text-sm font-medium text-gray-700">الطول (سم)</label>
         {renderField('height', 'number')}
          {formErrors.height && <span className="text-xs text-red-500">{formErrors.height}</span>}
          {/* مقارنة بمتوسط اللاعبين */}
          {editFormData.height && (
            <span className="text-xs text-gray-500">متوسط الطول العالمي: 175 سم</span>
          )}
       </div>
       <div>
         <label className="block text-sm font-medium text-gray-700">الوزن (كجم)</label>
         {renderField('weight', 'number')}
          {formErrors.weight && <span className="text-xs text-red-500">{formErrors.weight}</span>}
          {/* حساب BMI */}
          {editFormData.height && editFormData.weight && (
            <span className="text-xs text-gray-500">BMI: {((Number(editFormData.weight) / Math.pow(Number(editFormData.height)/100, 2)) || 0).toFixed(1)}</span>
          )}
       </div>
     </div>
      {/* أمراض مزمنة */}
     <div>
        <label className="block text-sm font-medium text-gray-700">هل لديك أمراض مزمنة؟</label>
        {isEditing ? (
          <input
            type="checkbox"
            checked={!!editFormData.chronic_conditions}
            onChange={e => setEditFormData(prev => ({ ...prev, chronic_conditions: e.target.checked }))}
            className="mr-2 accent-blue-600"
          />
        ) : (
          <span className="ml-2">{formData.chronic_conditions ? 'نعم' : 'لا'}</span>
        )}
      </div>
      {/* تفاصيل الأمراض المزمنة */}
      {editFormData.chronic_conditions && (
        <div>
          <label className="block text-sm font-medium text-gray-700">تفاصيل الأمراض المزمنة</label>
       {renderTextarea('chronic_details')}
          {formErrors.chronic_details && <span className="text-xs text-red-500">{formErrors.chronic_details}</span>}
     </div>
      )}
      {/* الإصابات السابقة */}
     <div>
       <label className="block text-sm font-medium text-gray-700">الإصابات السابقة</label>
        {isEditing ? (
     <div>
            {(editFormData.injuries || []).map((inj, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 mb-2 md:flex-row">
                <input
                  type="text"
                  placeholder="نوع الإصابة"
                  value={inj.type || ''}
                  onChange={e => {
                    const updated = [...editFormData.injuries];
                    updated[idx] = { ...updated[idx], type: e.target.value };
                    setEditFormData({ ...editFormData, injuries: updated });
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="تاريخ الإصابة"
                  value={inj.date || ''}
                  onChange={e => {
                    const updated = [...editFormData.injuries];
                    updated[idx] = { ...updated[idx], date: e.target.value };
                    setEditFormData({ ...editFormData, injuries: updated });
                  }}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="حالة التعافي"
                  value={inj.status || ''}
                  onChange={e => {
                    const updated = [...editFormData.injuries];
                    updated[idx] = { ...updated[idx], status: e.target.value };
                    setEditFormData({ ...editFormData, injuries: updated });
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...editFormData.injuries];
                    updated.splice(idx, 1);
                    setEditFormData({ ...editFormData, injuries: updated });
                  }}
                  className="p-1 text-red-500 rounded bg-red-50 hover:bg-red-100"
                >
                  <Trash size={16} />
                </button>
     </div>
            ))}
            <button
              type="button"
              onClick={() => setEditFormData({
                ...editFormData,
                injuries: [...(editFormData.injuries || []), { type: '', date: '', status: '' }]
              })}
              className="flex items-center mt-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} className="mr-1" /> إضافة إصابة
            </button>
          </div>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
            {(formData.injuries || []).length === 0 ?
              'لا توجد إصابات' :
              (Array.isArray(formData.injuries) ? formData.injuries : []).map((inj, idx) => (
                <div key={idx} className="py-1">
                  {inj.type} - {inj.date} - {inj.status}
                </div>
              ))
            }
          </div>
        )}
      </div>
      {/* العمليات الجراحية */}
     <div>
        <label className="block text-sm font-medium text-gray-700">العمليات الجراحية</label>
        {isEditing ? (
          <div>
            {(editFormData.surgeries || []).map((surg, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 mb-2 md:flex-row">
                <input
                  type="text"
                  placeholder="نوع العملية"
                  value={surg.type || ''}
                  onChange={e => {
                    const updated = [...editFormData.surgeries];
                    updated[idx] = { ...updated[idx], type: e.target.value };
                    setEditFormData({ ...editFormData, surgeries: updated });
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="تاريخ العملية"
                  value={surg.date || ''}
                  onChange={e => {
                    const updated = [...editFormData.surgeries];
                    updated[idx] = { ...updated[idx], date: e.target.value };
                    setEditFormData({ ...editFormData, surgeries: updated });
                  }}
                  className="p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...editFormData.surgeries];
                    updated.splice(idx, 1);
                    setEditFormData({ ...editFormData, surgeries: updated });
                  }}
                  className="p-1 text-red-500 rounded bg-red-50 hover:bg-red-100"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setEditFormData({
                ...editFormData,
                surgeries: [...(editFormData.surgeries || []), { type: '', date: '' }]
              })}
              className="flex items-center mt-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} className="mr-1" /> إضافة عملية
            </button>
          </div>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
            {(formData.surgeries || []).length === 0 ?
              'لا توجد عمليات' :
              formData.surgeries.map((surg, idx) => (
                <div key={idx} className="py-1">
                  {surg.type} - {surg.date}
                </div>
              ))
            }
          </div>
        )}
     </div>
   </div>
 );

 // Render Sports Info Section
 const renderSportsInfo = () => (
   <div className="space-y-6">
     <h2 className="pr-4 text-2xl font-semibold border-r-4 border-blue-500">المعلومات الرياضية</h2>
     <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
       <div>
          <label className="block text-sm font-medium text-gray-700">المركز الأساسي <span className="text-red-500">*</span></label>
         {isEditing ? (
           <select
             name="primary_position"
             value={editFormData.primary_position || ''}
             onChange={handleInputChange}
             className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
           >
             <option value="">اختر</option>
              {POSITIONS.map(opt => (
               <option key={opt} value={opt}>{opt}</option>
             ))}
           </select>
         ) : (
           <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
             {formData.primary_position || 'غير محدد'}
           </div>
         )}
          {formErrors.primary_position && <span className="text-xs text-red-500">{formErrors.primary_position}</span>}
       </div>
       <div>
         <label className="block text-sm font-medium text-gray-700">المركز الثانوي</label>
         {isEditing ? (
           <select
             name="secondary_position"
             value={editFormData.secondary_position || ''}
             onChange={handleInputChange}
             className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
           >
             <option value="">اختر</option>
              {POSITIONS.map(opt => (
               <option key={opt} value={opt}>{opt}</option>
             ))}
           </select>
         ) : (
           <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
             {formData.secondary_position || 'غير محدد'}
           </div>
         )}
       </div>
     </div>
     <div>
        <label className="block text-sm font-medium text-gray-700">القدم المفضلة <span className="text-red-500">*</span></label>
       {isEditing ? (
         <select
           name="preferred_foot"
           value={editFormData.preferred_foot || ''}
           onChange={handleInputChange}
           className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
         >
           <option value="">اختر</option>
            {FOOT_PREFERENCES.map(opt => (
             <option key={opt} value={opt}>{opt}</option>
           ))}
         </select>
       ) : (
         <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
           {formData.preferred_foot || 'غير محدد'}
         </div>
       )}
        {formErrors.preferred_foot && <span className="text-xs text-red-500">{formErrors.preferred_foot}</span>}
     </div>
      {/* تاريخ الأندية */}
     <div>
        <label className="block text-sm font-medium text-gray-700">تاريخ الأندية</label>
        {isEditing ? (
     <div>
            {(editFormData.club_history || []).map((club, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 mb-2 md:flex-row">
                <input
                  type="text"
                  placeholder="اسم النادي"
                  value={club.name || ''}
                  onChange={e => {
                    const updated = [...editFormData.club_history];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setEditFormData({ ...editFormData, club_history: updated });
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="من"
                  value={club.from || ''}
                  onChange={e => {
                    const updated = [...editFormData.club_history];
                    updated[idx] = { ...updated[idx], from: e.target.value };
                    setEditFormData({ ...editFormData, club_history: updated });
                  }}
                  className="p-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="إلى"
                  value={club.to || ''}
                  onChange={e => {
                    const updated = [...editFormData.club_history];
                    updated[idx] = { ...updated[idx], to: e.target.value };
                    setEditFormData({ ...editFormData, club_history: updated });
                  }}
                  className="p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...editFormData.club_history];
                    updated.splice(idx, 1);
                    setEditFormData({ ...editFormData, club_history: updated });
                  }}
                  className="p-1 text-red-500 rounded bg-red-50 hover:bg-red-100"
                >
                  <Trash size={16} />
                </button>
     </div>
            ))}
            <button
              type="button"
              onClick={() => setEditFormData({
                ...editFormData,
                club_history: [...(editFormData.club_history || []), { name: '', from: '', to: '' }]
              })}
              className="flex items-center mt-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} className="mr-1" /> إضافة نادي
            </button>
          </div>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
            {(formData.club_history || []).length === 0 ?
              'لا يوجد تاريخ أندية' :
              formData.club_history.map((club, idx) => (
                <div key={idx} className="py-1">
                  {club.name} - {club.from} - {club.to}
                </div>
              ))
            }
          </div>
        )}
     </div>
   </div>
 );

 // Render Skills Section
 const renderSkills = () => (
   <div className="space-y-8">
     <h2 className="pr-4 text-2xl font-semibold border-r-4 border-blue-500">المهارات والقدرات</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* المهارات الفنية */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">المهارات الفنية</label>
          {TECHNICAL_SKILLS.map(skill => (
            <div key={skill.key} className="mb-4">
              <span className="block mb-1 text-xs text-gray-600">{skill.label}</span>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={editFormData.technical_skills?.[skill.key] || 3}
                disabled={!isEditing}
                onChange={e => {
                  if (!isEditing) return;
                  setEditFormData(prev => ({
                    ...prev,
                    technical_skills: { ...prev.technical_skills, [skill.key]: Number(e.target.value) }
                  }));
                }}
                className="w-full accent-blue-600"
              />
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={
                    (editFormData.technical_skills?.[skill.key] || 3) >= i ? 'text-yellow-400' : 'text-gray-300'
                  }>★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* المهارات البدنية */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">المهارات البدنية</label>
          {PHYSICAL_SKILLS.map(skill => (
            <div key={skill.key} className="mb-4">
              <span className="block mb-1 text-xs text-gray-600">{skill.label}</span>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={editFormData.physical_skills?.[skill.key] || 3}
                disabled={!isEditing}
                onChange={e => {
                  if (!isEditing) return;
                  setEditFormData(prev => ({
                    ...prev,
                    physical_skills: { ...prev.physical_skills, [skill.key]: Number(e.target.value) }
                  }));
                }}
                className="w-full accent-green-600"
              />
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={
                    (editFormData.physical_skills?.[skill.key] || 3) >= i ? 'text-yellow-400' : 'text-gray-300'
                  }>★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* المهارات الإنسانية والاجتماعية */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">المهارات الإنسانية والاجتماعية</label>
          {SOCIAL_SKILLS.map(skill => (
            <div key={skill.key} className="mb-4">
              <span className="block mb-1 text-xs text-gray-600">{skill.label}</span>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={editFormData.social_skills?.[skill.key] || 3}
                disabled={!isEditing}
                onChange={e => {
                  if (!isEditing) return;
                  setEditFormData(prev => ({
                    ...prev,
                    social_skills: { ...prev.social_skills, [skill.key]: Number(e.target.value) }
                  }));
                }}
                className="w-full accent-purple-600"
              />
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={
                    (editFormData.social_skills?.[skill.key] || 3) >= i ? 'text-yellow-400' : 'text-gray-300'
                  }>★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
   </div>
 );

 // Render Objectives Section
 const renderObjectives = () => (
   <div className="space-y-6">
     <h2 className="pr-4 text-2xl font-semibold border-r-4 border-blue-500">الأهداف والطموحات</h2>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">اختر أهدافك (يمكن اختيار أكثر من هدف)</label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {OBJECTIVES_CHECKBOXES.map(opt => (
            <label key={opt.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!editFormData.objectives?.[opt.key]}
                disabled={!isEditing}
                onChange={e => {
                  if (!isEditing) return;
                  setEditFormData(prev => ({
                    ...prev,
                    objectives: { ...prev.objectives, [opt.key]: e.target.checked }
                  }));
                }}
                className="accent-blue-600"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">أهداف أخرى</label>
          {isEditing ? (
            <textarea
              name="objectives.other"
              value={typeof editFormData.objectives?.other === 'string' ? editFormData.objectives.other : ''}
              onChange={e => setEditFormData(prev => ({
                ...prev,
                objectives: {
                  ...(prev.objectives as Record<string, boolean>),
                  other: e.target.value
                } as Record<string, boolean> & { other?: string }
              }))}
              className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
            />
          ) : (
            <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
              {formData.objectives?.other || 'غير محدد'}
            </div>
          )}
        </div>
        {formErrors.objectives && <span className="text-xs text-red-500">{formErrors.objectives}</span>}
      </div>
   </div>
 );

  // دالة لجلب صورة مصغرة للفيديو
  const getVideoThumbnail = (url: string) => {
    // يوتيوب
    const ytMatch = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})/);
    if (ytMatch) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    // Vimeo (عرض رمز فيديو افتراضي)
    const vimeoMatch = url.match(/vimeo.com\/(\d+)/);
    if (vimeoMatch) {
      return '/video-icon.png'; // رمز فيديو افتراضي (يمكنك استبداله)
    }
    // MP4 أو غير ذلك
    if (url.endsWith('.mp4')) {
      return '/video-icon.png';
    }
    return '/video-icon.png';
  };

 // Render Media Section
  const renderMedia = () => {
    return (
   <div className="space-y-6">
        {/* Profile Image Section */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">الصورة الشخصية</h3>
          <div className="flex items-center space-x-4">
            {editFormData.profile_image?.url ? (
              <div className="relative">
                <img
                  src={editFormData.profile_image.url}
                  alt="Profile"
                  className="object-cover w-32 h-32 rounded-full"
                />
                {isEditing && (
                  <button
                    onClick={handleDeleteProfileImage}
                    className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center w-32 h-32 bg-gray-200 rounded-full">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            {isEditing && (
              <div>
                <label className="block">
                  <span className="sr-only">اختر صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  يفضل أن تكون الصورة واضحة وحديثة
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Images Section */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">صور إضافية</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {editFormData.additional_images?.map((image, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={image.url}
                  alt={`Additional ${idx + 1}`}
                  className="object-cover w-full h-32 rounded-lg"
                />
                {isEditing && (
                  <button
                    onClick={() => handleDeleteAdditionalImage(idx)}
                    className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {isEditing && editFormData.additional_images?.length < 10 && (
              <div className="flex items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-lg">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdditionalImageUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="block mt-2 text-sm text-gray-600">
                      إضافة صورة
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>
          {isEditing && (
            <p className="mt-2 text-sm text-gray-500">
              يمكنك إضافة حتى 10 صور إضافية
            </p>
          )}
        </div>

        {/* Videos Section */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">فيديوهات</h3>
            {isEditing && (editFormData.videos?.length ?? 0) < MAX_VIDEOS && (
              <button
                onClick={() => setShowVideoForm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                إضافة فيديو جديد
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {editFormData.videos?.map((video, idx) => (
              <div key={idx} className="relative group">
                <div className="overflow-hidden bg-gray-100 rounded-lg">
                  {getVideoEmbed(video.url)}
                  <div className="p-4">
                    <p className="text-sm text-gray-700">{video.desc}</p>
                  </div>
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveVideo(idx)}
                    className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (editFormData.videos?.length ?? 0) < MAX_VIDEOS && (
            <div className="p-4 mt-4 bg-white border rounded-lg shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    رابط الفيديو
                  </label>
                  <input
                    type="url"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    وصف الفيديو
                  </label>
                  <input
                    type="text"
                    value={newVideo.desc}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, desc: e.target.value }))}
                    placeholder="مثال: مهاراتي في التسديد"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (newVideo.url && newVideo.desc) {
                        handleAddVideo(newVideo);
                        setNewVideo({ url: '', desc: '' });
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    إضافة الفيديو
                  </button>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <p className="mt-2 text-sm text-gray-500">
              يمكنك إضافة حتى {MAX_VIDEOS} فيديوهات من يوتيوب أو فيميو
            </p>
          )}
        </div>
   </div>
 );
  };

  // Render Contracts Section
  const renderContracts = () => (
    <div className="space-y-6">
      <h2 className="pr-4 text-2xl font-semibold border-r-4 border-blue-500">التعاقدات والاتصالات</h2>
      {/* هل لديك جواز سفر */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">هل لديك جواز سفر؟</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="has_passport"
              checked={editFormData.has_passport === 'yes'}
              onChange={() => setEditFormData(prev => ({ ...prev, has_passport: 'yes' }))}
              disabled={!isEditing}
            />
            <span>نعم</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="has_passport"
              checked={editFormData.has_passport === 'no'}
              onChange={() => setEditFormData(prev => ({ ...prev, has_passport: 'no' }))}
              disabled={!isEditing}
            />
            <span>لا</span>
          </label>
        </div>
      </div>
      {/* هل أنت متعاقد حاليًا */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">هل أنت متعاقد حاليًا؟</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="currently_contracted"
              checked={editFormData.currently_contracted === 'yes'}
              onChange={() => setEditFormData(prev => ({ ...prev, currently_contracted: 'yes' }))}
              disabled={!isEditing}
            />
            <span>نعم</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="currently_contracted"
              checked={editFormData.currently_contracted === 'no'}
              onChange={() => setEditFormData(prev => ({ ...prev, currently_contracted: 'no' }))}
              disabled={!isEditing}
            />
            <span>لا</span>
          </label>
        </div>
      </div>
      {/* تاريخ التعاقدات السابقة */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">تاريخ التعاقدات السابقة</label>
        {isEditing ? (
          <div>
            {(editFormData.contract_history || []).map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 mb-2 md:flex-row md:items-center">
                <input
                  type="text"
                  placeholder="اسم النادي"
                  value={item.club || ''}
                  onChange={e => {
                    const updated = [...(editFormData.contract_history || [])];
                    updated[idx] = { ...updated[idx], club: e.target.value };
                    setEditFormData(prev => ({ ...prev, contract_history: updated }));
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="من"
                  value={item.from || ''}
                  onChange={e => {
                    const updated = [...(editFormData.contract_history || [])];
                    updated[idx] = { ...updated[idx], from: e.target.value };
                    setEditFormData(prev => ({ ...prev, contract_history: updated }));
                  }}
                  className="p-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="إلى"
                  value={item.to || ''}
                  onChange={e => {
                    const updated = [...(editFormData.contract_history || [])];
                    updated[idx] = { ...updated[idx], to: e.target.value };
                    setEditFormData(prev => ({ ...prev, contract_history: updated }));
                  }}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="الدور/المسمى"
                  value={item.role || ''}
                  onChange={e => {
                    const updated = [...(editFormData.contract_history || [])];
                    updated[idx] = { ...updated[idx], role: e.target.value };
                    setEditFormData(prev => ({ ...prev, contract_history: updated }));
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...(editFormData.contract_history || [])];
                    updated.splice(idx, 1);
                    setEditFormData(prev => ({ ...prev, contract_history: updated }));
                  }}
                  className="p-1 text-red-500 rounded bg-red-50 hover:bg-red-100"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setEditFormData(prev => ({
                ...prev,
                contract_history: [...(prev.contract_history || []), { club: '', from: '', to: '', role: '' }]
              }))}
              className="flex items-center mt-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} className="mr-1" /> إضافة تعاقد
            </button>
          </div>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
            {(formData.contract_history || []).length === 0 ?
              'لا يوجد تعاقدات سابقة' :
              formData.contract_history.map((item, idx) => (
                <div key={idx} className="py-1">
                  {item.club} - {item.from} إلى {item.to} - {item.role}
                </div>
              ))
            }
          </div>
        )}
      </div>
      {/* تاريخ وكلاء اللاعبين */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">تاريخ وكلاء اللاعبين</label>
        {isEditing ? (
          <div>
            {(editFormData.agent_history || []).map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 mb-2 md:flex-row md:items-center">
                <input
                  type="text"
                  placeholder="اسم الوكيل"
                  value={item.agent || ''}
                  onChange={e => {
                    const updated = [...(editFormData.agent_history || [])];
                    updated[idx] = { ...updated[idx], agent: e.target.value };
                    setEditFormData(prev => ({ ...prev, agent_history: updated }));
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="من"
                  value={item.from || ''}
                  onChange={e => {
                    const updated = [...(editFormData.agent_history || [])];
                    updated[idx] = { ...updated[idx], from: e.target.value };
                    setEditFormData(prev => ({ ...prev, agent_history: updated }));
                  }}
                  className="p-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="إلى"
                  value={item.to || ''}
                  onChange={e => {
                    const updated = [...(editFormData.agent_history || [])];
                    updated[idx] = { ...updated[idx], to: e.target.value };
                    setEditFormData(prev => ({ ...prev, agent_history: updated }));
                  }}
                  className="p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...(editFormData.agent_history || [])];
                    updated.splice(idx, 1);
                    setEditFormData(prev => ({ ...prev, agent_history: updated }));
                  }}
                  className="p-1 text-red-500 rounded bg-red-50 hover:bg-red-100"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setEditFormData(prev => ({
                ...prev,
                agent_history: [...(prev.agent_history || []), { agent: '', from: '', to: '' }]
              }))}
              className="flex items-center mt-2 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} className="mr-1" /> إضافة وكيل
            </button>
          </div>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
            {(formData.agent_history || []).length === 0 ?
              'لا يوجد وكلاء سابقون' :
              formData.agent_history.map((item, idx) => (
                <div key={idx} className="py-1">
                  {item.agent} - {item.from} إلى {item.to}
                </div>
              ))
            }
          </div>
        )}
      </div>
      {/* جهة الاتصال والتفاوض الرسمية */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">جهة الاتصال والتفاوض الرسمية</label>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">الاسم</label>
              <input
                type="text"
                value={editFormData.official_contact?.name || ''}
                onChange={e => setEditFormData(prev => ({
                  ...prev,
                  official_contact: { ...prev.official_contact, name: e.target.value }
                }))}
                className="w-full p-2 mt-1 border rounded"
                placeholder="اسم جهة الاتصال"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">المسمى الوظيفي</label>
              <input
                type="text"
                value={editFormData.official_contact?.title || ''}
                onChange={e => setEditFormData(prev => ({
                  ...prev,
                  official_contact: { ...prev.official_contact, title: e.target.value }
                }))}
                className="w-full p-2 mt-1 border rounded"
                placeholder="المسمى الوظيفي"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
              <input
                type="tel"
                value={editFormData.official_contact?.phone || ''}
                onChange={e => setEditFormData(prev => ({
                  ...prev,
                  official_contact: { ...prev.official_contact, phone: e.target.value }
                }))}
                className="w-full p-2 mt-1 border rounded"
                placeholder="+966XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <input
                type="email"
                value={editFormData.official_contact?.email || ''}
                onChange={e => setEditFormData(prev => ({
                  ...prev,
                  official_contact: { ...prev.official_contact, email: e.target.value }
                }))}
                className="w-full p-2 mt-1 border rounded"
                placeholder="example@domain.com"
              />
            </div>
          </div>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
            {formData.official_contact ? (
              <div className="space-y-2">
                <div><span className="font-medium">الاسم:</span> {formData.official_contact.name || 'غير محدد'}</div>
                <div><span className="font-medium">المسمى الوظيفي:</span> {formData.official_contact.title || 'غير محدد'}</div>
                <div><span className="font-medium">رقم الهاتف:</span> {formData.official_contact.phone || 'غير محدد'}</div>
                <div><span className="font-medium">البريد الإلكتروني:</span> {formData.official_contact.email || 'غير محدد'}</div>
              </div>
            ) : (
              'غير محدد'
            )}
          </div>
        )}
      </div>
      {/* من أين عرفت عنّا */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">من أين عرفت عنّا؟</label>
        <div className="flex flex-wrap gap-4">
          {['صديق', 'وسائل التواصل', 'بحث Google', 'إعلان', 'أخرى'].map(option => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="radio"
                name="ref_source"
                checked={editFormData.ref_source === option}
                onChange={() => setEditFormData(prev => ({ ...prev, ref_source: option }))}
                disabled={!isEditing}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

 // Main Component Return
 console.log('PlayerProfile: Rendering main form');
 return (
   <DashboardLayout>
     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
       {/* Loading Overlay */}
       {submitting && <LoadingSpinner />}

       {/* Success Message */}
       {successMessage && <SuccessMessage message={successMessage} />}

       <main className="container px-4 py-8 mx-auto">
         {formErrors.submit && <ErrorMessage message={formErrors.submit} />}

         <form className="p-6 bg-white rounded-lg shadow-lg">
           {/* Progress Steps */}
           <div className="mb-8">
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                {Object.entries(STEP_TITLES).map(([step, title], idx) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setCurrentStep(Number(step))}
                    className={
                      classNames(
                        "px-4 py-2 rounded-full font-semibold transition-all duration-200 border",
                        currentStep === Number(step)
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                          : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:scale-105"
                      )
                    }
                    style={{ minWidth: 120 }}
                  >
                    {title}
                  </button>
                ))}
              </div>
           </div>

           {/* Form Sections */}
           {currentStep === STEPS.PERSONAL && renderPersonalInfo()}
           {currentStep === STEPS.EDUCATION && renderEducation()}
           {currentStep === STEPS.MEDICAL && renderMedicalRecord()}
           {currentStep === STEPS.SPORTS && renderSportsInfo()}
           {currentStep === STEPS.SKILLS && renderSkills()}
           {currentStep === STEPS.OBJECTIVES && renderObjectives()}
           {currentStep === STEPS.MEDIA && renderMedia()}
            {currentStep === STEPS.CONTRACTS && renderContracts()}

           {/* Navigation Buttons */}
            <div className="flex flex-col-reverse items-center justify-between gap-4 mt-8 md:flex-row">
              {currentStep > STEPS.PERSONAL && (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2 text-gray-700 transition-all duration-200 bg-gray-100 border border-gray-300 rounded-full shadow-sm hover:bg-gray-200"
                >
                  السابق
                </Button>
              )}
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    {currentStep < STEPS.MEDIA && (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-2 text-white transition-all duration-200 bg-blue-600 rounded-full shadow-md hover:bg-blue-700"
                      >
                        التالي
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 text-white transition-all duration-200 bg-yellow-500 rounded-full shadow-md hover:bg-yellow-600"
                    >
                      تعديل
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={handleSave}
                      className="px-6 py-2 text-white transition-all duration-200 bg-green-600 rounded-full shadow-md hover:bg-green-700"
                      disabled={editLoading}
                    >
                      {editLoading ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 text-white transition-all duration-200 bg-gray-400 rounded-full shadow-md hover:bg-gray-500"
                    >
                      إلغاء
                    </Button>
                  </>
                )}
              </div>
           </div>
         </form>
       </main>
     </div>
   </DashboardLayout>
 );
}

// Phone icon component
interface PhoneIconProps extends React.SVGProps<SVGSVGElement> {
  // Extends built-in SVG props
}

const Phone = (props: React.SVGProps<SVGSVGElement>) => (
 <svg
   xmlns="http://www.w3.org/2000/svg"
   width="24"
   height="24"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   {...props}
 >
   <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
 </svg>
);


// FileText icon component
const FileText = (props: React.SVGProps<SVGSVGElement>) => (
 <svg
   xmlns="http://www.w3.org/2000/svg"
   width="24"
   height="24"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   {...props}
 >
   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
   <polyline points="14 2 14 8 20 8"></polyline>
   <line x1="16" y1="13" x2="8" y2="13"></line>
   <line x1="16" y1="17" x2="8" y2="17"></line>
   <polyline points="10 9 9 9 8 9"></polyline>
 </svg>
);

// Error Message Component (missing from original)
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
 <div className="p-4 mb-4 bg-red-100 border border-red-400 rounded-md">
   <div className="flex items-center">
     <X className="w-5 h-5 mr-2 text-red-500" />
     <p className="text-red-700">{message}</p>
   </div>
 </div>
);
