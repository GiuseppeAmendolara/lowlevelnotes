'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Eyebrow from '@/components/Eyebrow'
import { useSession } from '@/components/SessionProvider'
import { useToast } from '@/components/ToastProvider'
import { Skeleton, SkeletonRow } from '@/components/Skeleton'
import {
  getMyCourses,
  createCourse,
  deleteCourse,
  unwrapResult,
  type InstructorCourse,
} from '@/lib/authClient'

// Same style constants as AdminPanel.tsx — duplicated rather than shared,
// matching this app's existing low-abstraction convention (each admin/
// instructor page owns its own small set of these rather than importing
// a shared style module for three class strings).
const inputClass = "border border-white/15 bg-[#17181B] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
const buttonClass = "border border-[#FF7A33]/50 px-3 py-1.5 text-xs font-medium text-[#FF7A33] transition-colors transition-transform duration-150 hover:border-[#FF7A33] hover:bg-[#FF7A33]/10 active:scale-[0.98] motion-reduce:transition-none disabled:opacity-50 disabled:active:scale-100"

const STATUS_LABEL: Record<InstructorCourse['status'], string> = {
  draft: 'Draft',
  pending_review: 'In review',
  published: 'Published',
}

const STATUS_CLASS: Record<InstructorCourse['status'], string> = {
  draft: 'text-white/40',
  pending_review: 'text-[#FF7A33]',
  published: 'text-[#3FB950]',
}

export default function InstructorCoursesPage() {
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()
  const canBuild = !!user && (user.role === 'instructor' || user.role === 'staff')

  const { data: courses } = useQuery({
    queryKey: ['myCourses'],
    queryFn: () => unwrapResult(getMyCourses()),
    enabled: canBuild,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const createMutation = useMutation({
    mutationFn: () => unwrapResult(createCourse({ title, description: description || undefined, category: category || undefined })),
    onSuccess: () => {
      setTitle('')
      setDescription('')
      setCategory('')
      queryClient.invalidateQueries({ queryKey: ['myCourses'] })
      toast.success('Course created.')
    },
    onError: (error) => toast.error(error.message),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => unwrapResult(deleteCourse(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCourses'] })
      toast.success('Course deleted.')
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => setDeletingId(null),
  })

  useEffect(() => {
    if (sessionLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (user.role !== 'instructor' && user.role !== 'staff') {
      router.replace('/')
    }
  }, [sessionLoading, user, router])

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate()
  }

  // Drafts only, matching the Worker's own restriction — once a course is
  // submitted for review or published it has real reviewer/student
  // investment, so removing it becomes a staff-only action instead of
  // instructor self-service.
  function handleDelete(e: React.MouseEvent, id: number, title: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return
    setDeletingId(id)
    deleteMutation.mutate(id)
  }

  if (sessionLoading || !canBuild) {
    return (
      <div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-9 w-56" />
      </div>
    )
  }

  return (
    <div>
      <Eyebrow>Instructor</Eyebrow>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl font-bold tracking-[-0.05em] text-white">Your courses</h1>
        <Link href="/account/build/groups" className="text-sm text-white/70 underline underline-offset-2 transition-colors hover:text-white">
          Manage student groups
        </Link>
      </div>

      <form onSubmit={handleCreate} className="mt-8 flex flex-wrap items-end gap-3">
        <input type="text" required placeholder="Course title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
        <input type="text" placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
        <button type="submit" disabled={createMutation.isPending} className={buttonClass}>{createMutation.isPending ? '…' : 'New course'}</button>
      </form>
      <div className="mt-6 border-l border-t border-white/10">
        {courses === undefined && <SkeletonRow count={3} />}
        {courses?.length === 0 && <p className="border-b border-r border-white/10 bg-[#17181B] p-4 text-sm text-[#90939A]">No courses yet — create one above.</p>}
        {courses?.map((c) => (
          <Link
            key={c.id}
            href={`/account/build/${c.id}`}
            className="block border-b border-r border-white/10 bg-[#17181B] p-4 transition-colors hover:bg-[#0B0B0D]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-white">{c.title}</span>
              <span className="flex items-center gap-3">
                <span className={`text-xs uppercase tracking-[0.1em] ${STATUS_CLASS[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                {c.status === 'draft' && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, c.id, c.title)}
                    disabled={deletingId === c.id}
                    className="text-xs text-white/40 underline underline-offset-2 transition-colors hover:text-[#F85149] disabled:opacity-50"
                  >
                    {deletingId === c.id ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </span>
            </div>
            {c.description && <p className="mt-2 text-sm text-[#90939A]">{c.description}</p>}
            {c.status === 'draft' && c.rejectionReason && (
              <p className="mt-2 text-xs text-[#F85149]">Rejected: {c.rejectionReason}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
