import { CritiqueAgent } from './CritiqueAgent';
import { WriterAgent } from './WriterAgent';
import { MinutesGraphState } from './state';
import { MeetingMinutes, CritiqueOutput } from '../types/meetingMinutes';

const getApiKey = () => process.env.FIREWORKS_API_KEY || '';

export function readTranscript(state: typeof MinutesGraphState.State): typeof MinutesGraphState.State {
  return { ...state };
}

export async function createMinutes(state: typeof MinutesGraphState.State): Promise<typeof MinutesGraphState.State> {
  const writerAgent = new WriterAgent(getApiKey());
  const { transcript, critique } = state;

  const minutesOutput = await (critique
    ? writerAgent.revise({ transcript, wordCount: 100, minutes: state.minutes, critique })
    : writerAgent.write({ transcript, wordCount: 100 }));

  return { ...state, minutes: validateMinutes(minutesOutput.minutes) };
}

export async function createCritique(state: typeof MinutesGraphState.State): Promise<typeof MinutesGraphState.State> {
  const critiqueAgent = new CritiqueAgent(getApiKey());
  const { transcript, minutes } = state;
  const critique = await critiqueAgent.createCritique({ transcript, minutes });
  return { ...state, critique };
}

export async function reviseMinutes(state: typeof MinutesGraphState.State): Promise<typeof MinutesGraphState.State> {
  const writerAgent = new WriterAgent(getApiKey());
  const { transcript, minutes, critique } = state;
  const revisedMinutesOutput = await writerAgent.revise({ transcript, wordCount: 100, minutes, critique });

  return { ...state, minutes: validateMinutes(revisedMinutesOutput.minutes), approved: false };
}

export function approveMinutes(state: typeof MinutesGraphState.State): typeof MinutesGraphState.State {
  return { ...state, approved: true };
}

export function outputMeeting(state: typeof MinutesGraphState.State): typeof MinutesGraphState.State {
  return { ...state, outputFormatMeeting: generateMarkdown(state.minutes) };
}

function validateMinutes(minutes: MeetingMinutes): MeetingMinutes {
  return {
    ...minutes,
    message_to_critique: Array.isArray(minutes.message_to_critique)
      ? minutes.message_to_critique.join(' ')
      : minutes.message_to_critique
  };
}

function generateMarkdown(minutes: MeetingMinutes): string {
  return `
# ${minutes.title}

**Fecha:** ${minutes.date}

## Asistentes

${generateAttendeeTable(minutes.attendees)}

## Resumen

${minutes.summary}

## Puntos clave

${generateBulletList(minutes.takeaways)}

## Conclusiones

${generateBulletList(minutes.conclusions)}

## Próxima reunión

${generateBulletList(minutes.next_meeting)}

## Tareas

${generateTaskTable(minutes.tasks)}
  `;
}

function generateAttendeeTable(attendees: Array<{ name: string; position: string; role: string }>): string {
  return `
| **Nombre** | **Posición** | **Rol** |
|------------|--------------|---------|
${attendees.map(attendee => `| ${attendee.name} | ${attendee.position} | ${attendee.role} |`).join('\n')}
  `;
}

function generateBulletList(items: string[]): string {
  return items.map(item => `- ${item}`).join('\n');
}

function generateTaskTable(tasks: Array<{ responsible: string; description: string; date: string }>): string {
  return `
| **Responsable** | **Descripción** | **Fecha** |
|-----------------|-----------------|-----------|
${tasks.map(task => `| ${task.responsible} | ${task.description} | ${task.date} |`).join('\n')}
  `;
}