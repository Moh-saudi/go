import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('بدء جلب بيانات اللاعب...');

    // التحقق من تسجيل الدخول
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('لم يتم العثور على جلسة مستخدم');
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    console.log('البريد الإلكتروني للمستخدم:', session.user.email);

    // جلب بيانات اللاعب من Firestore
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('email', '==', session.user.email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('لم يتم العثور على بيانات اللاعب');
      return NextResponse.json({ error: 'لم يتم العثور على بيانات اللاعب' }, { status: 404 });
    }

    const playerDoc = querySnapshot.docs[0];
    const playerData = playerDoc.data();
    console.log('تم العثور على بيانات اللاعب:', playerData);

    // تحويل التواريخ
    const processedData = {
      ...playerData,
      id: playerDoc.id,
      birth_date: playerData.birth_date?.toDate?.() || null,
      contract_start_date: playerData.contract_start_date?.toDate?.() || null,
      contract_end_date: playerData.contract_end_date?.toDate?.() || null,
      medical_history: playerData.medical_history || [],
      images: playerData.images || [],
      videos: playerData.videos || [],
      technical_skills: playerData.technical_skills || {},
      physical_skills: playerData.physical_skills || {},
      social_skills: playerData.social_skills || {},
    };

    console.log('تم معالجة البيانات بنجاح');
    return NextResponse.json(processedData);
  } catch (error) {
    console.error('خطأ في جلب بيانات اللاعب:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات اللاعب' },
      { status: 500 }
    );
  }
}