'use client';

import DashboardLayout from "@/components/layout/DashboardLayout.jsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Briefcase,
  Building,
  Camera, Eye,
  Filter,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Star,
  User,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

// أنواع البيانات
interface SearchResult {
  id: string;
  name: string;
  type: 'club' | 'agent' | 'marketer' | 'trainer';
  image: string;
  location: string;
  rating: number;
  followers: number;
  specialization?: string;
  description: string;
  verified: boolean;
  isFollowing: boolean;
  achievements?: string[];
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // جلب بيانات وهمية
  useEffect(() => {
    // محاكاة عملية جلب البيانات من الخادم
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          name: 'النادي الأهلي',
          type: 'club',
          image: '/clubs/ahly.jpg',
          location: 'القاهرة، مصر',
          rating: 4.9,
          followers: 5480000,
          description: 'نادي القرن في أفريقيا، أحد أكبر الأندية في العالم العربي والقارة الأفريقية.',
          verified: true,
          isFollowing: true,
          achievements: ['دوري أبطال أفريقيا (10 مرات)', 'الدوري المصري (42 مرة)', 'كأس العالم للأندية (برونزية)'],
          contactInfo: {
            email: 'info@alahly.com',
            phone: '+20223456789',
            website: 'www.alahly.com'
          }
        },
        {
          id: '2',
          name: 'نادي الزمالك',
          type: 'club',
          image: '/clubs/zamalek.jpg',
          location: 'القاهرة، مصر',
          rating: 4.7,
          followers: 3210000,
          description: 'القلعة البيضاء، أحد أعرق الأندية في مصر وأفريقيا مع تاريخ حافل بالإنجازات.',
          verified: true,
          isFollowing: false,
          achievements: ['دوري أبطال أفريقيا (5 مرات)', 'الدوري المصري (14 مرة)', 'كأس مصر (27 مرة)'],
          contactInfo: {
            email: 'info@zamalek.com',
            phone: '+20223456788',
            website: 'www.zamalek.com'
          }
        },
        {
          id: '3',
          name: 'وكالة النجوم',
          type: 'agent',
          image: '/agents/stars.jpg',
          location: 'دبي، الإمارات',
          rating: 4.8,
          followers: 89000,
          specialization: 'لاعبي كرة القدم المحترفين',
          description: 'وكالة رائدة في مجال إدارة أعمال اللاعبين المحترفين في الشرق الأوسط والخليج.',
          verified: true,
          isFollowing: false,
          contactInfo: {
            email: 'contact@stars-agency.com',
            phone: '+97145678901',
            website: 'www.stars-agency.com'
          }
        },
        {
          id: '4',
          name: 'محمد رضوان',
          type: 'agent',
          image: '/agents/mohamed.jpg',
          location: 'الرياض، السعودية',
          rating: 4.5,
          followers: 45000,
          specialization: 'المواهب الشابة',
          description: 'وكيل لاعبين معتمد من الفيفا متخصص في اكتشاف ورعاية المواهب الشابة في الخليج.',
          verified: true,
          isFollowing: false,
          contactInfo: {
            email: 'mohamed@sports-agent.com',
            phone: '+966567890123'
          }
        },
        {
          id: '5',
          name: 'شركة سبورت ماركتينج',
          type: 'marketer',
          image: '/marketers/sportmarketing.jpg',
          location: 'القاهرة، مصر',
          rating: 4.6,
          followers: 120000,
          specialization: 'التسويق الرياضي وإدارة العلامات التجارية',
          description: 'شركة متخصصة في تسويق الرياضيين والأندية وإدارة العلامات التجارية للاعبين.',
          verified: true,
          isFollowing: true,
          contactInfo: {
            email: 'contact@sportmarketing.com',
            phone: '+20223456700',
            website: 'www.sportmarketing.com'
          }
        },
        {
          id: '6',
          name: 'أكاديمية المستقبل',
          type: 'trainer',
          image: '/trainers/future.jpg',
          location: 'الإسكندرية، مصر',
          rating: 4.7,
          followers: 67000,
          specialization: 'تدريب الناشئين',
          description: 'أكاديمية متخصصة في تدريب وتطوير مهارات لاعبي كرة القدم الناشئين.',
          verified: false,
          isFollowing: false,
          contactInfo: {
            email: 'info@future-academy.com',
            phone: '+20401234567',
            website: 'www.future-academy.com'
          }
        },
        {
          id: '7',
          name: 'الكابتن حسام حسن',
          type: 'trainer',
          image: '/trainers/hossam.jpg',
          location: 'القاهرة، مصر',
          rating: 4.9,
          followers: 980000,
          specialization: 'تدريب المهاجمين',
          description: 'مدرب محترف ولاعب سابق، متخصص في تطوير مهارات المهاجمين وتسجيل الأهداف.',
          verified: true,
          isFollowing: true,
          contactInfo: {
            email: 'hossam@coach.com',
            phone: '+20123456789'
          }
        },
        {
          id: '8',
          name: 'نادي الهلال',
          type: 'club',
          image: '/clubs/hilal.jpg',
          location: 'الرياض، السعودية',
          rating: 4.8,
          followers: 4250000,
          description: 'نادي الهلال السعودي، أحد أكبر الأندية في آسيا والعالم العربي.',
          verified: true,
          isFollowing: false,
          achievements: ['دوري أبطال آسيا (4 مرات)', 'الدوري السعودي (18 مرة)'],
          contactInfo: {
            email: 'info@alhilal.com',
            phone: '+966123456789',
            website: 'www.alhilal.com'
          }
        },
      ];

