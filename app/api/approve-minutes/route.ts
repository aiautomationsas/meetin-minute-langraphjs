import { NextResponse } from 'next/server';
import { app } from '@/lib/workflow';

export async function POST(request: Request) {
  try {
    const { minutes } = await request.json();

    if (!minutes) {
      return NextResponse.json({ error: 'Minutes are required' }, { status: 400 });
    }

    const initialState = { 
      audioFile: "",
      transcript: "",
      minutes,
      critique: "",
      outputFormatMeeting: "",
      approved: false,
      messages: [],
      currentNode: "approve_minutes"
    };

    const thread = { configurable: { thread_id: '42' } };

    const finalState = await app.invoke(initialState, thread);

    if (!finalState.approved) {
      throw new Error('Minutes approval failed');
    }

    return NextResponse.json({ 
      message: 'Minutes approved successfully',
      outputFormatMeeting: finalState.outputFormatMeeting
    });
  } catch (error) {
    console.error('Error approving minutes:', error);
    return NextResponse.json({ 
      error: 'Failed to approve minutes. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}