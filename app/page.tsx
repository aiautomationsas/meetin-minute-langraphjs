'use client'
import MinutesProcess from '@/components/MinutesProcess'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Proceso de Generación y Revisión de Actas</h1>
      <MinutesProcess />
    </main>
  )
}