import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TranscriptionInput from './TranscriptionInput';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ApprovedMinutes } from './ApprovedMinutes';
import { MinutesGraphState } from '@/lib/state';
import { MeetingMinutes, CritiqueOutput } from '@/types/meetingMinutes';

export default function MinutesProcess() {
  const [state, setState] = useState<typeof MinutesGraphState.State>({
    audioFile: "",
    transcript: "",
    minutes: {} as MeetingMinutes,
    critique: {} as CritiqueOutput,
    outputFormatMeeting: "",
    approved: false,
    currentNode: "",
    messages: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscriptionComplete = async (transcript: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setState(prevState => ({
        ...prevState,
        transcript,
        minutes: data.minutes,
        critique: data.critique,
      }));
    } catch (err) {
      console.error('Error generating minutes:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate minutes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevise = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: state.minutes?.summary || '',
          critique: state.critique,
          minutes: state.minutes
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setState(prevState => ({
        ...prevState,
        minutes: data.minutes,
        critique: data.critique,
      }));
    } catch (err) {
      console.error('Error revising minutes:', err);
      setError(err instanceof Error ? err.message : 'Failed to revise minutes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/approve-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: state.minutes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
      setState(prevState => ({
        ...prevState,
        approved: true,
        outputFormatMeeting: data.outputFormatMeeting,
      }));
    } catch (err) {
      console.error('Error approving minutes:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve minutes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMarkdown = (minutes: MeetingMinutes) => `
  # ${minutes.title || 'Sin título'}
  **Fecha:** ${minutes.date || 'Fecha no especificada'}
  ## Asistentes
  ${minutes.attendees?.map(a => `- ${a.name || 'Sin nombre'} (${a.position || 'Sin posición'}, ${a.role || 'Sin rol'})`).join('\n') || 'No hay asistentes registrados'}
  ## Resumen
  ${minutes.summary || 'No hay resumen disponible'}
  ## Puntos clave
  ${minutes.takeaways?.map(t => `- ${t}`).join('\n') || 'No hay puntos clave registrados'}
  ## Conclusiones
  ${minutes.conclusions?.map(c => `- ${c}`).join('\n') || 'No hay conclusiones registradas'}
  ## Próxima reunión
  ${Array.isArray(minutes.next_meeting) ? minutes.next_meeting.map(m => `- ${m}`).join('\n') : minutes.next_meeting || 'No hay información sobre la próxima reunión'}
  ## Tareas
  ${minutes.tasks?.map(t => `- ${t.responsible || 'Sin responsable'}: ${t.description || 'Sin descripción'} (${t.date || 'Sin fecha'})`).join('\n') || 'No hay tareas registradas'}
`;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 space-y-8">
      {!state.approved && <TranscriptionInput onTranscriptionComplete={handleTranscriptionComplete} />}

      {isLoading && <p>Procesando...</p>}

      {state.minutes && !state.approved && (
        <Card>
          <CardHeader>
            <CardTitle>Acta Generada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generateMarkdown(state.minutes)}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {state.minutes && !state.approved && (
        <Card>
          <CardHeader>
            <CardTitle>Crítica</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={state.critique?.critique || ''}
              onChange={(e) => setState(prevState => ({
                ...prevState,
                critique: { critique: e.target.value }
              }))}
              rows={5}
              placeholder="Ingrese su crítica aquí..."
              className="w-full mb-4"
            />
            <div className="flex justify-end space-x-4">
              <Button onClick={handleRevise} disabled={isLoading}>
                {isLoading ? 'Revisando...' : 'Revisar Acta'}
              </Button>
              <Button onClick={handleApprove} variant="outline" disabled={isLoading}>
                {isLoading ? 'Aprobando...' : 'Aprobar Acta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {state.approved && state.outputFormatMeeting && (
        <ApprovedMinutes markdown={state.outputFormatMeeting} />
      )}
    </div>
  );
}