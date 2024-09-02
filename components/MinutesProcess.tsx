import React, { useState } from 'react';
import { MinutesForm } from './MinutesForm';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import '../styles/markdown-styles.css';

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

interface MeetingMinutes {
  title: string;
  date: string;
  attendees: Attendee[];
  summary: string;
  takeaways: string[];
  conclusions: string[];
  next_meeting: string[];
  tasks: Task[];
  message_to_critique: string;
}

export default function MinutesProcess() {
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [critique, setCritique] = useState<string>('');
  const [isLoadingRevise, setIsLoadingRevise] = useState<boolean>(false);
  const [isLoadingApprove, setIsLoadingApprove] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outputFormatMeeting, setOutputFormatMeeting] = useState<string>('');

  const handleMinutesGenerated = (newMinutes: MeetingMinutes, newCritique: string) => {
    setMinutes(newMinutes);
    setCritique(newCritique);
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
      setOutputFormatMeeting(data.outputFormatMeeting);
      setIsApproved(true);
    } catch (err) {
      console.error('Error approving minutes:', err);
      setError('Failed to approve minutes. Please try again.');
    } finally {
      setIsLoadingApprove(false);
    }
  };

  const handleDownloadPDF = async () => {
    // Load Montserrat font
    const fontRegular = await fetch('/fonts/Montserrat-Regular.ttf').then(res => res.arrayBuffer());
    const fontBold = await fetch('/fonts/Montserrat-Bold.ttf').then(res => res.arrayBuffer());
    const doc = new jsPDF();
    doc.addFileToVFS('Montserrat-Regular.ttf', fontRegular as unknown as string);
    doc.addFileToVFS('Montserrat-Bold.ttf', fontBold as unknown as string);
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');
    doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'bold');

    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    const bottomMargin = 20;

    // Helper function to add text and update yPos
    const addText = (text: string, fontSize: number, isBold: boolean = false, isListItem: boolean = false) => {
      doc.setFont('Montserrat', isBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      
      const lines = text.split('\n');
      lines.forEach((line, index) => {
        if (yPos > pageHeight - bottomMargin) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(line, isListItem ? margin + 10 : margin, yPos);
        yPos += fontSize * 0.5 + (isListItem ? 2 : (isBold ? 8 : 4));
      });
      
      if (!isListItem) yPos += 4; // Add extra space after non-list items
    };

    // Helper function to add a table
    const addTable = (head: string[], body: string[][]) => {
      const cellWidth = (maxWidth - margin) / head.length;
      const cellHeight = 10;
      const fontSize = 10;

      // Add header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos, maxWidth, cellHeight, 'F');
      doc.setFont('Montserrat', 'bold');
      doc.setFontSize(fontSize);
      head.forEach((text, index) => {
        doc.text(text, margin + index * cellWidth + 2, yPos + 7);
      });
      yPos += cellHeight;

      // Add body
      doc.setFont('Montserrat', 'normal');
      body.forEach(row => {
        if (yPos > pageHeight - bottomMargin - cellHeight) {
          doc.addPage();
          yPos = 20;
        }
        row.forEach((text, index) => {
          doc.text(text, margin + index * cellWidth + 2, yPos + 7);
        });
        yPos += cellHeight;
      });

      yPos += 10; // Add extra space after table
    };

    // Title
    addText('Acta Aprobada', 24, true);
    yPos += 5;
    // Date
    addText(`Fecha: ${minutes?.date ?? 'No especificada'}`, 12);
    yPos += 10;

    // Attendees
    addText('Asistentes', 18, true);
    if (minutes && minutes.attendees) {
      formatAttendees(minutes.attendees).split('\n').forEach(line => {
        addText(line, 12, false, true);
      });
    }
    yPos += 5;

    // Summary
    addText('Resumen', 18, true);
    addText(minutes?.summary ?? 'No se proporcionó resumen', 12);
    yPos += 5;

    // Key points
    addText('Puntos clave', 18, true);
    if (minutes && minutes.takeaways) {
      minutes.takeaways.forEach(takeaway => {
        addText(`• ${takeaway}`, 12, false, true);
      });
    }
    yPos += 5;

    // Conclusions
    addText('Conclusiones', 18, true);
    if (minutes && minutes.conclusions) {
      minutes.conclusions.forEach(conclusion => {
        addText(`• ${conclusion}`, 12, false, true);
      });
    }
    yPos += 5;

    // Next meeting
    addText('Próxima reunión', 18, true);
    if (minutes && minutes.next_meeting) {
      formatNextMeeting(minutes.next_meeting).split('\n').forEach(line => {
        addText(line, 12, false, true);
      });
    } else {
      addText('No se ha establecido la próxima reunión', 12, false, true);
    }
    yPos += 5;

    // Tasks
    addText('Tareas', 18, true);
    const tasks = minutes?.tasks?.map(task => [task.responsible, task.description, task.date]) ?? [];
    addTable(['Responsable', 'Descripción', 'Fecha'], tasks);

    doc.save('Acta_Aprobada.pdf');
  };

  const formatNextMeeting = (nextMeeting: any): string => {
    if (Array.isArray(nextMeeting)) {
      return nextMeeting.map(item => `- ${item}`).join('\n');
    } else if (typeof nextMeeting === 'string') {
      return nextMeeting;
    } else if (typeof nextMeeting === 'object' && nextMeeting !== null) {
      return Object.entries(nextMeeting)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
    } else {
      return 'No se ha establecido la próxima reunión';
    }
  };

  const formatAttendees = (attendees: Attendee[]): string => {
    return attendees.map(attendee => 
      `- ${attendee.name}${attendee.position !== "none" ? ` (${attendee.position})` : ""} - ${attendee.role}`
    ).join('\n');
  };

  if (!minutes) {
    return <MinutesForm onMinutesGenerated={handleMinutesGenerated} />;
  }

  if (isApproved) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Acta Aprobada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {`
# ${minutes.title}

**Fecha:** ${minutes.date}

## Asistentes
${formatAttendees(minutes.attendees)}

## Resumen
${minutes.summary}

## Puntos clave
${minutes.takeaways.map(takeaway => `- ${takeaway}`).join('\n')}

## Conclusiones
${minutes.conclusions.map(conclusion => `- ${conclusion}`).join('\n')}

## Próxima reunión
${formatNextMeeting(minutes.next_meeting)}

## Tareas
| Responsable | Descripción | Fecha |
|-------------|-------------|-------|
${minutes.tasks.map(task => `| ${task.responsible} | ${task.description} | ${task.date} |`).join('\n')}
              `}
            </ReactMarkdown>
          </div>
          <Button onClick={handleDownloadPDF} className="mt-4">
            Descargar PDF
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{minutes.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {`
# ${minutes.title}

**Fecha:** ${minutes.date}

## Asistentes
${formatAttendees(minutes.attendees)}

## Resumen
${minutes.summary}

## Puntos clave
${minutes.takeaways.map(takeaway => `- ${takeaway}`).join('\n')}

## Conclusiones
${minutes.conclusions.map(conclusion => `- ${conclusion}`).join('\n')}

## Próxima reunión
${formatNextMeeting(minutes.next_meeting)}

## Tareas
| Responsable | Descripción | Fecha |
|-------------|-------------|-------|
${minutes.tasks.map(task => `| ${task.responsible} | ${task.description} | ${task.date} |`).join('\n')}
              `}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

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
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}