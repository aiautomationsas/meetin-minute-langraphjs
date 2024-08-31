'use client'

import { useState } from 'react'
import { MinutesForm } from '@/components/MinutesForm'
import { MinutesDisplay } from '@/components/MinutesDisplay'

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

interface MinutesOutput {
  minutes: MeetingMinutes;
}

export default function Home() {
  const [transcript, setTranscript] = useState('')
  const [minutes, setMinutes] = useState<MinutesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      })
      const data: MinutesOutput = await response.json()
      console.log("data minutes2",data)
      if (response.ok) {
        setMinutes(data)
      } else {
        console.error('Failed to generate minutes:')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Meeting Minutes Generator</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border rounded"
          rows={10}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Enter meeting transcript here..."
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Minutes'}
        </button>
      </form>
      {minutes && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Generated Minutes:</h2>
          <pre className="mt-2 p-2 bg-gray-100 rounded">
            <MinutesDisplay minutes={minutes.minutes} />
          </pre>
        </div>
      )}
    </main>
  )
}