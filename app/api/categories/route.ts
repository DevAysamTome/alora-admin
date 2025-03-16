import { NextResponse } from 'next/server';

let categories = [
  { id: '1', name: 'صنف 1' },
  { id: '2', name: 'صنف 2' },
];

export async function GET() {
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const data = await request.json();
  categories.push({ id: String(categories.length + 1), ...data });
  return NextResponse.json({ message: 'تم إضافة الصنف بنجاح' }, { status: 201 });
}
