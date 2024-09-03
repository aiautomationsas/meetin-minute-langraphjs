import React, { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AudioUploadProps {
  onUploadComplete: (url: string) => void;
}

export default function AudioUpload({ onUploadComplete }: AudioUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;

    const file = event.target.files[0];
    setIsUploading(true);
    setError(null);

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload'
      });

      console.log('Blob URL generada:', blob.url); // Registramos la URL del blob
      onUploadComplete(blob.url);
    } catch (err) {
      console.error('Error al subir el archivo:', err);
      setError('Error al subir el archivo. Por favor, inténtelo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Input
        type="file"
        accept="audio/*"
        onChange={handleUpload}
        disabled={isUploading}
        ref={inputFileRef}
      />
      {isUploading && <p>Subiendo archivo...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}