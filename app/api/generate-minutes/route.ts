// src/app/api/generate-minutes/route.ts
import { NextResponse } from 'next/server'
import { app } from '@/lib/workflow'

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 })
    }

    const initialState = { 
      audioFile: "",
      transcript,
      minutes: "",
      critique: "",
      outputFormatMeeting: "",
      approved: false,
      messages: []
    }

    const thread = { configurable: { thread_id: '42' } }

    const finalState = await app.invoke(initialState, thread)
    console.log("fianlState:", finalState.minutes)

    if (!finalState.minutes) {
      throw new Error('No minutes generated')
    }

    console.log("Generated critique:", finalState.critique);  // Add this line for debugging

    return NextResponse.json({ 
      minutes: finalState.minutes,
      critique: finalState.critique
    })
  } catch (error) {
    console.error('Error generating minutes:', error)
    return NextResponse.json({ 
      error: 'Failed to generate minutes. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}