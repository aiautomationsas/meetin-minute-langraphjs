import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AudioUpload from './AudioUpload';

interface TranscriptionInputProps {
  onTranscriptionComplete: (transcript: string) => void;
}

export default function TranscriptionInput({ onTranscriptionComplete }: TranscriptionInputProps) {
  const [transcriptText, setTranscriptText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextSubmit = () => {
    onTranscriptionComplete(transcriptText);
  };

  const handleAudioUploadComplete = async (audioUrl: string) => {
    console.log('Audio URL recibida:', audioUrl);
    setIsTranscribing(true);
    setError(null);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio_url: audioUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Transcripción completada:', data.text);
      onTranscriptionComplete(data.text);
    } catch (error) {
      console.error('Error al transcribir:', error);
      setError(`Error al transcribir: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingrese la Transcripción</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text">
          <TabsList>
            <TabsTrigger value="text">Texto</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <Textarea
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Ingrese la transcripción aquí..."
              rows={10}
            />
            <Button onClick={handleTextSubmit} className="mt-4">Enviar Transcripción</Button>
          </TabsContent>
          <TabsContent value="audio">
            <AudioUpload onUploadComplete={handleAudioUploadComplete} />
            {isTranscribing && <p>Transcribiendo audio...</p>}
            {error && <p className="text-red-500">{error}</p>}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}