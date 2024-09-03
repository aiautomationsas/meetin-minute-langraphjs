// src/app/api/generate-minutes/route.ts
import { NextResponse } from 'next/server'
import { app } from '@/lib/workflow'

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

    return NextResponse.json({ 
      minutes: finalState.minutes,
      critique: finalState.critique.critique, // Asegúrate de acceder a la propiedad 'critique'
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