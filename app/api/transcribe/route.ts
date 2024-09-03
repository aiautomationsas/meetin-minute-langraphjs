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
  try {
    const { audioUrl, speakersExpected } = await request.json();

    if (!audioUrl) {
      return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
    }

    console.log('Iniciando transcripción para:', audioUrl);

    const params = {
      audio: audioUrl,
      speech_model: "best" as any,
      speaker_labels: true,
      language_code: 'es',
      speakers_expected: speakersExpected,
    };

    const transcript = await client.transcripts.transcribe(params);

    if (transcript.status === 'error') {
      console.error('Error en la transcripción:', transcript.error);
      throw new Error(transcript.error);
    }

    if (!transcript.utterances || transcript.utterances.length === 0) {
      console.error('No se generaron utterances');
      throw new Error('No se generaron utterances');
    }

    const utterances = transcript.utterances.map(utterance => ({
      speaker: utterance.speaker,
      text: utterance.text,
    }));

    console.log('Transcripción completada con éxito');
    return NextResponse.json({ utterances });
  } catch (error) {
    console.error('Error detallado en la transcripción:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Transcription failed' }, { status: 500 });
  }
}