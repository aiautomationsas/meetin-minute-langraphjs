'use client'

import { useState } from 'react'
import { MinutesDisplay } from '@/components/MinutesDisplay'

// Actualizamos la definición de MinutesOutput
interface MinutesOutput {
  minutes: string;  // Ahora esperamos que 'minutes' sea una cadena JSON
}

export default function Home() {
  const [transcript, setTranscript] = useState('')
  const [minutesData, setMinutesData] = useState<string | null>(null);
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
      console.log("API Response:", data)
      if (response.ok) {
        // Asegúrate de que data.minutes es una cadena
        if (typeof data.minutes === 'string') {
          setMinutesData(data.minutes);
        } else {
          console.error('Unexpected minutes data format:', data.minutes);
          setMinutesData(JSON.stringify(data.minutes));
        }
      } else {
        console.error('Failed to generate minutes:', data)
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
      {minutesData && <MinutesDisplay minutesData={minutesData} />}
    </main>
  )
}