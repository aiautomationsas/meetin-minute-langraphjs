'use client';

import { useState, FormEventHandler, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from '@/components/ui/slider';

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

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    setProgress(0);
    setUtterances([]);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl, speakersExpected }),
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setUtterances(data.utterances);

      // Combine all utterances into a single string and pass it to the parent component
      const fullTranscript = data.utterances.map((u: { speaker: any; text: any; }) => `${u.speaker}: ${u.text}`).join('\n');
      onTranscriptionComplete(fullTranscript);
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsTranscribing(false);
      setProgress(100);
    }
  };

  return (
    <Card>
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
        <Button onClick={handleTranscribe} disabled={isTranscribing}>
          {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
        </Button>
        {isTranscribing && <Progress value={progress} className="mt-2" />}
        {utterances.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Transcript:</h3>
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
