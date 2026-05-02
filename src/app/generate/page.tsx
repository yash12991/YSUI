import { GenerationForm } from '@/components/GenerationForm'

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <GenerationForm userId="test-user" />
    </div>
  )
}
