import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export function MinutesDisplay({ minutesData }: { minutesData: string }) {
  const minutes: MeetingMinutes = JSON.parse(minutesData);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{minutes.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Fecha:</strong> {minutes.date}</p>
        
        <h3 className="font-semibold mt-2">Asistentes:</h3>
        <ul>
          {minutes.attendees.map((attendee, index) => (
            <li key={index}>
              {attendee.name} {attendee.position !== "none" ? `- ${attendee.position}` : ""} ({attendee.role})
            </li>
          ))}
        </ul>

        <h3 className="font-semibold mt-2">Resumen:</h3>
        <p>{minutes.summary}</p>

        <h3 className="font-semibold mt-2">Puntos clave:</h3>
        <ul>
          {minutes.takeaways.map((takeaway, index) => (
            <li key={index}>{takeaway}</li>
          ))}
        </ul>

        <h3 className="font-semibold mt-2">Conclusiones:</h3>
        <ul>
          {minutes.conclusions.map((conclusion, index) => (
            <li key={index}>{conclusion}</li>
          ))}
        </ul>

        <h3 className="font-semibold mt-2">Próxima reunión:</h3>
        <ul>
          {minutes.next_meeting.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h3 className="font-semibold mt-2">Tareas:</h3>
        <ul>
          {minutes.tasks.map((task, index) => (
            <li key={index}>
              {task.responsible} - {task.description} (Fecha: {task.date})
            </li>
          ))}
        </ul>

        <p className="mt-2"><strong>Mensaje adicional:</strong> {minutes.message_to_critique !== "Information not provided" ? minutes.message_to_critique : "No hay mensaje adicional."}</p>
      </CardContent>
    </Card>
  );
}