import { BaseMessage } from "@langchain/core/messages";

// Definición del estado de la aplicación
export interface MinutesGraphState {
  audioFile: string;
  transcript: string;
  minutes: string;
  critique: string;
  outputFormatMeeting: string;
  approved: boolean;
  messages: BaseMessage[];
}

// Interfaces para el WriterAgent
export interface Attendee {
  name: string;
  position: string;
  role: string;
}

export interface Task {
  responsible: string;
  date: string;
  description: string;
}

export interface MinutesOutput {
  minutes: {
    title: string;
    date: string;
    attendees: Attendee[];
    summary: string;
    takeaways: string[];
    conclusions: string[];
    next_meeting: string[];
    tasks: Task[];
    message_to_critique: string[];
  };
}

export interface MinutesInput {
  transcript: string;
  wordCount: number;
  minutes?: string;
  critique?: string;
}

// Interfaces para el CritiqueAgent
export interface CritiqueInput {
  transcript: string;
  minutes: string;
}

export interface CritiqueOutput {
  critique: string;
}

// Tipo para el estado del grafo
export type GraphState = MinutesGraphState;

// Tipo para las funciones de nodo
export type NodeFunction = (state: GraphState) => Promise<GraphState> | GraphState;

// Tipo para la función condicional
export type ConditionalFunction = (state: GraphState) => string;

// Tipo para el hilo de ejecución
export interface ExecutionThread {
  configurable: {
    thread_id: string;
  };
}