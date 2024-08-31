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
    message_to_critique: string[];

}


export function MinutesDisplay({ minutes }: { minutes: MeetingMinutes }) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{minutes.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Fecha:</strong> {minutes.date}</p>
        <h3 className="font-semibold mt-2">Asistentes:</h3>
        <ul>
  {minutes.attendees?.map((attendee, index) => (
    <li key={index}>
      {attendee.name !== "Information not provided" ? attendee.name : "N/A"} - 
      {attendee.position !== "Information not provided" ? attendee.position : "N/A"} 
      ({attendee.role !== "none" ? attendee.role : "N/A"})
    </li>
  ))}
</ul>
        <h3 className="font-semibold mt-2">Resumen:</h3>
        <p>{minutes.summary}</p>
        <h3 className="font-semibold mt-2">Puntos clave:</h3>
        {minutes.takeaways && minutes.takeaways.length > 0 && (
  <>
    <ul>
      {minutes.takeaways.map((takeaway, index) => (
        <li key={index}>{takeaway}</li>
      ))}
    </ul>
    <h3 className="font-semibold mt-2">Conclusiones:</h3>
  </>
)}

{minutes.conclusions && minutes.conclusions.length > 0 ? (
  <ul>
    {minutes.conclusions.map((conclusion, index) => (
      <li key={index}>{conclusion}</li>
    ))}
  </ul>
) : (
  <p>No hay conclusiones disponibles.</p>
)}

        <h3 className="font-semibold mt-2">Próxima reunión:</h3>
        {minutes.next_meeting && minutes.next_meeting.length > 0 ? (
  <ul>
    {minutes.next_meeting.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
) : (
  <p>No hay información disponible para la próxima reunión.</p>
)}

<h3 className="font-semibold mt-2">Tareas:</h3>
{minutes.tasks && minutes.tasks.length > 0 ? (
  <ul>
    {minutes.tasks.map((task, index) => (
      <li key={index}>
        {task.responsible} - {task.description} (Fecha: {task.date})
      </li>
    ))}
  </ul>
) : (
  <p>No hay tareas asignadas.</p>
)}

        <p className="mt-2"><strong>Mensaje adicional:</strong> {minutes.message_to_critique}</p>
      </CardContent>
    </Card>
  );
}
