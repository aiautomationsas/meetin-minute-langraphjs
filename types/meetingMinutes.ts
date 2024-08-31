// types/meetingMinutes.ts

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
  
  export interface MeetingMinutes {
    title: string;
    date: string;
    attendees: Attendee[];
    summary: string;
    takeaways: string[];
    conclusions: string[];
    next_meeting: string[];
    tasks: Task[];
    message_to_critique: string;  // Cambiado de string[] a string
  }
  
  export interface MinutesOutput {
    minutes: MeetingMinutes;
  }