import React, { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AudioUpload({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);

    if (!inputFileRef.current?.files) {
      console.error("No file selected");
      setIsUploading(false);
      return;
    }

    const file = inputFileRef.current.files[0];

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      onUploadComplete(newBlob.url);
    } catch (error) {
      console.error('Upload failed:', error);
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
      <Button type="submit" disabled={isUploading} className="w-full">
        {isUploading ? 'Subiendo...' : 'Subir Audio'}
      </Button>
    </form>
  );
}