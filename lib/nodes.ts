import { CritiqueAgent } from './CritiqueAgent';
import { MinutesGraphState } from './state';
import { WriterAgent } from './WriterAgent';

export function readTranscript(state: typeof MinutesGraphState.State): typeof MinutesGraphState.State {
  return { 
    ...state, 
  };
}

export async function createMinutes(state: typeof MinutesGraphState.State): Promise<typeof MinutesGraphState.State> {
  const writerAgent = new WriterAgent(process.env.FIREWORKS_API_KEY || '');

  let finalState;

  if (state.critique) {
    finalState = await writerAgent.revise({
      transcript: state.transcript,
      wordCount: 100,
      minutes: JSON.parse(state.minutes),
      critique: state.critique
    });
  } else {
    finalState = await writerAgent.write({
      transcript: state.transcript,
      wordCount: 100
    });
  }

  return { 
    ...state, 
    minutes: JSON.stringify(finalState.minutes)
  };
}

export async function createCritique(state: typeof MinutesGraphState.State): Promise<typeof MinutesGraphState.State> {
  const critiqueAgent = new CritiqueAgent(process.env.FIREWORKS_API_KEY || '');
  const finalState = await critiqueAgent.createCritique({
    transcript: state.transcript,
    minutes: state.minutes,
  });
  return { 
    ...state, 
    critique: finalState.critique
  };
}

export async function reviseMinutes(state: typeof MinutesGraphState.State): Promise<typeof MinutesGraphState.State> {
  const writerAgent = new WriterAgent(process.env.FIREWORKS_API_KEY || '');
  const finalState = await writerAgent.revise({
    transcript: state.transcript,
    wordCount: 100,
    minutes: JSON.parse(state.minutes),
    critique: state.critique
  });

  return { 
    ...state, 
    minutes: JSON.stringify(finalState.minutes),
    approved: false
  };
}

export function approveMinutes(state: typeof MinutesGraphState.State): typeof MinutesGraphState.State {
  return { 
    ...state, 
    approved: true
  };
}

export function outputMeeting(state: typeof MinutesGraphState.State): typeof MinutesGraphState.State {
  const minutes = JSON.parse(state.minutes);
  const markdown = `
# ${minutes.title}

**Fecha:** ${minutes.date}

## Asistentes

| **Nombre** | **Posición** | **Rol** |
|------------|--------------|---------|
${minutes.attendees.map((attendee: { name: any; position: any; role: any; }) => `| ${attendee.name} | ${attendee.position} | ${attendee.role} |`).join('\n')}

## Resumen

${minutes.summary}

## Puntos clave

${minutes.takeaways.map((takeaway: any) => `- ${takeaway}`).join('\n')}

## Conclusiones

${minutes.conclusions.map((conclusion: any) => `- ${conclusion}`).join('\n')}

## Próxima reunión

${Array.isArray(minutes.next_meeting) 
  ? minutes.next_meeting.map((item: any) => `- ${item}`).join('\n')
  : typeof minutes.next_meeting === 'string'
    ? minutes.next_meeting
    : 'No se ha establecido la próxima reunión'}

## Tareas

| **Responsable** | **Descripción** | **Fecha** |
|-----------------|-----------------|-----------|
${minutes.tasks.map((task: { responsible: any; description: any; date: any; }) => `| ${task.responsible} | ${task.description} | ${task.date} |`).join('\n')}
  `;

  return { 
    ...state, 
    outputFormatMeeting: markdown 
  };
}