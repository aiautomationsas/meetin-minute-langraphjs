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
    return NextResponse.json({ transcriptionId: transcript.id });
  } catch (error) {
    console.error('Error al iniciar la transcripción:', error);
    return NextResponse.json({ error: 'Error al iniciar la transcripción' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID de transcripción no proporcionado' }, { status: 400 });
  }

  try {
    const transcript = await client.transcripts.get(id);

    if (transcript.status === 'completed') {
      const utterances = transcript.utterances?.map(utterance => ({
        speaker: utterance.speaker,
        text: utterance.text,
      })) || [];

      return NextResponse.json({ status: 'completed', utterances });
    } else if (transcript.status === 'error') {
      return NextResponse.json({ status: 'error', error: transcript.error });
    } else {
      return NextResponse.json({ 
        status: 'in_progress', 
        progress: 'percent_complete' in transcript ? transcript.percent_complete : 0 
      });
    }
  } catch (error) {
    console.error('Error al verificar el estado de la transcripción:', error);
    return NextResponse.json({ error: 'Error al verificar el estado de la transcripción' }, { status: 500 });
  }
}