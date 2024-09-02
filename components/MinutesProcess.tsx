import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TranscriptionInput from './TranscriptionInput';
import { MeetingMinutes } from '@/types/meetingMinutes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ApprovedMinutes } from './ApprovedMinutes';

export default function MinutesProcess() {
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [critique, setCritique] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingRevise, setIsLoadingRevise] = useState(false);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [approvedMinutes, setApprovedMinutes] = useState<string | null>(null);

  const handleTranscriptionComplete = async (transcript: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMinutes(JSON.parse(data.minutes));
      setCritique(data.critique);
    } catch (err) {
      console.error('Error generating minutes:', err);
      setError('Failed to generate minutes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevise = async () => {
    setIsLoadingRevise(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: JSON.stringify(minutes?.summary),
          critique: critique,
          minutes: JSON.stringify(minutes)
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMinutes(JSON.parse(data.minutes));
      setCritique(data.critique);
    } catch (err) {
      console.error('Error revising minutes:', err);
      setError('Failed to revise minutes. Please try again.');
    } finally {
      setIsLoadingRevise(false);
    }
  };

  const handleApprove = async () => {
    setIsLoadingApprove(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/approve-minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minutes: JSON.stringify(minutes) }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Minutes approved:', data);
      // Generar el Markdown aprobado
      const approvedMarkdown = generateMarkdown(minutes!);
      setApprovedMinutes(approvedMarkdown);
      setSuccessMessage('Acta aprobada con éxito');
    } catch (err) {
      console.error('Error approving minutes:', err);
      setError('Failed to approve minutes. Please try again.');
    } finally {
      setIsLoadingApprove(false);
    }
  };

  const generateMarkdown = (minutes: MeetingMinutes) => `
# ${minutes.title}

**Fecha:** ${minutes.date}

## Asistentes

| Nombre | Posición | Rol |
|--------|----------|-----|
${minutes.attendees.map(attendee => `| ${attendee.name} | ${attendee.position} | ${attendee.role} |`).join('\n')}

## Resumen

${minutes.summary}

## Puntos clave

${minutes.takeaways.map(takeaway => `- ${takeaway}`).join('\n')}

## Conclusiones

${minutes.conclusions.map(conclusion => `- ${conclusion}`).join('\n')}

## Próxima reunión

${Array.isArray(minutes.next_meeting) 
  ? minutes.next_meeting.map(item => `- ${item}`).join('\n')
  : minutes.next_meeting}

## Tareas

| Responsable | Descripción | Fecha |
|-------------|-------------|-------|
${minutes.tasks.map(task => `| ${task.responsible} | ${task.description} | ${task.date} |`).join('\n')}
  `;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 space-y-8">
      {!approvedMinutes && (
        <TranscriptionInput onTranscriptionComplete={handleTranscriptionComplete} />
      )}

      {isLoading && <p>Generando actas...</p>}

      {minutes && !approvedMinutes && (
        <Card>
          <CardHeader>
            <CardTitle>Acta Generada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generateMarkdown(minutes)}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {minutes && !approvedMinutes && (
        <Card>
          <CardHeader>
            <CardTitle>Crítica</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={critique}
              onChange={(e) => setCritique(e.target.value)}
              rows={5}
              placeholder="Ingrese su crítica aquí..."
              className="w-full mb-4"
            />
            <div className="flex justify-end space-x-4">
              <Button onClick={handleRevise} disabled={isLoadingRevise}>
                {isLoadingRevise ? 'Revisando...' : 'Revisar Acta'}
              </Button>
              <Button onClick={handleApprove} variant="outline" disabled={isLoadingApprove}>
                {isLoadingApprove ? 'Aprobando...' : 'Aprobar Acta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {successMessage && (
        <Alert variant="default">
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {approvedMinutes && (
        <ApprovedMinutes markdown={approvedMinutes} />
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}