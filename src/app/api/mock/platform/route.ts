import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory store for simulation events (Reset on server restart)
// In production, you'd use a database, but for a simulator this is fine.
let receivedEvents: any[] = [];

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const headers = Object.fromEntries(request.headers.entries());
    
    const event = {
      id: crypto.randomUUID(),
      receivedAt: new Date().toISOString(),
      payload,
      headers,
      signature: headers['x-vyapaarsetu-signature'],
      eventType: headers['x-vyapaarsetu-event']
    };

    receivedEvents.unshift(event);
    
    // Keep only last 50
    if (receivedEvents.length > 50) receivedEvents = receivedEvents.slice(0, 50);

    console.log(`[MOCK PLATFORM] Received ${event.eventType} event`);

    return NextResponse.json({ 
        success: true, 
        message: 'Mock marketplace received the update',
        acknowledgmentId: event.id
    });

  } catch (error) {
    console.error('[MOCK PLATFORM ERROR]', error);
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }
}

export async function GET() {
    return NextResponse.json({ success: true, events: receivedEvents });
}

export async function DELETE() {
    receivedEvents = [];
    return NextResponse.json({ success: true, message: 'Logs cleared' });
}
