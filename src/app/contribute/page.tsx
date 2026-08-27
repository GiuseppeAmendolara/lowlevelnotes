'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthPageShell from '@/components/auth/AuthPageShell'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthTextArea from '@/components/auth/AuthTextArea'
import AuthSelect from '@/components/auth/AuthSelect'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import { useSession } from '@/components/SessionProvider'
import {
  getMyRoleRequests,
  submitRoleRequest,
  getMyResourceRequests,
  submitResourceRequest,
  type RoleRequest,
  type ResourceRequest,
} from '@/lib/authClient'

const RESOURCE_TYPES = [
  { value: 'pdf', label: 'File (PDF, doc, etc.)' },
  { value: 'website', label: 'Website' },
  { value: 'videos', label: 'Videos' },
  { value: 'git', label: 'Git repository' },
]

export default function ContributePage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  if (sessionLoading || !user) {
    return (
      <AuthPageShell eyebrow="Contribute" heading="Contribute">
        <p className="text-sm text-[#A1A1AA]">Loading…</p>
      </AuthPageShell>
    )
  }

  return user.role === 'student'
    ? <RoleRequestPanel />
    : <ResourceRequestPanel />
}

function RoleRequestPanel() {
  const [requests, setRequests] = useState<RoleRequest[] | null>(null)
  const [requestedRole, setRequestedRole] = useState<'contributor' | 'instructor'>('contributor')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    getMyRoleRequests().then((result) => {
      if (result.ok) setRequests(result.data)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = await submitRoleRequest(requestedRole, message)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setDone(true)
  }

  if (requests === null) {
    return (
      <AuthPageShell eyebrow="Contribute" heading="Contribute">
        <p className="text-sm text-[#A1A1AA]">Loading…</p>
      </AuthPageShell>
    )
  }

  const pending = requests.find((r) => r.status === 'pending')
  const latest = requests[0]

  if (pending) {
    return (
      <AuthPageShell eyebrow="Contribute" heading="Request pending">
        <p className="text-sm leading-6 text-[#A1A1AA]">
          Your request to become a {pending.requestedRole} is waiting on review.
        </p>
        <AuthMessage message="Pending — you'll be able to submit resources once this is approved." />
      </AuthPageShell>
    )
  }

  if (done) {
    return (
      <AuthPageShell eyebrow="Contribute" heading="Request sent">
        <AuthMessage message="Your request has been submitted for review." tone="success" />
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell
      eyebrow="Contribute"
      heading="Request access"
      subtext="Contributors and instructors can submit resources for the library. Every submission is reviewed before it goes live."
    >
      {latest?.status === 'rejected' && (
        <AuthMessage
          message={latest.rejectionReason ? `Your last request was declined: ${latest.rejectionReason}` : 'Your last request was declined.'}
        />
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <AuthSelect
          label="Role"
          value={requestedRole}
          onChange={(v) => setRequestedRole(v as 'contributor' | 'instructor')}
          options={[
            { value: 'contributor', label: 'Contributor' },
            { value: 'instructor', label: 'Instructor' },
          ]}
        />
        <AuthTextArea label="Why do you want access?" value={message} onChange={setMessage} required />

        {error && <AuthMessage message={error} />}

        <AuthSubmitButton loading={submitting}>Submit request</AuthSubmitButton>
      </form>
    </AuthPageShell>
  )
}

function ResourceRequestPanel() {
  const [requests, setRequests] = useState<ResourceRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'pdf' | 'website' | 'videos' | 'git'>('website')
  const [category, setCategory] = useState('')
  const [mode, setMode] = useState<'link' | 'file'>('link')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function loadRequests() {
    setLoadingRequests(true)
    getMyResourceRequests().then((result) => {
      if (result.ok) setRequests(result.data)
      setLoadingRequests(false)
    })
  }

  useEffect(loadRequests, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (mode === 'link' && !url.trim()) {
      setError('Provide a link.')
      return
    }
    if (mode === 'file' && !file) {
      setError('Choose a file.')
      return
    }

    setSubmitting(true)
    const result = await submitResourceRequest({
      title,
      description,
      type,
      category,
      url: mode === 'link' ? url.trim() : undefined,
      file: mode === 'file' && file ? file : undefined,
    })
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setTitle('')
    setDescription('')
    setCategory('')
    setUrl('')
    setFile(null)
    setSuccess('Submitted for review.')
    loadRequests()
  }

  return (
    <AuthPageShell
      eyebrow="Contribute"
      heading="Submit a resource"
      subtext="Every submission is reviewed before it appears in the library."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthTextField label="Title" value={title} onChange={setTitle} required />
        <AuthTextArea label="Description" value={description} onChange={setDescription} />
        <AuthSelect label="Type" value={type} onChange={(v) => setType(v as typeof type)} options={RESOURCE_TYPES} />
        <AuthTextField label="Category" value={category} onChange={setCategory} required />

        <div className="flex gap-4 text-sm text-[#A1A1AA]">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'link'} onChange={() => setMode('link')} />
            Link
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'file'} onChange={() => setMode('file')} />
            File
          </label>
        </div>

        {mode === 'link' ? (
          <AuthTextField label="URL" type="url" value={url} onChange={setUrl} required />
        ) : (
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#A1A1AA]">File</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full border border-white/15 bg-[#0D0D0D] px-4 py-2.5 text-sm text-white file:mr-4 file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white"
            />
          </label>
        )}

        {error && <AuthMessage message={error} />}
        {success && <AuthMessage message={success} tone="success" />}

        <AuthSubmitButton loading={submitting}>Submit</AuthSubmitButton>
      </form>

      <h2 className="mt-12 text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Your submissions</h2>
      <div className="mt-4 border-l border-t border-white/10">
        {loadingRequests && (
          <p className="border-b border-r border-white/10 bg-[#0D0D0D] p-4 text-sm text-[#A1A1AA]">Loading…</p>
        )}
        {!loadingRequests && requests.length === 0 && (
          <p className="border-b border-r border-white/10 bg-[#0D0D0D] p-4 text-sm text-[#A1A1AA]">Nothing submitted yet.</p>
        )}
        {requests.map((r) => (
          <div key={r.id} className="border-b border-r border-white/10 bg-[#0D0D0D] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-white">{r.title}</span>
              <span className={`text-xs uppercase tracking-[0.1em] ${r.status === 'approved' ? 'text-[#3FB950]' : r.status === 'rejected' ? 'text-[#F85149]' : 'text-[#A1A1AA]'}`}>
                {r.status}
              </span>
            </div>
            {r.status === 'rejected' && r.rejectionReason && (
              <p className="mt-1 text-xs text-[#A1A1AA]">{r.rejectionReason}</p>
            )}
          </div>
        ))}
      </div>
    </AuthPageShell>
  )
}
