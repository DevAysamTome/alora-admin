import { NextResponse } from 'next/server';

let products = [
  { id: '1', name: 'منتج 1', price: 50 },
  { id: '2', name: 'منتج 2', price: 150 },
];

export async function GET() {
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const data = await request.json();
  products.push({ id: String(products.length + 1), ...data });
  return NextResponse.json({ message: 'تم إضافة المنتج بنجاح' }, { status: 201 });
}
