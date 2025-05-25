'use client';

import DashboardLayout from "@/components/layout/DashboardLayout.jsx";
import { auth, db } from '@/lib/firebase/config';
import { Achievement, AgentHistory, ContractHistory, Document, Image, Injury, PlayerFormData, Video } from '@/types/player';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { doc, getDoc } from 'firebase/firestore';
import {
  Dumbbell,
  FileText,
  GraduationCap,
  HeartPulse,
  ImageIcon,
  Star,
  Target, User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import 'react-photo-view/dist/react-photo-view.css';
import ReactPlayer from 'react-player/lazy';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

// Make sure this import is at the end of your imports
import '../../../globals.css';

// تهيئة Supabase
const supabaseUrl = 'https://ekyerljzfokqimbabzxm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTcyODMsImV4cCI6MjA2MjIzMzI4M30.Xd6Cg8QUISHyCG-qbgo9HtWUZz6tvqAqG6KKXzuetBY';
const supabase = createClient(supabaseUrl, supabaseKey);

// تعيين اللغة العربية لمكتبة dayjs
dayjs.locale('ar');

// استبدال واجهة Player بواجهة PlayerFormData من الملف الشخصي
export interface Surgery {
  type: string;
  date: string;
}

export interface ClubHistory {
  name: string;
  from: string;
  to: string;
}

const PlayerReport = () => {
  const router = useRouter();
  const [user, loading, authError] = useAuthState(auth);
  const [player, setPlayer] = useState<PlayerFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // تحويل بيانات المهارات لمخططات الرادار
  const technicalSkillsData = player?.technical_skills
    ? Object.entries(player.technical_skills).map(([key, value]) => ({
        skill: key === 'ball_control' ? 'التحكم بالكرة'
              : key === 'passing' ? 'التمرير'
              : key === 'shooting' ? 'التسديد'
              : key === 'dribbling' ? 'المراوغة'
              : key,
        value: Number(value)
      }))
    : [];

  const physicalSkillsData = player?.physical_skills
    ? Object.entries(player.physical_skills).map(([key, value]) => ({
        skill: key === 'speed' ? 'السرعة'
              : key === 'strength' ? 'القوة'
              : key === 'stamina' ? 'التحمل'
              : key === 'agility' ? 'الرشاقة'
              : key === 'balance' ? 'التوازن'
              : key === 'flexibility' ? 'المرونة'
              : key,
        value: Number(value)
      }))
    : [];

  const socialSkillsData = player?.social_skills
    ? Object.entries(player.social_skills).map(([key, value]) => ({
        skill: key === 'teamwork' ? 'العمل الجماعي'
              : key === 'communication' ? 'التواصل'
              : key === 'discipline' ? 'الانضباط'
              : key === 'self_confidence' ? 'الثقة بالنفس'
              : key === 'pressure_handling' ? 'تحمل الضغط'
              : key === 'punctuality' ? 'الالتزام بالمواعيد'
              : key,
        value: Number(value)
      }))
    : [];

  // Render functions for each tab
  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">الاسم الكامل</div>
        <div className="text-lg font-bold text-blue-900">{player?.full_name || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">تاريخ الميلاد</div>
        <div className="text-lg font-bold text-green-900">
          {player?.birth_date ? dayjs(player.birth_date).format('DD/MM/YYYY') : '--'}
        </div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50">
        <div className="mb-1 font-semibold text-purple-700">الجنسية</div>
        <div className="text-lg font-bold text-purple-900">{player?.nationality || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-50">
        <div className="mb-1 font-semibold text-yellow-700">المدينة</div>
        <div className="text-lg font-bold text-yellow-900">{player?.city || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-red-50">
        <div className="mb-1 font-semibold text-red-700">الدولة</div>
        <div className="text-lg font-bold text-red-900">{player?.country || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-indigo-50">
        <div className="mb-1 font-semibold text-indigo-700">رقم الهاتف</div>
        <div className="text-lg font-bold text-indigo-900">{player?.phone || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-pink-50">
        <div className="mb-1 font-semibold text-pink-700">واتساب</div>
        <div className="text-lg font-bold text-pink-900">{player?.whatsapp || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-orange-50">
        <div className="mb-1 font-semibold text-orange-700">البريد الإلكتروني</div>
        <div className="text-lg font-bold text-orange-900">{player?.email || '--'}</div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-teal-50">
        <div className="mb-1 font-semibold text-teal-700">نبذة مختصرة</div>
        <div className="text-lg font-bold text-teal-900">{player?.brief || '--'}</div>
      </div>
    </div>
  );

  const renderSportsInfo = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">المركز الأساسي</div>
        <div className="text-lg font-bold text-blue-900">{player?.primary_position || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">المركز الثانوي</div>
        <div className="text-lg font-bold text-green-900">{player?.secondary_position || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50">
        <div className="mb-1 font-semibold text-purple-700">القدم المفضلة</div>
        <div className="text-lg font-bold text-purple-900">{player?.preferred_foot || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-50">
        <div className="mb-1 font-semibold text-yellow-700">الطول</div>
        <div className="text-lg font-bold text-yellow-900">{player?.height ? `${player.height} سم` : '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-red-50">
        <div className="mb-1 font-semibold text-red-700">الوزن</div>
        <div className="text-lg font-bold text-red-900">{player?.weight ? `${player.weight} كجم` : '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-indigo-50">
        <div className="mb-1 font-semibold text-indigo-700">النادي الحالي</div>
        <div className="text-lg font-bold text-indigo-900">{player?.current_club || '--'}</div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-pink-50">
        <div className="mb-2 font-semibold text-pink-700">الأندية السابقة</div>
        <div className="space-y-2">
          {player?.previous_clubs && player.previous_clubs.length > 0 ? (
            player.previous_clubs.map((club: string, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                {club}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد أندية سابقة مسجلة</div>
          )}
        </div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-orange-50">
        <div className="mb-2 font-semibold text-orange-700">الإنجازات</div>
        <div className="space-y-2">
          {player?.achievements && player.achievements.length > 0 ? (
            player.achievements.map((achievement: Achievement, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                <div className="font-semibold">{achievement.title}</div>
                <div className="text-sm text-gray-600">التاريخ: {achievement.date}</div>
                {achievement.description && (
                  <div className="mt-1 text-sm text-gray-600">{achievement.description}</div>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد إنجازات مسجلة</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">المستوى التعليمي</div>
        <div className="text-lg font-bold text-blue-900">{player?.education_level || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">سنة التخرج</div>
        <div className="text-lg font-bold text-green-900">{player?.graduation_year || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50">
        <div className="mb-1 font-semibold text-purple-700">مستوى اللغة الإنجليزية</div>
        <div className="text-lg font-bold text-purple-900">{player?.english_level || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-50">
        <div className="mb-1 font-semibold text-yellow-700">مستوى اللغة الإسبانية</div>
        <div className="text-lg font-bold text-yellow-900">{player?.spanish_level || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-red-50">
        <div className="mb-1 font-semibold text-red-700">مستوى اللغة العربية</div>
        <div className="text-lg font-bold text-red-900">{player?.arabic_level || '--'}</div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-indigo-50">
        <div className="mb-2 font-semibold text-indigo-700">الدورات التدريبية</div>
        <div className="space-y-2">
          {player?.training_courses && player.training_courses.length > 0 ? (
            player.training_courses.map((course: string, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                {course}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد دورات تدريبية مسجلة</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMedicalRecord = () => {
    // حساب BMI
    const height = player?.height ? parseFloat(player.height) : null;
    const weight = player?.weight ? parseFloat(player.weight) : null;
    const bmi = height && weight ? (weight / Math.pow(height / 100, 2)).toFixed(1) : null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="mb-1 font-semibold text-gray-700">الوزن (كجم)</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.weight || '--'}</div>
            {bmi && <div className="mt-1 text-xs text-gray-500">BMI: {bmi}</div>}
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">الطول (سم)</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.height || '--'}</div>
            <div className="mt-1 text-xs text-gray-500">متوسط الطول العالمي: 175 سم</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">فصيلة الدم</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.blood_type || '--'}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">آخر فحص طبي</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.medical_history?.last_checkup || '--'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 font-semibold text-gray-700">هل لديك أمراض مزمنة؟</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.chronic_conditions ? 'نعم' : 'لا'}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">تفاصيل الأمراض المزمنة</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.chronic_details || 'لا يوجد'}</div>
          </div>
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">الحساسية</div>
          <div className="p-2 text-center bg-gray-100 rounded">{player?.allergies ? player.allergies : 'لا يوجد'}</div>
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">الإصابات السابقة</div>
          {player?.injuries && player.injuries.length > 0 ? (
            player.injuries.map((injury: Injury, idx: number) => (
              <div key={idx} className="p-2 mb-2 bg-gray-100 rounded">
                <div>النوع: {injury.type || '--'}</div>
                <div>التاريخ: {injury.date || '--'}</div>
                <div>الحالة: {injury.status || '--'}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-center bg-gray-100 rounded">لا يوجد</div>
          )}
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">العمليات الجراحية</div>
          {player?.surgeries && player.surgeries.length > 0 ? (
            player.surgeries.map((surgery, idx) => (
              <div key={idx} className="p-2 mb-2 bg-gray-100 rounded">
                <div>النوع: {surgery.type || '--'}</div>
                <div>التاريخ: {surgery.date || '--'}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-center bg-gray-100 rounded">لا يوجد</div>
          )}
        </div>
      </div>
    );
  };

  const renderSkills = () => (
    <div className="space-y-8">
      {player?.technical_skills && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">المهارات الفنية</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={technicalSkillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="المهارات" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
            {Object.entries(player.technical_skills).map(([key, value]: [string, number]) => (
              <div key={key} className="p-2 bg-white rounded shadow">
                <div className="font-semibold">
                  {key === 'ball_control' ? 'التحكم بالكرة'
                  : key === 'passing' ? 'التمرير'
                  : key === 'shooting' ? 'التسديد'
                  : key === 'dribbling' ? 'المراوغة'
                  : key === 'heading' ? 'الضربات الرأسية'
                  : key === 'tackling' ? 'العرقلة'
                  : key === 'marking' ? 'المراقبة'
                  : key === 'positioning' ? 'التموضع'
                  : key === 'vision' ? 'الرؤية'
                  : key === 'decision_making' ? 'اتخاذ القرار'
                  : key}
                </div>
                <div className="text-sm text-gray-600">المستوى: {value}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {player?.physical_skills && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">المهارات البدنية</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={physicalSkillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="المهارات" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
            {Object.entries(player.physical_skills).map(([key, value]: [string, number]) => (
              <div key={key} className="p-2 bg-white rounded shadow">
                <div className="font-semibold">
                  {key === 'speed' ? 'السرعة'
                  : key === 'strength' ? 'القوة'
                  : key === 'stamina' ? 'التحمل'
                  : key === 'agility' ? 'الرشاقة'
                  : key === 'balance' ? 'التوازن'
                  : key === 'flexibility' ? 'المرونة'
                  : key === 'jumping' ? 'الوثب'
                  : key === 'coordination' ? 'التنسيق'
                  : key === 'reaction_time' ? 'وقت رد الفعل'
                  : key}
                </div>
                <div className="text-sm text-gray-600">المستوى: {value}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {player?.social_skills && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">المهارات الاجتماعية</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={socialSkillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="المهارات" dataKey="value" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
            {Object.entries(player.social_skills).map(([key, value]: [string, number]) => (
              <div key={key} className="p-2 bg-white rounded shadow">
                <div className="font-semibold">
                  {key === 'teamwork' ? 'العمل الجماعي'
                  : key === 'communication' ? 'التواصل'
                  : key === 'discipline' ? 'الانضباط'
                  : key === 'self_confidence' ? 'الثقة بالنفس'
                  : key === 'pressure_handling' ? 'تحمل الضغط'
                  : key === 'punctuality' ? 'الالتزام بالمواعيد'
                  : key === 'leadership' ? 'القيادة'
                  : key === 'adaptability' ? 'القدرة على التكيف'
                  : key === 'motivation' ? 'الدافعية'
                  : key}
                </div>
                <div className="text-sm text-gray-600">المستوى: {value}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderObjectives = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {player?.objectives && Object.entries(player.objectives).map(([key, value]: [string, boolean | string]) => (
        <div key={key} className="p-4 rounded-lg bg-blue-50">
          <div className="mb-1 font-semibold text-blue-700">
            {key === 'professional' ? 'احتراف'
            : key === 'trials' ? 'تجارب'
            : key === 'local_leagues' ? 'دوريات محلية'
            : key === 'arab_leagues' ? 'دوريات عربية'
            : key === 'european_leagues' ? 'دوريات أوروبية'
            : key === 'training' ? 'تدريب'
            : 'أخرى'}
          </div>
          <div className="text-lg font-bold text-blue-900">
            {typeof value === 'boolean' ? (value ? 'نعم' : 'لا') : value || '--'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-8">
      {player?.additional_images && player.additional_images.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">الصور</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {player.additional_images.map((image: Image, index: number) => (
              <div key={index} className="relative overflow-hidden rounded-lg shadow-md aspect-square">
                <img
                  src={image.url}
                  alt={`صورة ${index + 1}`}
                  className="object-cover w-full h-full cursor-pointer hover:opacity-90"
                  onClick={() => {
                    setSelectedImage(image.url);
                    setSelectedImageIdx(index);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {player?.videos && player.videos.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">الفيديوهات</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {player.videos.map((video: Video, index: number) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-md">
                <ReactPlayer
                  url={video.url}
                  width="100%"
                  height="300px"
                  controls
                  light
                />
                <div className="p-4 bg-white">
                  <p className="text-gray-700">{video.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContracts = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* سؤال جواز السفر */}
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">هل لديك جواز سفر؟</div>
        <div className="text-lg font-bold text-blue-900">
          {player?.has_passport === 'yes' ? 'نعم' : player?.has_passport === 'no' ? 'لا' : '--'}
        </div>
      </div>
      {/* سؤال متعاقد حاليًا */}
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">هل أنت متعاقد حاليًا؟</div>
        <div className="text-lg font-bold text-green-900">
          {player?.currently_contracted === 'yes' ? 'نعم' : player?.currently_contracted === 'no' ? 'لا' : '--'}
        </div>
      </div>
      {/* تاريخ التعاقدات السابقة */}
      <div className="col-span-2 p-4 rounded-lg bg-gray-50">
        <div className="mb-2 font-semibold text-gray-700">تاريخ التعاقدات السابقة</div>
        <div className="space-y-2">
          {player?.contract_history && player.contract_history.length > 0 ? (
            player.contract_history.map((contract: ContractHistory, idx: number) => (
              <div key={idx} className="p-2 bg-white rounded">
                <div>النادي: {contract.club || '--'}</div>
                <div>الفترة: {contract.from} - {contract.to}</div>
                <div>المركز: {contract.role || '--'}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد تعاقدات سابقة مسجلة</div>
          )}
        </div>
      </div>
      {/* بيانات وكيل اللاعبين */}
      <div className="col-span-2 p-4 rounded-lg bg-yellow-50">
        <div className="mb-2 font-semibold text-yellow-700">تاريخ وكيل اللاعبين</div>
        <div className="space-y-2">
          {player?.agent_history && player.agent_history.length > 0 ? (
            player.agent_history.map((agent: AgentHistory, idx: number) => (
              <div key={idx} className="p-2 bg-white rounded">
                <div>الاسم: {agent.agent || '--'}</div>
                <div>الفترة: {agent.from} - {agent.to}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا يوجد وكلاء لاعبين مسجلين</div>
          )}
        </div>
      </div>
      {/* جهة الاتصال والتفاوض الرسمية */}
      <div className="col-span-2 p-4 rounded-lg bg-purple-50">
        <div className="mb-2 font-semibold text-purple-700">جهة الاتصال والتفاوض الرسمية</div>
        <div className="p-2 bg-white rounded">
          <div>الاسم: {player?.official_contact.name || '--'}</div>
          <div>المسمى الوظيفي: {player?.official_contact.title || '--'}</div>
          <div>رقم الهاتف: {player?.official_contact.phone || '--'}</div>
          <div>البريد الإلكتروني: {player?.official_contact.email || '--'}</div>
        </div>
      </div>
      {/* كيف عرفت المنصة */}
      <div className="col-span-2 p-4 rounded-lg bg-orange-50">
        <div className="mb-2 font-semibold text-orange-700">من أين عرفت عنا؟</div>
        <div className="p-2 bg-white rounded">
          {player?.ref_source || '--'}
        </div>
      </div>
      {/* المستندات */}
      <div className="col-span-2 p-4 bg-blue-100 rounded-lg">
        <div className="mb-2 font-semibold text-blue-700">المستندات</div>
        <div className="space-y-2">
          {player?.documents && player.documents.length > 0 ? (
            player.documents.map((doc: Document, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                <div className="font-semibold">{doc.name}</div>
                <div className="text-sm text-gray-600">النوع: {doc.type}</div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">عرض المستند</a>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد مستندات مسجلة</div>
          )}
        </div>
      </div>
      {/* بيانات الاشتراك */}
      <div className="col-span-2 p-4 rounded-lg bg-green-50">
        <div className="mb-2 font-semibold text-green-700">تاريخ انتهاء الاشتراك</div>
        <div className="text-lg font-bold text-green-900">
          {player?.subscription_end ? dayjs(player.subscription_end).format('DD/MM/YYYY') : '--'}
        </div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-yellow-50">
        <div className="mb-2 font-semibold text-yellow-700">حالة الاشتراك</div>
        <div className="text-lg font-bold text-yellow-900">
          {player?.subscription_status || '--'}
        </div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-red-50">
        <div className="mb-2 font-semibold text-red-700">نوع الاشتراك</div>
        <div className="text-lg font-bold text-red-900">
          {player?.subscription_type || '--'}
        </div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-purple-50">
        <div className="mb-2 font-semibold text-purple-700">آخر تحديث</div>
        <div className="text-lg font-bold text-purple-900">
          {player?.updated_at ? dayjs(player.updated_at).format('DD/MM/YYYY') : '--'}
        </div>
      </div>
    </div>
  );

  const TABS = [
    { name: 'البيانات الشخصية', icon: <User className="w-5 h-5" />, render: renderPersonalInfo },
    { name: 'المعلومات الرياضية', icon: <Dumbbell className="w-5 h-5" />, render: renderSportsInfo },
    { name: 'المهارات', icon: <Star className="w-5 h-5" />, render: renderSkills },
    { name: 'المعلومات التعليمية', icon: <GraduationCap className="w-5 h-5" />, render: renderEducation },
    { name: 'السجل الطبي', icon: <HeartPulse className="w-5 h-5" />, render: renderMedicalRecord },
    { name: 'التعاقدات', icon: <FileText className="w-5 h-5" />, render: renderContracts },
    { name: 'الأهداف والطموحات', icon: <Target className="w-5 h-5" />, render: renderObjectives },
    { name: 'الصور والفيديوهات', icon: <ImageIcon className="w-5 h-5" />, render: renderMedia },
  ];

  // دالة لحساب نسبة اكتمال الملف الشخصي
  const calculateProfileCompletion = (player: PlayerFormData | null): number => {
    if (!player) return 0;

    const requiredFields = {
      basic: [
        'full_name',
        'birth_date',
        'nationality',
        'city',
        'country',
        'phone',
        'whatsapp',
        'email',
        'profile_image_url'
      ],
      physical: [
        'height',
        'weight',
        'blood_type',
        'chronic_details'
      ],
      football: [
        'primary_position',
        'secondary_position',
        'preferred_foot',
        'current_club'
      ],
      skills: [
        'technical_skills',
        'physical_skills',
        'social_skills'
      ],
      education: [
        'education_level',
        'graduation_year',
        'english_level',
        'spanish_level',
        'arabic_level'
      ],
      objectives: [
        'objectives'
      ],
      media: [
        'additional_image_urls',
        'videos'
      ]
    };

    let totalFields = 0;
    let completedFields = 0;

    // حساب الحقول الأساسية
    for (const field of requiredFields.basic) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب الحقول البدنية
    for (const field of requiredFields.physical) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب الحقول المتعلقة بكرة القدم
    for (const field of requiredFields.football) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب المهارات
    for (const field of requiredFields.skills) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && Object.keys(player[field as keyof PlayerFormData] || {}).length > 0) {
        completedFields++;
      }
    }

    // حساب الحقول التعليمية
    for (const field of requiredFields.education) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب الأهداف
    totalFields++;
    if (player.objectives && Object.values(player.objectives).some(value => value === true)) {
      completedFields++;
    }

    // حساب الوسائط
    for (const field of requiredFields.media) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && Array.isArray(player[field as keyof PlayerFormData]) && (player[field as keyof PlayerFormData] as any[]).length > 0) {
        completedFields++;
      }
    }

    return Math.round((completedFields / totalFields) * 100);
  };

  // جلب بيانات اللاعب من Firebase والصور من Supabase
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!user) {
        console.log("No user found, redirecting to login");
        router.push('/auth/login');
        return;
      }

      try {
        setIsLoading(true);
        console.log("Fetching player data for user:", user.uid);

        const playerDoc = await getDoc(doc(db, 'players', user.uid));
        console.log("Firestore response:", playerDoc.exists() ? "Document exists" : "Document does not exist");

        if (!playerDoc.exists()) {
          console.log("No player document found for user:", user.uid);
          setError("لم يتم العثور على بيانات اللاعب. يرجى إكمال ملفك الشخصي أولاً");
          setIsLoading(false);
          return;
        }

        const data = playerDoc.data();
        console.log("بيانات اللاعب من Firestore:", data);

        if (!data) {
          console.error("Player data is null or undefined");
          setError("بيانات اللاعب فارغة");
          setIsLoading(false);
          return;
        }

        // معالجة البيانات الطبية
        const medicalHistory = {
          blood_type: data.blood_type || '',
          chronic_conditions: data.chronic_conditions ? [data.chronic_conditions] : [],
          allergies: data.allergies ? [data.allergies] : [],
          injuries: data.injuries || [],
          last_checkup: data.medical_history?.last_checkup || ''
        };

        // معالجة الصور
        const additionalImages = data.additional_image_urls ?
          data.additional_image_urls.map((url: string) => ({ url })) :
          [];

        // معالجة الفيديوهات
        const videos = data.videos || [];

        // معالجة التواريخ
        let birthDate = null;
        try {
          birthDate = data.birth_date ? new Date(data.birth_date) : null;
        } catch (dateError) {
          console.error("Error converting birth_date:", dateError);
          birthDate = null;
        }

        let updatedAt = null;
        try {
          updatedAt = data.updated_at?.toDate() || new Date();
        } catch (dateError) {
          console.error("Error converting updated_at:", dateError);
          updatedAt = new Date();
        }

        let subscriptionEnd = null;
        try {
          subscriptionEnd = data.subscription_end?.toDate() || null;
        } catch (dateError) {
          console.error("Error converting subscription_end:", dateError);
          subscriptionEnd = null;
        }

        const processedData: PlayerFormData = {
          full_name: data.full_name || '',
          birth_date: birthDate,
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
          objectives: data.objectives || {
            professional: false,
            trials: false,
            local_leagues: false,
            arab_leagues: false,
            european_leagues: false,
            training: false,
            other: ''
          },
          profile_image: data.profile_image || null,
          additional_images: additionalImages,
          videos: videos,
          training_courses: data.training_courses || [],
          has_passport: data.has_passport || 'no',
          ref_source: data.ref_source || '',
          contract_history: data.contract_history || [],
          agent_history: data.agent_history || [],
          official_contact: data.official_contact || { name: '', title: '', phone: '', email: '' },
          currently_contracted: data.currently_contracted || 'no',
          achievements: data.achievements || [],
          medical_history: medicalHistory,
          current_club: data.current_club || '',
          previous_clubs: data.previous_clubs || [],
          documents: data.documents || [],
          updated_at: updatedAt,
          subscription_end: subscriptionEnd,
          profile_image_url: data.profile_image_url || '',
          subscription_status: data.subscription_status || '',
          subscription_type: data.subscription_type || ''
        };

        setPlayer(processedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching player data:", error);
        setError("حدث خطأ أثناء جلب بيانات اللاعب. يرجى المحاولة لاحقاً");
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, [user, router]);

  return (
    <DashboardLayout>
      <div className="p-4">
        {isLoading && <div>جاري التحميل...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {player ? (
          <>
            {/* التبويبات */}
            <div className="flex flex-wrap gap-2 mb-6">
              {TABS.map((tab, idx) => (
                <button
                  key={tab.name}
                  className={`flex items-center gap-2 px-4 py-2 rounded ${currentTab === idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setCurrentTab(idx)}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
            {/* محتوى التبويب الحالي */}
            <div>
              {TABS[currentTab].render()}
            </div>
          </>
        ) : !isLoading && !error ? (
          <div>لا توجد بيانات للعرض</div>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default PlayerReport;
