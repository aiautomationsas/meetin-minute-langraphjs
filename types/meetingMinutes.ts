// Tipos básicos
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

// Tipos principales
export interface MeetingMinutes {
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

export interface MinutesInput {
  transcript: string;
  wordCount?: number;
  critique?: CritiqueOutput;
  minutes?: MeetingMinutes;
}

export interface MinutesOutput {
  minutes?: MeetingMinutes;
  critique?: string;
}

// Tipos para la crítica
export interface CritiqueInput {
  transcript: string;
  minutes: MeetingMinutes; // Cambiado de string a MeetingMinutes
}

export interface CritiqueOutput {
  critique: string;
}