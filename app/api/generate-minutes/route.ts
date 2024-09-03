// src/app/api/generate-minutes/route.ts
import { NextResponse } from 'next/server'
import { app } from '@/lib/workflow'
import { MeetingMinutes, CritiqueOutput } from '@/types/meetingMinutes'

export async function POST(request: Request) {
  try {
    const { transcript, critique, minutes } = await request.json()

    let initialState = { 
      audioFile: "",
      transcript,
      minutes: minutes || "",
      critique: critique || "",
      outputFormatMeeting: "",
      approved: false,
      messages: [],
      currentNode: minutes && critique ? "revise_minutes" : "read_transcript"
    }

    const thread = { configurable: { thread_id: '42' } }

    const finalState = await app.invoke(initialState, thread);

    if (!finalState.minutes) {
      throw new Error('No minutes generated or revised');
    }

    let critiqueOutput: CritiqueOutput = { critique: '' };
    if (typeof finalState.critique === 'string') {
      critiqueOutput.critique = finalState.critique;
    } else if (finalState.critique && typeof finalState.critique.critique === 'string') {
      critiqueOutput = finalState.critique as CritiqueOutput;
    }

    return NextResponse.json({ 
      minutes: finalState.minutes as MeetingMinutes,
      critique: critiqueOutput,
      outputFormatMeeting: finalState.outputFormatMeeting
    })
    
  } catch (error) {
    console.error('Error generating or revising minutes:', error)
    return NextResponse.json({ 
      error: 'Failed to generate or revise minutes. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}