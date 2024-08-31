// src/app/api/update-critique/route.ts
import { NextResponse } from 'next/server'
import { app } from '@/lib/workflow'

export async function POST(request: Request) {
  try {
    const { transcript, critique } = await request.json()

    if (!transcript || !critique) {
      return NextResponse.json({ error: 'Transcript and critique are required' }, { status: 400 })
    }

    const initialState = { 
      audioFile: "",
      transcript,
      minutes: "",
      critique,
      outputFormatMeeting: "",
      approved: false,
      messages: []
    }

    const thread = { configurable: { thread_id: '42' } }

    const finalState = await app.invoke(initialState, thread)

    if (!finalState.minutes) {
      throw new Error('No minutes generated')
    }

    return NextResponse.json({ 
      minutes: finalState.minutes,
      critique: finalState.critique
    })
  } catch (error) {
    console.error('Error updating critique:', error)
    return NextResponse.json({ 
      error: 'Failed to update critique. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}