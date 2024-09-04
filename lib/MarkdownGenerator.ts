import { MeetingMinutes } from '../types/meetingMinutes';

export class MarkdownGenerator {
  generate(minutes: MeetingMinutes): string {
    return `
# ${minutes.title}

**Fecha:** ${minutes.date}

## Asistentes

${this.generateAttendeeTable(minutes.attendees)}

## Resumen

${minutes.summary}

## Puntos clave

${this.generateBulletList(minutes.takeaways)}

## Conclusiones

${this.generateBulletList(minutes.conclusions)}

## Próxima reunión

${this.generateBulletList(minutes.next_meeting)}

## Tareas

${this.generateTaskTable(minutes.tasks)}
    `;
  }

  private generateAttendeeTable(attendees: Array<{ name: string; position: string; role: string }>): string {
    return `
| **Nombre** | **Posición** | **Rol** |
|------------|--------------|---------|
${attendees.map(attendee => `| ${attendee.name} | ${attendee.position} | ${attendee.role} |`).join('\n')}
    `.trim();
  }

  private generateBulletList(items: string[]): string {
    return items.map(item => `- ${item}`).join('\n');
  }

  private generateTaskTable(tasks: Array<{ responsible: string; description: string; date: string }>): string {
    return `
| **Responsable** | **Descripción** | **Fecha** |
|-----------------|-----------------|-----------|
${tasks.map(task => `| ${task.responsible} | ${task.description} | ${task.date} |`).join('\n')}
    `.trim();
  }
}