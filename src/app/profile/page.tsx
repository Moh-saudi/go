'use client';

import { PlayerFormData } from '@/types/player';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function PlayerProfile() {
  const [player, setPlayer] = useState<PlayerFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        console.log('بدء جلب بيانات اللاعب...');
        const response = await fetch('/api/player/profile');

        if (!response.ok) {
          const errorData = await response.json();
          console.error('خطأ في الاستجابة:', errorData);
          throw new Error(errorData.error || 'فشل في جلب بيانات اللاعب');
        }

        const data = await response.json();
        console.log('تم جلب البيانات بنجاح:', data);

        if (!data) {
          throw new Error('لم يتم استلام أي بيانات');
        }

        setPlayer(data);
      } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">خطأ</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <h2 className="text-2xl font-bold mb-2">لا توجد بيانات</h2>
          <p>لم يتم العثور على بيانات اللاعب</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white">
                {player.profile_image_url ? (
                  <Image
                    src={player.profile_image_url}
                    alt={player.full_name || 'صورة اللاعب'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">👤</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 pb-8 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">المعلومات الشخصية</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">الاسم الكامل</p>
                    <p className="font-medium">{player.full_name || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاريخ الميلاد</p>
                    <p className="font-medium">
                      {player.birth_date ? new Date(player.birth_date).toLocaleDateString('ar-SA') : 'غير متوفر'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الجنسية</p>
                    <p className="font-medium">{player.nationality || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المدينة</p>
                    <p className="font-medium">{player.city || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الدولة</p>
                    <p className="font-medium">{player.country || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الوضع الحالي</p>
                    <p className="font-medium">{player.currently_contracted === 'yes' ? 'متعاقد' : 'غير متعاقد'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">معلومات الاتصال</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">رقم الهاتف</p>
                    <p className="font-medium">{player.phone || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">واتساب</p>
                    <p className="font-medium">{player.whatsapp || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium">{player.email || 'غير متوفر'}</p>
                  </div>
                </div>
              </div>

              {/* Sports Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">المعلومات الرياضية</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">المركز الأساسي</p>
                    <p className="font-medium">{player.primary_position || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المركز الثانوي</p>
                    <p className="font-medium">{player.secondary_position || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">القدم المفضلة</p>
                    <p className="font-medium">{player.preferred_foot || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">سنوات الخبرة</p>
                    <p className="font-medium">{player.experience_years || 'غير متوفر'}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">المعلومات الطبية</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">فصيلة الدم</p>
                    <p className="font-medium">{player.blood_type || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الطول</p>
                    <p className="font-medium">{player.height ? `${player.height} سم` : 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الوزن</p>
                    <p className="font-medium">{player.weight ? `${player.weight} كجم` : 'غير متوفر'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">المهارات</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Technical Skills */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">المهارات الفنية</h3>
                  <div className="space-y-3">
                    {Object.entries(player.technical_skills || {}).map(([skill, value]) => (
                      <div key={skill}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill}</span>
                          <span className="text-sm text-gray-500">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Physical Skills */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">المهارات البدنية</h3>
                  <div className="space-y-3">
                    {Object.entries(player.physical_skills || {}).map(([skill, value]) => (
                      <div key={skill}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill}</span>
                          <span className="text-sm text-gray-500">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Skills */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">المهارات الاجتماعية</h3>
                  <div className="space-y-3">
                    {Object.entries(player.social_skills || {}).map(([skill, value]) => (
                      <div key={skill}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill}</span>
                          <span className="text-sm text-gray-500">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}