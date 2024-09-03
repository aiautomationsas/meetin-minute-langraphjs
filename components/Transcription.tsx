'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

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

  const handleTranscribe = async () => {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      setUtterances(data.utterances);

      const fullTranscript = data.utterances.map((u: Utterance) => `${u.speaker}: ${u.text}`).join('\n');
      onTranscriptionComplete(fullTranscript);
    } catch (error) {
      console.error('Transcription error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsTranscribing(false);
      setProgress(100);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Transcription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="speakers">Expected Number of Speakers: {speakersExpected}</Label>
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
        <Button 
          onClick={handleTranscribe} 
          disabled={isTranscribing} 
          className="w-full mb-4"
        >
          {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
        </Button>
        {isTranscribing && <Progress value={progress} className="mb-4" />}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {utterances.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Transcript:</h3>
            {utterances.map((utterance, index) => (
              <div key={index} className="mb-2 p-2 bg-gray-100 rounded-md">
                <span className="font-semibold text-blue-600">{utterance.speaker}: </span>
                <span>{utterance.text}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}