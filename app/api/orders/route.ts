import { NextResponse } from 'next/server';

// هنا مثال باستخدام مصفوفة داخلية؛ في التطبيق الحقيقي قم بالتواصل مع Firebase
let orders = [
  { id: '1', customer: 'عميل 1', total: 100 },
  { id: '2', customer: 'عميل 2', total: 200 },
];

export async function GET() {
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const data = await request.json();
  orders.push({ id: String(orders.length + 1), ...data });
  return NextResponse.json({ message: 'تم إضافة الطلب بنجاح' }, { status: 201 });
}

// يمكن إضافة PUT, DELETE وغيرها حسب الحاجة
