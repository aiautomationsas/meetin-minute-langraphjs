import React, { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import AudioUpload from './AudioUpload';

interface TranscriptionInputProps {
  onTranscriptionComplete: (transcript: string) => void;
}

export default function TranscriptionInput({ onTranscriptionComplete }: TranscriptionInputProps) {
  const [transcriptText, setTranscriptText] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = () => {
    onTranscriptionComplete(transcriptText);
  };

  const handleAudioUploadComplete = async (audioUrl: string) => {
    // Lógica existente para manejar la transcripción de audio
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
        <CardDescription>Elija cómo desea ingresar la transcripción</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Texto</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="file">Archivo</TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ingrese el texto de la transcripción</h3>
              <Textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Ingrese la transcripción aquí..."
                rows={10}
              />
              <Button onClick={handleTextSubmit} className="w-full">Enviar Transcripción</Button>
            </div>
          </TabsContent>
          <TabsContent value="audio">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sube un archivo de audio</h3>
              <AudioUpload onUploadComplete={handleAudioUploadComplete} />
            </div>
          </TabsContent>
          <TabsContent value="file">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sube un archivo de texto</h3>
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