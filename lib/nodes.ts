import { CritiqueAgent } from './CritiqueAgent';
import { MinutesGraphState } from './state';
import { WriterAgent } from './WriterAgent'; // Asegúrate de importar la clase desde el archivo correcto

export function readTranscript(state: typeof MinutesGraphState.State): typeof MinutesGraphState.State {
  return { 
    ...state, 
  };
}

export async function createMinutes(state: typeof MinutesGraphState.State): Promise<typeof MinutesGraphState.State> {
  const writerAgent = new WriterAgent(process.env.FIREWORKS_API_KEY || '');

  let finalState;

  if (state.critique) {
    // Si hay una crítica, se revisan las actas existentes
    finalState = await writerAgent.revise({
      transcript: state.transcript,
      wordCount: 100,
      minutes: JSON.parse(state.minutes), // Convert string to MinutesOutput object
      critique: state.critique
    });
  } else {
    // Si no hay crítica, se generan nuevas actas a partir de la transcripción
    finalState = await writerAgent.write({
      transcript: state.transcript,
      wordCount: 100
    });
  }

  return { 
    ...state, 
    minutes: JSON.stringify(finalState.minutes) // Convert MinutesOutput back to string
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

export function approveMinutes(state: typeof MinutesGraphState.State): typeof MinutesGraphState.State {
  return { 
    ...state, 
    approved: true
  };
}

export function outputMeeting(state: typeof MinutesGraphState.State): typeof MinutesGraphState.State {
  return { 
    ...state, 
    outputFormatMeeting: "Final Minutes en markdown with minutes and critique" 
  };
}