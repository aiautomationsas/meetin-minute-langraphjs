import React, { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AudioUpload({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setError(null);

    if (!inputFileRef.current?.files?.[0]) {
      setError("No se ha seleccionado ningún archivo");
      setIsUploading(false);
      return;
    }

    const file = inputFileRef.current.files[0];

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',  // Asegúrate de que esta ruta sea correcta
      });

      console.log('Archivo subido:', newBlob);
      onUploadComplete(newBlob.url);
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      setError('Error al subir el archivo. Por favor, inténtelo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const triggerFileInput = () => {
    inputFileRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept="audio/mp3,audio/mp4,audio/ogg,audio/wav,audio/m4a,audio/aac"
          onChange={handleFileChange}
          className="hidden"
          ref={inputFileRef}
        />
        <Button type="button" onClick={triggerFileInput} variant="outline" className="w-full">
          Seleccionar archivo de audio
        </Button>
      </div>
      {fileName && (
        <p className="text-sm text-gray-500">Archivo seleccionado: {fileName}</p>
      )}
      <Button type="submit" disabled={isUploading || !fileName} className="w-full">
        {isUploading ? 'Subiendo...' : 'Subir Audio'}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}