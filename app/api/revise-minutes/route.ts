import { NextResponse } from 'next/server';
import { app } from '@/lib/workflow';
import { MeetingMinutes } from '@/types/meetingMinutes';

export async function POST(request: Request) {
  try {
    const { minutes } = await request.json();

    if (!minutes || typeof minutes !== 'object') {
      return NextResponse.json({ error: 'Invalid minutes format' }, { status: 400 });
    }

    const initialState = { 
      audioFile: "",
      transcript: "",
      minutes: minutes as MeetingMinutes,
      critique: null,
      outputFormatMeeting: "",
      approved: false,
      messages: [],
      currentNode: "approve_minutes"
    };

    const thread = { configurable: { thread_id: '42' } };

    const finalState = await app.invoke(initialState, thread);

    console.log('Final state after approval:', finalState); // Para depuración

    if (finalState.approved !== true) {
      return NextResponse.json({ 
        error: 'Minutes were not approved',
        details: finalState.critique?.critique || 'No critique provided'
      }, { status: 400 });
    }

    if (!finalState.outputFormatMeeting || typeof finalState.outputFormatMeeting !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid output format for meeting minutes',
        details: `Received: ${JSON.stringify(finalState.outputFormatMeeting)}`
      }, { status: 500 });
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