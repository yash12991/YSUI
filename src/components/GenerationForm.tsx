'use client'

import { useState } from 'react'
import {
  PROJECT_TEMPLATES,
  TECH_STACK_PRESETS,
  FEATURE_DESCRIPTIONS,
  type ProjectType,
  type ProjectFeature,
} from '@/lib/generation'

interface GenerationFormProps {
  userId?: string
  onSuccess?: (projectId: string) => void
}

export function GenerationForm({ userId, onSuccess }: GenerationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  // Form state
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('website')
  const [selectedPreset, setSelectedPreset] = useState<string>('nextjs_postgresql')
  const [selectedFeatures, setSelectedFeatures] = useState<ProjectFeature[]>([])
  const [pages, setPages] = useState<string[]>(['/', '/about', '/contact'])

  const techStack = TECH_STACK_PRESETS[selectedPreset as keyof typeof TECH_STACK_PRESETS]

  const handleFeatureToggle = (feature: ProjectFeature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    )
  }

  const handleTemplateSelect = (key: keyof typeof PROJECT_TEMPLATES) => {
    const template = PROJECT_TEMPLATES[key]
    if (template) {
      setProjectType(template.type)
      setSelectedFeatures([...template.features] as ProjectFeature[])
      setPages(template.pages)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setDownloadUrl(null)

    if (!projectName || !description) {
      setError('Please fill in all required fields')
      return
    }

    if (selectedFeatures.length === 0) {
      setError('Please select at least one feature')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || 'anonymous',
        },
        body: JSON.stringify({
          projectName,
          projectType,
          description,
          techStack,
          features: selectedFeatures,
          pages: pages.filter((p) => p.trim()),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await response.json()
      const nextDownloadUrl = data.generation?.downloadUrl || data.project?.downloadUrl
      setSuccess(`Website generated. Project ID: ${data.project.id}`)
      setDownloadUrl(nextDownloadUrl || null)
      onSuccess?.(data.project.id)

      // Reset form
      setProjectName('')
      setDescription('')
      setSelectedFeatures([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">🎨 Generate Your Website</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Basics */}
        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Project Basics</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., My E-commerce Store"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your website does..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Project Type / Templates */}
        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Project Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(PROJECT_TEMPLATES).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  handleTemplateSelect(type as keyof typeof PROJECT_TEMPLATES)
                }
                className={`p-3 rounded-lg text-sm font-medium transition ${
                  projectType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {type.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(TECH_STACK_PRESETS).map(([preset, stack]) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSelectedPreset(preset)}
                className={`p-4 rounded-lg text-sm font-medium transition border ${
                  selectedPreset === preset
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="font-semibold mb-2">
                  {preset.replace('_', ' ').toUpperCase()}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Frontend: {stack.frontend}</div>
                  <div>Backend: {stack.backend}</div>
                  <div>DB: {stack.database}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Current selection display */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Selected:</strong> {techStack.frontend} • {techStack.backend} •{' '}
              {techStack.database} • {techStack.hosting}
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(
              Object.keys(
                FEATURE_DESCRIPTIONS
              ) as (keyof typeof FEATURE_DESCRIPTIONS)[]
            ).map((feature) => (
              <label key={feature} className="flex items-start p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="mt-1 mr-3 w-4 h-4 rounded accent-blue-500"
                />
                <div>
                  <div className="font-medium text-sm">{feature}</div>
                  <div className="text-xs text-gray-500">
                    {FEATURE_DESCRIPTIONS[feature]}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Pages */}
        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Pages</h2>
          <div className="space-y-2">
            {pages.map((page, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={page}
                  onChange={(e) => {
                    const newPages = [...pages]
                    newPages[idx] = e.target.value
                    setPages(newPages)
                  }}
                  placeholder="/page-name"
                  className="flex-1 px-4 py-2 border rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setPages(pages.filter((_, i) => i !== idx))}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPages([...pages, '/'])}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              + Add Page
            </button>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <div>{success}</div>
            {downloadUrl && (
              <a
                href={downloadUrl}
                className="inline-flex mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
              >
                Download ZIP
              </a>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
        >
          {loading ? '⏳ Generating...' : '🚀 Generate Website'}
        </button>
      </form>

      {/* Stats */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Project will include:</strong>
          <br />
          • {selectedFeatures.length} features
          <br />
          • ~{15 + (pages?.length || 0) * 2} components
          <br />
          • ~{selectedFeatures.includes('api') ? 20 : 5} API endpoints
          <br />
          • Ready for deployment to {techStack.hosting}
        </p>
      </div>
    </div>
  )
}
