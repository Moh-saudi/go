export async function POST(request) {
  return new Response(JSON.stringify({ error: 'خدمة رفع الملفات معطلة حالياً' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
}