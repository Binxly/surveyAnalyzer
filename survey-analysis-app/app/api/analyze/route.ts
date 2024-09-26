import { NextRequest, NextResponse } from 'next/server';
import { processCSV } from '@/app/lib/analyze';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const results = await processCSV(buffer);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error processing survey:', error);
    return NextResponse.json({ error: 'An error occurred while processing the survey' }, { status: 500 });
  }
}
