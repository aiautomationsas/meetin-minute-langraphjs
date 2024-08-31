import React from 'react';
import { Task } from '../types/meetingMinutes';

interface TasksListProps {
  tasks: Task[];
}

export const TasksList: React.FC<TasksListProps> = ({ tasks }) => (
  <div>
    <h4 className="text-lg font-semibold mb-2">Tareas:</h4>
    <ul className="list-disc pl-5">
      {tasks.map((task, index) => (
        <li key={index}>
          <strong>{task.responsible}</strong> - {task.description} (Fecha: {task.date})
        </li>
      ))}
    </ul>
  </div>
);