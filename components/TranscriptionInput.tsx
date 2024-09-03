import React, { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AudioUpload from './AudioUpload';

interface TranscriptionInputProps {
  onTranscriptionComplete: (transcript: string) => void;
}

export default function TranscriptionInput({ onTranscriptionComplete }: TranscriptionInputProps) {
  const [transcriptText, setTranscriptText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [speakersExpected, setSpeakersExpected] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = () => {
    onTranscriptionComplete(transcriptText);
  };

  const handleAudioUploadComplete = async (audioUrl: string) => {
    console.log('URL del blob recibida en TranscriptionInput:', audioUrl);
    setIsTranscribing(true);
    setError(null);
  
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          audioUrl: audioUrl,
          speakersExpected: speakersExpected
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json();
      console.log('Respuesta de la transcripción:', data);
      
      if (data.utterances && data.utterances.length > 0) {
        const fullTranscript = data.utterances.map((u: any) => `${u.speaker}: ${u.text}`).join('\n');
        onTranscriptionComplete(fullTranscript);
      } else {
        throw new Error('No se recibieron utterances en la respuesta');
      }
    } catch (error) {
      console.error('Error al transcribir:', error);
      setError(`Error al transcribir: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setTranscriptText(text);
          onTranscriptionComplete(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
            <TabsTrigger value="file">Archivo</TabsTrigger>
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
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="speakers-expected">Número de hablantes esperados:</Label>
                <Input
                  id="speakers-expected"
                  type="number"
                  value={speakersExpected}
                  onChange={(e) => setSpeakersExpected(Number(e.target.value))}
                  min={1}
                  max={10}
                  className="w-20"
                />
              </div>
              <AudioUpload onUploadComplete={handleAudioUploadComplete} />
              {isTranscribing && <p>Transcribiendo audio...</p>}
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </TabsContent>
          <TabsContent value="file">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button onClick={triggerFileInput} variant="outline" className="w-full">
                  Seleccionar archivo de texto
                </Button>
              </div>
              {fileName && (
                <p className="text-sm text-gray-500">Archivo seleccionado: {fileName}</p>
              )}
              {transcriptText && (
                <Button onClick={() => onTranscriptionComplete(transcriptText)} className="w-full">
                  Usar Transcripción del Archivo
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}