      setSearchResults(mockResults);
      setIsLoading(false);
    }, 1500);
  }, []);

  // تصفية النتائج بناءً على البحث والتبويب النشط والمرشحات
  const filteredResults = searchResults.filter(result => {
    // تصفية حسب النص المدخل
    const matchesSearch = searchQuery === '' ||
      result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase());

    // تصفية حسب نوع الكيان
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'clubs' && result.type === 'club') ||
      (activeTab === 'agents' && result.type === 'agent') ||
      (activeTab === 'marketers' && result.type === 'marketer') ||
      (activeTab === 'trainers' && result.type === 'trainer');

    // تصفية حسب الموقع
    const matchesLocation = filterLocation === '' ||
      result.location.toLowerCase().includes(filterLocation.toLowerCase());

    // تصفية حسب التقييم
    const matchesRating = filterRating === 0 || result.rating >= filterRating;

    return matchesSearch && matchesTab && matchesLocation && matchesRating;
  });

  // متابعة أو إلغاء متابعة
  const toggleFollow = (id: string) => {
    setSearchResults(prevResults =>
      prevResults.map(result =>
        result.id === id
          ? { ...result, isFollowing: !result.isFollowing }
          : result
      )
    );
  };

  // فتح نافذة المراسلة
  const sendMessage = (id: string) => {
    // سيتم تنفيذ هذه الوظيفة لاحقًا مع ربط النظام برسائل المستخدم
    alert(`سيتم فتح نافذة المراسلة للكيان رقم ${id}`);
  };

  // تخصيص العلامة بناءً على نوع الكيان
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'club': return { label: 'نادي', color: 'bg-blue-100 text-blue-800' };
      case 'agent': return { label: 'وكيل لاعبين', color: 'bg-purple-100 text-purple-800' };
      case 'marketer': return { label: 'مسوق', color: 'bg-green-100 text-green-800' };
      case 'trainer': return { label: 'مدرب', color: 'bg-orange-100 text-orange-800' };
      default: return { label: type, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // تنسيق عدد المتابعين
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <DashboardLayout>
      <div className="mt-8 mb-24">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold">البحث عن الأندية والوكلاء والمسوقين والمدربين</h1>
          <div className="relative w-full md:w-96">
            <Input
              type="text"
              placeholder="ابحث عن اسم النادي، الوكيل، المدرب..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
            />
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-auto grid-cols-5">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="clubs">الأندية</TabsTrigger>
              <TabsTrigger value="agents">الوكلاء</TabsTrigger>
              <TabsTrigger value="marketers">المسوقين</TabsTrigger>
              <TabsTrigger value="trainers">المدربين</TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              المرشحات
            </Button>
          </div>

          {showFilters && (
            <Card className="p-4 mb-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-right">المدينة / الدولة</label>
                  <Input
                    type="text"
                    placeholder="مثال: مصر، الرياض"
                    value={filterLocation}
                    onChange={e => setFilterLocation(e.target.value)}
                    className="text-right"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-right">الحد الأدنى للتقييم</label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {[0, 3, 3.5, 4, 4.5].map(rating => (
                      <Button
                        key={rating}
                        variant={filterRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterRating(rating)}
                        className="flex items-center gap-1"
                      >
                        {rating > 0 ? (
                          <>
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            {rating}+
                          </>
                        ) : 'الكل'}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredResults.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Search size={48} className="text-gray-300" />
                  <h3 className="text-xl font-bold">لا توجد نتائج</h3>
                  <p className="text-gray-500">لم نتمكن من العثور على نتائج مطابقة لبحثك. يرجى تجربة كلمات بحث أخرى أو تغيير المرشحات.</p>
                </div>
              </Card>
            ) : (
              filteredResults.map(result => (
                <Card key={result.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-48 bg-gray-100 md:h-auto md:w-60">
                      {result.image ? (
                        <div
                          className="w-full h-full bg-center bg-cover"
                          style={{ backgroundImage: `url(${result.image})` }}
                        ></div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          {result.type === 'club' ? <Building size={48} className="text-gray-400" /> :
                           result.type === 'agent' ? <Briefcase size={48} className="text-gray-400" /> :
                           result.type === 'marketer' ? <Camera size={48} className="text-gray-400" /> :
                           <User size={48} className="text-gray-400" />}
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getTypeLabel(result.type).color}`}>
                        {getTypeLabel(result.type).label}
                        {result.verified && (
                          <span className="inline-block ml-1 bg-blue-500 text-white rounded-full p-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex flex-col items-start justify-between mb-3 md:flex-row md:items-center">
                        <h3 className="text-xl font-bold">{result.name}</h3>
                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                          <Button
                            variant={result.isFollowing ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleFollow(result.id)}
                            className="flex items-center gap-1"
                          >
                            {result.isFollowing ? (
                              <>
                                <UserCheck size={16} />
                                متابَع
                              </>
                            ) : (
                              <>
                                <UserPlus size={16} />
                                متابعة
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendMessage(result.id)}
                            className="flex items-center gap-1"
                          >
                            <MessageSquare size={16} />
                            رسالة
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin size={14} />
                          <span>{result.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span>{result.rating} ({Math.floor(result.followers / 1000)} تقييم)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users size={14} />
                          <span>{formatFollowers(result.followers)} متابع</span>
                        </div>
                        {result.specialization && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Award size={14} />
                            <span>{result.specialization}</span>
                          </div>
                        )}
                      </div>

                      <p className="mb-4 text-gray-600">{result.description}</p>

                      {result.achievements && result.achievements.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {result.achievements.map((achievement, index) => (
                              <span key={index} className="px-2 py-1 text-xs text-blue-700 rounded-full bg-blue-50">
                                {achievement}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm">
                        <a href={`mailto:${result.contactInfo.email}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                          <Mail size={14} />
                          {result.contactInfo.email}
                        </a>
                        <a href={`tel:${result.contactInfo.phone}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                          <Phone size={14} />
                          {result.contactInfo.phone}
                        </a>
                        {result.contactInfo.website && (
                          <a href={`https://${result.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                            <Eye size={14} />
                            {result.contactInfo.website}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}