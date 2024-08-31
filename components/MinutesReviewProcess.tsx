import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ReloadIcon, CheckIcon, Pencil1Icon } from "@radix-ui/react-icons"
import { Label } from "@/components/ui/label"

interface CritiqueProps {
  critique: string;
  onCritiqueChange: (newCritique: string) => void;
  onRevise: () => void;
  onApprove: () => void;
  isLoading: boolean;
  error: string | null;
}

export function CritiqueSection({ critique, onCritiqueChange, onRevise, onApprove, isLoading, error }: CritiqueProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto mt-8 shadow-lg border-t-4 border-blue-500">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Revisión y Crítica</CardTitle>
        <CardDescription>
          Revise el acta y proporcione su crítica o comentarios para mejorarla
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="critique">Crítica</Label>
          <Textarea
            id="critique"
            value={critique}
            onChange={(e) => onCritiqueChange(e.target.value)}
            rows={5}
            placeholder="Ingrese su crítica o comentarios aquí..."
            className="w-full resize-none border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <Button 
            onClick={onRevise} 
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Revisando...
              </>
            ) : (
              <>
                <Pencil1Icon className="mr-2 h-5 w-5" />
                Revisar Acta
              </>
            )}
          </Button>
          <Button 
            onClick={onApprove} 
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-50 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            <CheckIcon className="mr-2 h-5 w-5" />
            Aprobar Acta
          </Button>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}