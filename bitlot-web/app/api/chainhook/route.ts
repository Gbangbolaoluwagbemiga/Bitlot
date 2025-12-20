import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Chainhook event received:', JSON.stringify(body, null, 2));
    
    // Process the event
    // In a real app, store this in DB or push to clients
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing chainhook:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
