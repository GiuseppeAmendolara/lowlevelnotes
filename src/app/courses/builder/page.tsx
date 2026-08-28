'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthPageShell from '@/components/auth/AuthPageShell'
import { useSession } from '@/components/SessionProvider'
import {
  getMyCourses,
  createCourse,
  type InstructorCourse,
} from '@/lib/authClient'

// Same style constants as AdminPanel.tsx — duplicated rather than shared,
// matching this app's existing low-abstraction convention (each admin/
// instructor page owns its own small set of these rather than importing
// a shared style module for three class strings).
const inputClass = "border border-white/15 bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
const buttonClass = "border border-[#FF8A3D]/50 px-3 py-1.5 text-xs font-medium text-[#FF8A3D] transition-colors transition-transform duration-150 hover:border-[#FF8A3D] hover:bg-[#FF8A3D]/10 active:scale-[0.98] motion-reduce:transition-none disabled:opacity-50 disabled:active:scale-100"

const STATUS_LABEL: Record<InstructorCourse['status'], string> = {
  draft: 'Draft',
  pending_review: 'In review',
  published: 'Published',
}

const STATUS_CLASS: Record<InstructorCourse['status'], string> = {
  draft: 'text-white/40',
  pending_review: 'text-[#FF8A3D]',
  published: 'text-[#3FB950]',
}

export default function InstructorCoursesPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [courses, setCourses] = useState<InstructorCourse[] | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (user.role !== 'instructor' && user.role !== 'administrator') {
      router.replace('/')
    }
  }, [sessionLoading, user, router])

  function load() {
    return getMyCourses().then((result) => {
      if (result.ok) setCourses(result.data)
    })
  }

  useEffect(() => {
    if (user && (user.role === 'instructor' || user.role === 'administrator')) load()
  }, [user])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)

    const result = await createCourse({ title, description: description || undefined, category: category || undefined })
    setCreating(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setTitle('')
    setDescription('')
    setCategory('')
    load()
  }

  if (sessionLoading || !user || (user.role !== 'instructor' && user.role !== 'administrator')) {
    return (
      <AuthPageShell eyebrow="Instructor" heading="Your courses" backHref="/account">
        <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
      </AuthPageShell>
    )
  }

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-20 sm:pt-28">
        <Link href="/account" className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
          ← Account
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Instructor</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">Your courses</h1>
          <Link href="/courses/builder/groups" className="text-sm text-white/70 underline underline-offset-2 transition-colors hover:text-white">
            Manage student groups
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <input type="text" required placeholder="Course title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          <input type="text" placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
          <button type="submit" disabled={creating} className={buttonClass}>{creating ? '…' : 'New course'}</button>
        </form>
        {error && <p className="mt-2 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}

        <div className="mt-6 border-l border-t border-white/10">
          {courses === null && <p className="border-b border-r border-white/10 bg-[#0D0D0D] p-4 text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>}
          {courses?.length === 0 && <p className="border-b border-r border-white/10 bg-[#0D0D0D] p-4 text-sm text-[#A1A1AA]">No courses yet — create one above.</p>}
          {courses?.map((c) => (
            <Link
              key={c.id}
              href={`/courses/builder/${c.id}`}
              className="block border-b border-r border-white/10 bg-[#0D0D0D] p-4 transition-colors hover:bg-[#171717]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">{c.title}</span>
                <span className={`text-xs uppercase tracking-[0.1em] ${STATUS_CLASS[c.status]}`}>{STATUS_LABEL[c.status]}</span>
              </div>
              {c.description && <p className="mt-2 text-sm text-[#A1A1AA]">{c.description}</p>}
              {c.status === 'draft' && c.rejectionReason && (
                <p className="mt-2 text-xs text-[#F85149]">Rejected: {c.rejectionReason}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
