'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from "@/components/ui/card";
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import {
  Eye,
  Heart,
  Mail,
  UserCheck,
  Video
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type WelcomePopupProps = {
  onClose: () => void;
}

// مكون رسالة الترحيب
function WelcomePopup({ onClose }: WelcomePopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Close the popup after 5 seconds

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-8 bg-white rounded-2xl animate-fade-in">
        <Image src="/hagzz-logo.png" alt="HAGZZ GO" width={80} height={80} className="h-20 mx-auto mb-6" />
        <h2 className="mb-4 text-2xl font-bold">🎉 مرحبًا بك في HAGZZ GO</h2>
        <p className="mb-8 leading-relaxed text-gray-600">
          لنبدأ رحلتك نحو الاحتراف. قم بتخصيص ملفك الشخصي الآن واحصل على أفضل الفرص في عالم كرة القدم!
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700"
        >
          ابدأ الآن 🚀
        </button>
      </div>
    </div>
  );
}

// مكونات الواجهة
interface Stat {
  icon: React.ComponentType;
  title: string;
  value: string;
  subText: string;
  change: string;
  color: string;
}

export default function PlayerDashboard() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [userData, setUserData] = useState<Record<string, unknown>>({});
  const [newVideo, setNewVideo] = useState<{url: string; desc: string}>({ url: '', desc: '' });
  const [hasPassport, setHasPassport] = useState<string>('');
  const [refSource, setRefSource] = useState('');
  const refOptions = [
    'صديق',
    'وسائل التواصل',
    'بحث Google',
    'إعلان',
    'أخرى'
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            console.log('بيانات المستخدم:', userDoc.data());
          }
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات المستخدم:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  // بيانات اللاعب الوهمية
  const mockData = {
    stats: [
      {
        icon: Eye,
        title: "المشاهدات",
        value: "1,234",
        subText: "مشاهدات الملف",
        change: "+12%",
        color: "bg-blue-500",
        viewers: {
          clubs: 450,
          agents: 320,
          trainers: 280,
          marketers: 184
        }
      },
      {
        icon: Mail,
        title: "الرسائل",
        value: "48",
        subText: "رسالة جديدة",
        change: "+8%",
        color: "bg-violet-500",
        distribution: {
          clubs: 20,
          agents: 15,
          trainers: 13
        }
      },
      {
        icon: Heart,
        title: "الإعجابات",
        value: "2.1K",
        subText: "إعجاب",
        change: "+5%",
        color: "bg-pink-500"
      },
      {
        icon: UserCheck,
        title: "المتابعون",
        value: "856",
        subText: "متابع",
        change: "+12%",
        color: "bg-green-500"
      }
    ],
    skills: {
      technical: [
        { name: "التحكم بالكرة", value: 85, color: "bg-blue-600" },
        { name: "التمرير", value: 78, color: "bg-blue-600" },
        { name: "التسديد", value: 90, color: "bg-blue-600" },
        { name: "المراوغة", value: 82, color: "bg-blue-600" }
      ],
      physical: [
        { name: "السرعة", value: 88, color: "bg-green-600" },
        { name: "القوة", value: 75, color: "bg-green-600" },
        { name: "التحمل", value: 85, color: "bg-green-600" }
      ],
      social: [
        { name: "العمل الجماعي", value: 90, color: "bg-purple-600" },
        { name: "التواصل", value: 85, color: "bg-purple-600" },
        { name: "الانضباط", value: 95, color: "bg-purple-600" },
        { name: "الثقة بالنفس", value: 88, color: "bg-purple-600" },
        { name: "تحمل الضغط", value: 82, color: "bg-purple-600" }
      ],
      medical: {
        bloodType: "A+",
        height: 180,
        weight: 75,
        bmi: 23.1,
        conditions: [],
        lastCheckup: "2024-01-15"
      }
    },
    messages: [
      {
        id: 1,
        sender: "نادي الهلال",
        type: "club",
        content: "دعوة لتجربة أداء",
        time: "منذ ساعتين",
        avatar: "/club-avatar.png",
        unread: true,
        priority: "high"
      },
      {
        id: 2,
        sender: "وكيل معتمد",
        type: "agent",
        content: "عرض احتراف جديد",
        time: "منذ 3 ساعات",
        avatar: "/agent-avatar.png",
        unread: true,
        priority: "medium"
      }
    ],
    media: {
      images: [
        { url: "/player-1.jpg", title: "تدريب", date: "2024-01-20" },
        { url: "/player-2.jpg", title: "مباراة", date: "2024-01-15" }
      ],
      videos: [
        {
          url: "/video-1.mp4",
          thumbnail: "/thumb-1.jpg",
          title: "أهداف المباراة",
          duration: "2:30"
        }
      ]
    },
    personalProgress: {
      total: 85,
      sections: {
        personal: 100,
        sports: 90,
        medical: 70,
        media: 80
      }
    }
  };

  function StatsCard({ stat }: { stat: Stat }) {
    return (
      <div className="relative p-6 transition-all duration-300 bg-white shadow-sm rounded-2xl hover:shadow-lg group">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-20 flex items-center justify-center`}>
            {React.createElement(stat.icon as React.ComponentType<{ className?: string }>, { className: `w-6 h-6 ${stat.color.replace('bg-', 'text-')}` })}
          </div>
          <span className="px-2 py-1 text-sm bg-gray-100 rounded-full">{stat.change}</span>
        </div>
        <div className="mt-4">
          <h3 className="text-sm text-gray-600">{stat.title}</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{stat.value}</p>
            <span className="text-sm text-gray-500">{stat.subText}</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 transition-opacity opacity-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent group-hover:opacity-100"></div>
      </div>
    );
  }

  interface Skill {
    name: string;
    value: number;
    color: string;
  }

  function SkillBar({ skill }: { skill: Skill }) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{skill.name}</span>
          <span>{skill.value}%</span>
        </div>
        <div className="h-2 overflow-hidden bg-gray-100 rounded-full">
          <div
            className={`h-full ${skill.color} rounded-full transition-transform duration-1000`}
            style={{ width: `${skill.value}%`, transform: 'translateX(0)' }}
          />
        </div>
      </div>
    );
  }

  function ProgressCircle({ value, label, size = 180 }: { value: number; label: string; size?: number }) {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (100 - value) / 100 * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform rotate-90 rtl:-rotate-90" width={size} height={size}>
          <circle
            className="text-gray-100"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="text-blue-600 transition-all duration-1000"
            strokeWidth="10"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: progress
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-blue-600">{value}%</span>
          <span className="mt-2 text-sm text-gray-500">{label}</span>
        </div>
      </div>
    );
  }

  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [refSourceTab, setRefSourceTab] = useState('');

  // بيانات التعاقدات والاتصالات
  const contractData = {
    currentStatus: {
      status: "متاح للتعاقد",
      availability: "فوري",
      preferredRole: "لاعب أساسي",
      contractType: "احترافي",
      salaryExpectations: "قابل للتفاوض"
    },
    clubPreferences: {
      preferredLeagues: ["الدوري السعودي", "دوري الخليج العربي"],
      preferredCountries: ["السعودية", "الإمارات", "قطر"],
      preferredPositions: ["وسط مهاجم", "جناح"],
      preferredPlayingStyle: "هجومي"
    },
    contractHistory: [
      {
        club: "نادي الشباب",
        period: "2020-2022",
        role: "لاعب أساسي",
        achievements: ["هداف الدوري", "أفضل لاعب شاب"]
      },
      {
        club: "نادي الاتحاد",
        period: "2022-2023",
        role: "لاعب احتياطي",
        achievements: ["كأس الملك"]
      }
    ],
    currentOffers: [
      {
        club: "نادي الهلال",
        type: "عرض احترافي",
        status: "قيد المراجعة",
        date: "2024-02-15"
      },
      {
        club: "نادي النصر",
        type: "عرض تجريبي",
        status: "معلق",
        date: "2024-02-10"
      }
    ],
    agentInfo: {
      name: "أحمد محمد",
      contact: "+966 50 123 4567",
      email: "agent@example.com",
      status: "نشط"
    }
  };

  // مكون عرض التعاقدات والاتصالات
  function ContractsTab() {
    return (
      <div className="space-y-6">
        {/* حالة التعاقد الحالية */}
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-bold">الحالة الحالية</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(contractData.currentStatus).map(([key, value]) => (
              <div key={key} className="p-4 rounded-lg bg-gray-50">
                <h4 className="mb-2 text-sm font-medium text-gray-600">{key}</h4>
                <p className="text-lg font-semibold text-blue-600">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* تفضيلات النادي */}
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-bold">تفضيلات النادي</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Object.entries(contractData.clubPreferences).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600">{key}</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(value) ? (
                    value.map((item, index) => (
                      <span key={index} className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                      {value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* تاريخ التعاقدات */}
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-bold">تاريخ التعاقدات</h3>
          <div className="space-y-4">
            {contractData.contractHistory.map((contract, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold">{contract.club}</h4>
                  <span className="text-sm text-gray-600">{contract.period}</span>
                </div>
                <p className="mb-2 text-gray-600">{contract.role}</p>
                <div className="flex flex-wrap gap-2">
                  {contract.achievements.map((achievement, idx) => (
                    <span key={idx} className="px-2 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* العروض الحالية */}
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-bold">العروض الحالية</h3>
          <div className="space-y-4">
            {contractData.currentOffers.map((offer, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div>
                  <h4 className="font-semibold">{offer.club}</h4>
                  <p className="text-sm text-gray-600">{offer.type}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    offer.status === 'قيد المراجعة' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {offer.status}
                  </span>
                  <p className="mt-1 text-sm text-gray-600">{offer.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* معلومات الوكيل */}
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-bold">معلومات الوكيل</h3>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Object.entries(contractData.agentInfo).map(([key, value]) => (
                <div key={key}>
                  <h4 className="text-sm font-medium text-gray-600">{key}</h4>
                  <p className="text-lg font-semibold text-blue-600">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* سؤال جواز السفر */}
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-bold">هل لديك جواز سفر؟</h3>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="passport"
                value="yes"
                checked={hasPassport === 'yes'}
                onChange={() => setHasPassport('yes')}
                className="accent-blue-600"
              />
              <span>نعم</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="passport"
                value="no"
                checked={hasPassport === 'no'}
                onChange={() => setHasPassport('no')}
                className="accent-blue-600"
              />
              <span>لا</span>
            </label>
          </div>
        </Card>

        {/* سؤال من أين عرفت عنا */}
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-bold">من أين عرفت عنّا؟</h3>
          <div className="flex flex-wrap gap-4 mt-2">
            {refOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="refSource"
                  value={option}
                  checked={refSource === option}
                  onChange={() => setRefSource(option)}
                  className="accent-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // مكون تبويب معرض الوسائط
  function MediaTab() {
    return (
      <div className="mt-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">معرض الوسائط</h3>
            <button className="text-blue-600 hover:underline">إضافة وسائط</button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {mockData.media.images.map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg group aspect-video">
                <Image
                  src={image.url}
                  alt={image.title}
                  width={400}
                  height={225}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-100">
                  <div className="absolute bottom-3 left-3">
                    <h4 className="font-medium text-white">{image.title}</h4>
                    <p className="text-sm text-gray-300">{image.date}</p>
                  </div>
                </div>
              </div>
            ))}
            {mockData.media.videos.map((video, index) => (
              <div key={`video-${index}`} className="relative overflow-hidden rounded-lg group aspect-video">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  width={400}
                  height={225}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/80">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-100">
                  <div className="absolute bottom-3 left-3">
                    <h4 className="font-medium text-white">{video.title}</h4>
                    <p className="text-sm text-gray-300">{video.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // مكون تبويب مصدر المعرفة
  function RefSourceTab() {
    return (
      <Card className="p-6 mt-8">
        <h3 className="mb-4 text-xl font-bold">من أين عرفت عنّا؟</h3>
        <div className="flex flex-wrap gap-4 mt-2">
          {refOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="refSourceTab"
                value={option}
                checked={refSourceTab === option}
                onChange={() => setRefSourceTab(option)}
                className="accent-blue-600"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <DashboardLayout>
      {showWelcome && <WelcomePopup onClose={handleCloseWelcome} />}
      <div className="p-6 space-y-6">
        {/* ملاحظة توضيحية */}
        <div className="p-3 mb-4 text-base font-semibold text-center text-yellow-800 border border-yellow-200 rounded-lg bg-yellow-50">
          يمكنك التنقل بين التبويبات بالضغط على الأزرار في الأعلى. التبويب النشط يظهر بلون أزرق وخلفية مميزة.
        </div>
        {/* التبويبات */}
        <div className="flex space-x-4 space-x-reverse border-b">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 font-bold flex items-center gap-2 rounded-t-lg transition-all duration-200
              ${selectedTab === 'overview'
                ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}
            `}
          >
            <span>👁️</span>
            نظرة عامة
          </button>
          <button
            onClick={() => setSelectedTab('media')}
            className={`px-4 py-2 font-bold flex items-center gap-2 rounded-t-lg transition-all duration-200
              ${selectedTab === 'media'
                ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}
            `}
          >
            <span>🖼️</span>
            معرض الوسائط
          </button>
          <button
            onClick={() => setSelectedTab('contracts')}
            className={`px-4 py-2 font-bold flex items-center gap-2 rounded-t-lg transition-all duration-200
              ${selectedTab === 'contracts'
                ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}
            `}
          >
            <span>📄</span>
            التعاقدات والاتصالات
          </button>
          <button
            onClick={() => setSelectedTab('refsource')}
            className={`px-4 py-2 font-bold flex items-center gap-2 rounded-t-lg transition-all duration-200
              ${selectedTab === 'refsource'
                ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}
            `}
          >
            <span>❓</span>
            مصدر المعرفة
          </button>
        </div>
        {/* محتوى التبويبات */}
        {selectedTab === 'overview' && (
          <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mockData.stats.map((stat, index) => (
            <StatsCard key={index} stat={stat} />
          ))}
        </div>
        {/* المهارات والتقدم */}
        <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-3">
          <Card className="p-6">
            <h3 className="mb-6 text-xl font-bold">المهارات الفنية</h3>
            <div className="space-y-6">
              {mockData.skills.technical.map((skill, index) => (
                <SkillBar key={index} skill={skill} />
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6 text-xl font-bold">المهارات البدنية</h3>
            <div className="space-y-6">
              {mockData.skills.physical.map((skill, index) => (
                <SkillBar key={index} skill={skill} />
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6 text-xl font-bold">المهارات النفسية</h3>
            <div className="space-y-6">
              {mockData.skills.social.map((skill, index) => (
                <SkillBar key={index} skill={skill} />
              ))}
            </div>
          </Card>
        </div>

        {/* الرسائل والتقدم */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">آخر الرسائل</h3>
              <Link href="/messages" className="text-blue-600 hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="space-y-4">
              {mockData.messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center p-4 space-x-4 space-x-reverse transition-colors bg-white rounded-lg hover:bg-gray-50"
                >
                  <div className="relative">
                    <Image
                      src={message.avatar}
                      alt={message.sender}
                      width={48}
                      height={48}
                      className="w-12 h-12 border border-gray-200 rounded-full"
                    />
                    {message.priority === 'high' && (
                      <span className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-1 -right-1"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-semibold">{message.sender}</h4>
                      <span className="text-sm text-gray-500">{message.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6 text-xl font-bold">تقدم الملف الشخصي</h3>
            <div className="flex flex-col items-center">
              <ProgressCircle
                value={mockData.personalProgress.total}
                label="اكتمال الملف"
              />
              <div className="w-full mt-6 space-y-4">
                {Object.entries(mockData.personalProgress.sections).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-600">{key}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden bg-gray-100 rounded-full">
                      <div
                        className="h-full transition-transform duration-1000 bg-blue-600 rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 mt-6 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                تحديث الملف
              </button>
            </div>
          </Card>
        </div>
          </>
        )}
        {selectedTab === 'media' && <MediaTab />}
        {selectedTab === 'contracts' && <ContractsTab />}
        {selectedTab === 'refsource' && <RefSourceTab />}
      </div>
    </DashboardLayout>
  );
}