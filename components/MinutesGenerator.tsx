'use client';

import { FormEvent, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface Attendee {
  name: string;
  position: string;
  role: string;
}

interface Task {
  responsible: string;
  date: string;
  description: string;
}

interface MinutesOutput {
  minutes: {
    title: string;
    date: string;
    attendees: Attendee[];
    summary: string;
    takeaways: string[];
    conclusions: string[];
    next_meeting: string[];
    tasks: Task[];
    message_to_critique: string[];
  };
}

export default function MinutesGenerator({ transcript }: { transcript: string }) {
  const [wordCount, setWordCount] = useState<number>(100);
  const [minutes, setMinutes] = useState<MinutesOutput | null>(null);
  const [reflection, setReflection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMinutes = async (existingReflection: string = '') => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = {
        transcript,
        wordCount,
        minutes,
        reflection: existingReflection
      };
      const jsonData = JSON.stringify(data);
      const response = await fetch('/api/generate-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonData
      });

      const responseData = await response.json();
      if (!response.ok) {
        if (response.status === 400) {
          setError('Error de validación. Por favor, revise los datos ingresados.');
        } else if (response.status === 500) {
          setError('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.');
        } else {
          setError('Error desconocido. Por favor, inténtelo de nuevo.');
        }
      } else {
        setMinutes(responseData.minutes);
        setReflection(responseData.reflection);
      }
    } catch (error) {
      if (error instanceof TypeError) {
        setError('Error de tipo. Por favor, revise los datos ingresados.');
      } else if (error instanceof RangeError) {
        setError('Error de rango. Por favor, revise los datos ingresados.');
      } else {
        setError('Error desconocido. Por favor, inténtelo de nuevo.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateNewMinutes = () => {
    generateMinutes(reflection);
  };

  const renderList = (items: string[] | undefined) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <p>No items available.</p>;
    }
    return (
      <ul className="list-disc pl-5">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generador de Acta de Reunión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="wordCount">Número de palabras del acta: {wordCount}</Label>
          <Slider
            id="wordCount"
            min={100}
            max={2000}
            step={50}
            value={[wordCount]}
            onValueChange={(value) => setWordCount(value[0])}
            className="mt-2"
          />
        </div>
        <Button onClick={() => generateMinutes()} disabled={isGenerating}>
          {isGenerating ? 'Generando...' : 'Generar Acta'}
        </Button>

        {error && <p className="text-red-500 mt-2" role="alert">{error}</p>}

        {minutes && (
          <div className="mt-6 space-y-4">
            <h3 className="text-2xl font-bold">{minutes.minutes.title || 'Acta de Reunión'}</h3>
            <p className="text-sm text-gray-500">Fecha: {minutes.minutes.date || 'No especificada'}</p>

            <div>
              <h4 className="text-lg font-semibold mb-2">Asistentes:</h4>
              {Array.isArray(minutes.minutes.attendees) && minutes.minutes.attendees.length > 0 ? (
                <ul className="list-disc pl-5">
                  {minutes.minutes.attendees.map((attendee, index) => (
                    <li key={index}>
                      {attendee.name || 'Nombre no especificado'} -
                      {attendee.position || 'Posición no especificada'}
                      ({attendee.role || 'Rol no especificado'})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No se especificaron asistentes.</p>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Resumen:</h4>
              <p className="whitespace-pre-line">{minutes.minutes.summary || 'No se proporcionó resumen.'}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Puntos Clave:</h4>
              {renderList(minutes.minutes.takeaways)}
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Conclusiones:</h4>
              {renderList(minutes.minutes.conclusions)}
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Próxima Reunión:</h4>
              {renderList(minutes.minutes.next_meeting)}
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Tareas:</h4>
              {Array.isArray(minutes.minutes.tasks) && minutes.minutes.tasks.length > 0 ? (
                <ul className="list-disc pl-5">
                  {minutes.minutes.tasks.map((task, index) => (
                    <li key={index}>
                      <strong>{task.responsible || 'Responsable no especificado'}</strong> -
                      {task.description || 'Descripción no especificada'}
                      (Fecha: {task.date || 'No especificada'})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No se especificaron tareas.</p>
              )}
            </div>

            <p className="italic text-gray-600">{minutes.minutes.message_to_critique || 'No se proporcionó mensaje adicional.'}</p>
          </div>
        )}

        {minutes && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Crítica y Sugerencias:</h3>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Edita la crítica y sugerencias aquí..."
              className="mt-2 h-40"
            />
            <Button onClick={handleGenerateNewMinutes} disabled={isGenerating} className="mt-2">
              {isGenerating ? 'Generando...' : 'Generar Nueva Acta'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
