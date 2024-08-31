import React, { useState } from 'react';
import { MinutesForm } from './MinutesForm';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isApproved, setIsApproved] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleMinutesGenerated = (newMinutes: MeetingMinutes, newCritique: string) => {
        setMinutes(newMinutes);
        setCritique(newCritique);
    };

    const handleRevise = async () => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const handleApprove = () => {
        setIsApproved(true);
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
                    <p>El acta ha sido aprobada y finalizada.</p>
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
                    <p><strong>Fecha:</strong> {minutes.date}</p>

                    <h3 className="font-semibold mt-4">Asistentes:</h3>
                    <ul>
                        {minutes.attendees.map((attendee, index) => (
                            <li key={index}>
                                {attendee.name} {attendee.position !== "none" ? `- ${attendee.position}` : ""} ({attendee.role})
                            </li>
                        ))}
                    </ul>

                    <h3 className="font-semibold mt-4">Resumen:</h3>
                    <p>{minutes.summary}</p>

                    <h3 className="font-semibold mt-4">Puntos clave:</h3>
                    <ul>
                        {minutes.takeaways.map((takeaway, index) => (
                            <li key={index}>{takeaway}</li>
                        ))}
                    </ul>

                    <h3 className="font-semibold mt-4">Conclusiones:</h3>
                    <ul>
                        {minutes.conclusions.map((conclusion, index) => (
                            <li key={index}>{conclusion}</li>
                        ))}
                    </ul>

                    <h3 className="font-semibold mt-4">Próxima reunión:</h3>
                    <ul>
                        {minutes.next_meeting.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>

                    <h3 className="font-semibold mt-4">Tareas:</h3>
                    <ul>
                        {minutes.tasks.map((task, index) => (
                            <li key={index}>
                                {task.responsible} - {task.description} (Fecha: {task.date})
                            </li>
                        ))}
                    </ul>
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
                        <Button onClick={handleRevise} disabled={isLoading}>
                            {isLoading ? 'Revisando...' : 'Revisar Acta'}
                        </Button>
                        <Button onClick={handleApprove} variant="outline">
                            Aprobar Acta
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