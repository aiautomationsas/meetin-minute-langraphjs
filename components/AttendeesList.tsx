import React from 'react';
import { Attendee } from '../types/meetingMinutes';

interface AttendeesListProps {
  attendees: Attendee[];
}

export const AttendeesList: React.FC<AttendeesListProps> = ({ attendees }) => (
  <div>
    <h4 className="text-lg font-semibold mb-2">Asistentes:</h4>
    <ul className="list-disc pl-5">
      {attendees.map((attendee, index) => (
        <li key={index}>
          {attendee.name} - {attendee.position} ({attendee.role})
        </li>
      ))}
    </ul>
  </div>
);