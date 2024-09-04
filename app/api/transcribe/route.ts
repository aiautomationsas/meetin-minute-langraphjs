import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

const API_KEY = process.env.ASSEMBLYAI_API_KEY!
if (!API_KEY) {
  console.error("AssemblyAI API key is not set")
}

const client = new AssemblyAI({
  apiKey: API_KEY,
})


export async function POST(request: Request) {
  const { audioUrl, speakersExpected } = await request.json();

  const params = {
    audio: audioUrl,
    speech_model: "best" as any,
    speaker_labels: true,
    language_code: 'es',
    speakers_expected: speakersExpected,
  };

  try {
    const transcript = await client.transcripts.transcribe(params);

    if (transcript.status === 'error') {
      throw new Error(transcript.error);
    }

    const utterances = transcript.utterances?.map(utterance => ({
      speaker: utterance.speaker,
      text: utterance.text,
    })) || [];

    return NextResponse.json({ utterances });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}