'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthTextField from '@/components/auth/AuthTextField'
import AuthTextArea from '@/components/auth/AuthTextArea'
import AuthSelect from '@/components/auth/AuthSelect'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import AuthMessage from '@/components/auth/AuthMessage'
import Eyebrow from '@/components/Eyebrow'
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

// Shared eyebrow/heading/subtext block — every branch below (loading,
// pending, done, the two real forms) renders one of these instead of a
// standalone AuthPageShell, since this page now lives inside the account
// dashboard's own shell rather than being a separate page.
function ContributeHeader({ heading, subtext }: { heading: string; subtext?: string }) {
  return (
    <>
      <Eyebrow>Contribute</Eyebrow>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white">{heading}</h1>
      {subtext && <p className="mt-4 max-w-xl leading-7 text-[#90939A]">{subtext}</p>}
    </>
  )
}

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
      <div>
        <ContributeHeader heading="Contribute" />
        <p className="mt-6 text-sm text-[#90939A] animate-pulse motion-reduce:animate-none">Loading…</p>
      </div>
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
      <div>
        <ContributeHeader heading="Contribute" />
        <p className="mt-6 text-sm text-[#90939A] animate-pulse motion-reduce:animate-none">Loading…</p>
      </div>
    )
  }

  const pending = requests.find((r) => r.status === 'pending')
  const latest = requests[0]

  if (pending) {
    return (
      <div>
        <ContributeHeader heading="Request pending" />
        <p className="mt-6 text-sm leading-6 text-[#90939A]">
          Your request to become a {pending.requestedRole} is waiting on review.
        </p>
        <div className="mt-4 max-w-md">
          <AuthMessage message="Pending — you'll be able to submit resources once this is approved." />
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div>
        <ContributeHeader heading="Request sent" />
        <div className="mt-6 max-w-md">
          <AuthMessage message="Your request has been submitted for review." tone="success" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md">
      <ContributeHeader
        heading="Request access"
        subtext="Contributors and instructors can submit resources for the library. Every submission is reviewed before it goes live."
      />

      {latest?.status === 'rejected' && (
        <div className="mt-6">
          <AuthMessage
            message={latest.rejectionReason ? `Your last request was declined: ${latest.rejectionReason}` : 'Your last request was declined.'}
          />
        </div>
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
    </div>
  )
}

function ResourceRequestPanel() {
  const [requests, setRequests] = useState<ResourceRequest[] | null>(null)

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
    getMyResourceRequests().then((result) => {
      if (result.ok) setRequests(result.data)
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
    <div className="max-w-md">
      <ContributeHeader heading="Submit a resource" subtext="Every submission is reviewed before it appears in the library." />

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <AuthTextField label="Title" value={title} onChange={setTitle} required />
        <AuthTextArea label="Description" value={description} onChange={setDescription} />
        <AuthSelect label="Type" value={type} onChange={(v) => setType(v as typeof type)} options={RESOURCE_TYPES} />
        <AuthTextField label="Category" value={category} onChange={setCategory} required />

        <div className="flex gap-4 text-sm text-[#90939A]">
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
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#90939A]">File</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full border border-white/15 bg-[#17181B] px-4 py-2.5 text-sm text-white file:mr-4 file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white"
            />
          </label>
        )}

        {error && <AuthMessage message={error} />}
        {success && <AuthMessage message={success} tone="success" />}

        <AuthSubmitButton loading={submitting}>Submit</AuthSubmitButton>
      </form>

      <Eyebrow as="h2" className="mt-12">Your submissions</Eyebrow>
      <div className="mt-4 border-l border-t border-white/10">
        {requests === null && (
          <p className="border-b border-r border-white/10 bg-[#17181B] p-4 text-sm text-[#90939A] animate-pulse motion-reduce:animate-none">Loading…</p>
        )}
        {requests?.length === 0 && (
          <p className="border-b border-r border-white/10 bg-[#17181B] p-4 text-sm text-[#90939A]">Nothing submitted yet.</p>
        )}
        {requests?.map((r) => (
          <div key={r.id} className="border-b border-r border-white/10 bg-[#17181B] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-white">{r.title}</span>
              <span className={`text-xs uppercase tracking-[0.1em] ${r.status === 'approved' ? 'text-[#3FB950]' : r.status === 'rejected' ? 'text-[#F85149]' : 'text-[#90939A]'}`}>
                {r.status}
              </span>
            </div>
            {r.status === 'rejected' && r.rejectionReason && (
              <p className="mt-1 text-xs text-[#90939A]">{r.rejectionReason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
