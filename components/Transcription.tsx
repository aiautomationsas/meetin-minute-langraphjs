'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Utterance {
  speaker: string;
  text: string;
}

interface TranscriptionProps {
  audioUrl: string;
  onTranscriptionComplete: (transcript: string) => void;
}

export default function Transcription({ audioUrl, onTranscriptionComplete }: TranscriptionProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [progress, setProgress] = useState(0);
  const [speakersExpected, setSpeakersExpected] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);

  const startTranscription = async () => {
    setIsTranscribing(true);
    setProgress(0);
    setUtterances([]);
    setError(null);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl, speakersExpected }),
      });

      if (!response.ok) {
        throw new Error(`Error al iniciar la transcripción: ${response.statusText}`);
      }

      const data = await response.json();
      setTranscriptionId(data.transcriptionId);
    } catch (error) {
      console.error('Error al iniciar la transcripción:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al iniciar la transcripción');
      setIsTranscribing(false);
    }
  };

  const checkTranscriptionStatus = async () => {
    if (!transcriptionId) return;

    try {
      const response = await fetch(`/api/transcribe-status?id=${transcriptionId}`);
      if (!response.ok) {
        throw new Error(`Error al verificar el estado de la transcripción: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'completed') {
        setUtterances(data.utterances);
        setIsTranscribing(false);
        setProgress(100);
        const fullTranscript = data.utterances.map((u: Utterance) => `${u.speaker}: ${u.text}`).join('\n');
        onTranscriptionComplete(fullTranscript);
      } else if (data.status === 'in_progress') {
        setProgress(data.progress || progress);
      } else if (data.status === 'error') {
        throw new Error(data.error || 'Error desconocido en la transcripción');
      }
    } catch (error) {
      console.error('Error al verificar el estado de la transcripción:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al verificar el estado de la transcripción');
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTranscribing && transcriptionId) {
      interval = setInterval(checkTranscriptionStatus, 5000); // Verifica cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [isTranscribing, transcriptionId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcripción</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="mb-4">
          <Label htmlFor="speakers">Número esperado de hablantes: {speakersExpected}</Label>
          <Slider
            id="speakers"
            min={1}
            max={10}
            step={1}
            value={[speakersExpected]}
            onValueChange={(value) => setSpeakersExpected(value[0])}
            className="mt-1"
          />
        </div>
        <Button onClick={startTranscription} disabled={isTranscribing}>
          {isTranscribing ? 'Transcribiendo...' : 'Iniciar Transcripción'}
        </Button>
        {isTranscribing && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-center mt-2">Transcribiendo... Por favor, espere.</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {utterances.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Transcripción:</h3>
            {utterances.map((utterance, index) => (
              <div key={index} className="mb-2">
                <span className="font-semibold">{utterance.speaker}: </span>
                <span>{utterance.text}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
