'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthPageShell from '@/components/auth/AuthPageShell'
import ActionButton from '@/components/ActionButton'
import { useSession } from '@/components/SessionProvider'
import {
  getMyCourse,
  updateCourse,
  submitCourseForReview,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  saveLessonContent,
  getLessonContent,
  uploadLessonImage,
  uploadCourseIcon,
  addCourseAuthor,
  removeCourseAuthor,
  setCourseGroups,
  getMyGroups,
  getAssetSrc,
  type InstructorCourseDetail,
  type InstructorModule,
  type InstructorLesson,
  type LessonType,
  type LessonFields,
  type CourseDifficulty,
  type CourseVisibility,
  type StudentGroup,
} from '@/lib/authClient'

// Same style constants as AdminPanel.tsx / the instructor courses list —
// duplicated rather than shared, matching this app's existing
// low-abstraction convention.
const inputClass = "border border-white/15 bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
// Lighter-on-darker, for controls sitting on a bg-[#0D0D0D] row rather
// than the page background — same reasoning as AdminPanel.tsx's
// rowInputClass, applied one level deeper here (module row -> lesson row
// -> lesson editor each alternate #0D0D0D/#171717 so nothing blends into
// its own container).
const rowInputClass = "border border-white/15 bg-[#171717] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
const buttonClass = "border border-[#FF8A3D]/50 px-3 py-1.5 text-xs font-medium text-[#FF8A3D] transition-colors transition-transform duration-150 hover:border-[#FF8A3D] hover:bg-[#FF8A3D]/10 active:scale-[0.98] motion-reduce:transition-none disabled:opacity-50 disabled:active:scale-100"

const TYPE_LABEL: Record<LessonType, string> = {
  article: 'Article',
  video: 'Video',
  exercise: 'Exercise',
  quiz: 'Quiz',
}

const PROSE_LESSON_CLASS =
  "prose-lesson [&_a]:text-[#FF8A3D] [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-[#A1A1AA] [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_h1]:mt-10 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-[-0.04em] [&_h1]:text-white [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-white [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_hr]:border-white/10 [&_img]:max-w-full [&_li]:leading-7 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-4 [&_p]:leading-7 [&_p]:text-[#A1A1AA] [&_pre]:my-4 [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-white/10 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-white/10 [&_th]:bg-white/[0.03] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-white [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 text-sm"

function dirnameOf(path: string): string {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/')
}

export default function InstructorCourseBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [course, setCourse] = useState<InstructorCourseDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  function load() {
    return getMyCourse(Number(id)).then((result) => {
      if (result.ok) setCourse(result.data)
      else setError(result.error)
    })
  }

  useEffect(() => {
    if (user && (user.role === 'instructor' || user.role === 'staff')) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id])

  if (sessionLoading || !user || (user.role !== 'instructor' && user.role !== 'staff')) {
    return (
      <AuthPageShell eyebrow="Instructor" heading="Course" backHref="/courses/builder" backLabel="Your courses">
        <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
      </AuthPageShell>
    )
  }

  if (error) {
    return (
      <AuthPageShell eyebrow="Instructor" heading="Course" backHref="/courses/builder" backLabel="Your courses">
        <p className="text-sm text-[#F85149]">{error}</p>
      </AuthPageShell>
    )
  }

  if (!course) {
    return (
      <AuthPageShell eyebrow="Instructor" heading="Course" backHref="/courses/builder" backLabel="Your courses">
        <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
      </AuthPageShell>
    )
  }

  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0)

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-20 sm:pt-28">
        <Link href="/courses/builder" className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
          ← Your courses
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Instructor</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">{course.title}</h1>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="grid grid-cols-3 gap-px border border-white/10 bg-white/10">
          <StatTile label="Views" value={course.viewCount} />
          <StatTile label="Enrolled" value={course.enrolledCount} />
          <StatTile label="Completed" value={course.completedCount} />
        </div>

        <CourseIconUpload course={course} onUploaded={load} />
        <CourseDetailsForm course={course} onSaved={load} />
        <CourseAuthorsSection course={course} onChanged={load} />
        <CourseVisibilitySection course={course} onChanged={load} />

        {course.status === 'draft' && course.rejectionReason && (
          <p className="mt-4 text-sm text-[#F85149]">Rejected: {course.rejectionReason}</p>
        )}

        <SubmitForReviewControl course={course} lessonCount={lessonCount} onSubmitted={load} />

        <h2 className="mt-10 text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Modules</h2>
        <div className="mt-4 flex flex-col gap-4">
          {course.modules.map((mod) => (
            <ModuleRow key={mod.id} mod={mod} onReload={load} />
          ))}
        </div>

        <AddModuleForm courseId={course.id} onCreated={load} />
      </section>
    </main>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#0D0D0D] p-4">
      <p className="text-2xl font-bold tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-1 text-xs text-[#A1A1AA]">{label}</p>
    </div>
  )
}

function CourseIconUpload({ course, onUploaded }: { course: InstructorCourseDetail; onUploaded: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    const result = await uploadCourseIcon(course.id, file)
    setUploading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }
    onUploaded()
  }

  return (
    <div className="mt-6 flex items-center gap-4">
      {course.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- cross-subdomain, session-cookie-gated asset; next/image can't proxy this
        <img src={getAssetSrc(course.iconUrl)} alt="" className="h-16 w-16 shrink-0 border border-white/10 object-cover" />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-white/10 bg-[#0D0D0D] text-xs text-white/40">No icon</div>
      )}
      <div>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/svg+xml" className="hidden" onChange={handleChange} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={buttonClass}
        >
          {uploading ? 'Uploading…' : 'Change icon'}
        </button>
        {error && <p className="mt-2 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
      </div>
    </div>
  )
}

const DIFFICULTY_OPTIONS: { value: CourseDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

function CourseDetailsForm({ course, onSaved }: { course: InstructorCourseDetail; onSaved: () => void }) {
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description ?? '')
  const [category, setCategory] = useState(course.category ?? '')
  const [difficulty, setDifficulty] = useState<CourseDifficulty | ''>(course.difficulty ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await updateCourse(course.id, {
      title,
      description: description || undefined,
      category: category || undefined,
      difficulty: difficulty || undefined,
      visibility: course.visibility,
    })
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onSaved()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Title" className={inputClass} />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className={inputClass} />
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className={inputClass} />
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as CourseDifficulty | '')} className={inputClass}>
        <option value="">No difficulty set</option>
        {DIFFICULTY_OPTIONS.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>
      <button type="submit" disabled={saving} className={`self-start ${buttonClass}`}>{saving ? '…' : 'Save course details'}</button>
      {error && <p className="text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
    </form>
  )
}

function CourseAuthorsSection({ course, onChanged }: { course: InstructorCourseDetail; onChanged: () => void }) {
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError(null)
    const result = await addCourseAuthor(course.id, email)
    setAdding(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setEmail('')
    onChanged()
  }

  async function handleRemove(userId: number) {
    const result = await removeCourseAuthor(course.id, userId)
    if (result.ok) onChanged()
  }

  return (
    <div className="mt-8">
      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Authors</h2>
      <div className="mt-3 flex flex-col gap-2">
        {course.authors.map((author) => (
          <div key={author.id} className="flex items-center justify-between gap-3 border border-white/10 bg-[#0D0D0D] px-4 py-2 text-sm text-white">
            <span>{author.displayName}{author.id === course.createdBy && ' (owner)'}</span>
            {author.id !== course.createdBy && (
              <button type="button" onClick={() => handleRemove(author.id)} className="text-xs text-white/50 underline underline-offset-2 hover:text-white">
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleAdd} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Add a co-author by email"
          className={inputClass}
        />
        <button type="submit" disabled={adding} className={buttonClass}>{adding ? '…' : 'Add'}</button>
      </form>
      <p className="mt-1 text-xs text-white/40">Must already be an instructor or staff member on the site.</p>
      {error && <p className="mt-2 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
    </div>
  )
}

function CourseVisibilitySection({ course, onChanged }: { course: InstructorCourseDetail; onChanged: () => void }) {
  const [groups, setGroups] = useState<StudentGroup[] | null>(null)
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<number>>(new Set(course.groupIds))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyGroups().then((result) => {
      if (result.ok) setGroups(result.data)
    })
  }, [])

  async function handleVisibilityChange(visibility: CourseVisibility) {
    setSaving(true)
    setError(null)
    const result = await updateCourse(course.id, {
      title: course.title,
      description: course.description || undefined,
      category: course.category || undefined,
      difficulty: course.difficulty || undefined,
      visibility,
    })
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onChanged()
  }

  async function handleSaveGroups() {
    setSaving(true)
    setError(null)
    const result = await setCourseGroups(course.id, [...selectedGroupIds])
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onChanged()
  }

  function toggleGroup(id: number) {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mt-8">
      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">Visibility</h2>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => handleVisibilityChange('public')}
          disabled={saving}
          className={course.visibility === 'public' ? buttonClass : inputClass}
        >
          Open to everyone
        </button>
        <button
          type="button"
          onClick={() => handleVisibilityChange('restricted')}
          disabled={saving}
          className={course.visibility === 'restricted' ? buttonClass : inputClass}
        >
          Restricted to groups
        </button>
      </div>

      {course.visibility === 'restricted' && (
        <div className="mt-4">
          <p className="text-xs text-white/40">Only students in the checked groups can see or enroll in this course.</p>
          <div className="mt-2 flex flex-col gap-2">
            {groups === null && <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading groups…</p>}
            {groups?.length === 0 && (
              <p className="text-sm text-[#A1A1AA]">
                No groups yet — <Link href="/courses/builder/groups" className="text-[#FF8A3D] underline underline-offset-2">create one</Link>.
              </p>
            )}
            {groups?.map((group) => (
              <label key={group.id} className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={selectedGroupIds.has(group.id)}
                  onChange={() => toggleGroup(group.id)}
                />
                {group.name} ({group.memberCount} students)
              </label>
            ))}
          </div>
          {groups && groups.length > 0 && (
            <button type="button" onClick={handleSaveGroups} disabled={saving} className={`mt-3 ${buttonClass}`}>
              {saving ? '…' : 'Save group access'}
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
    </div>
  )
}

function SubmitForReviewControl({
  course,
  lessonCount,
  onSubmitted,
}: {
  course: InstructorCourseDetail
  lessonCount: number
  onSubmitted: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    const result = await submitCourseForReview(course.id)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onSubmitted()
  }

  if (course.status === 'published') {
    return <p className="mt-6 text-sm text-[#3FB950]">✓ Published — live on the site.</p>
  }
  if (course.status === 'pending_review') {
    return <p className="mt-6 text-sm text-[#FF8A3D]">In review — a staff member will approve or reject it soon.</p>
  }
  if (lessonCount === 0) {
    return <p className="mt-6 text-sm text-[#A1A1AA]">Add at least one lesson before you can submit this course for review.</p>
  }

  return (
    <div className="mt-6">
      <ActionButton onClick={handleSubmit} loading={submitting}>Submit for review</ActionButton>
      {error && <p className="mt-2 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
    </div>
  )
}

function AddModuleForm({ courseId, onCreated }: { courseId: number; onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    const result = await createModule(courseId, { title, description: description || undefined })
    setCreating(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setTitle('')
    setDescription('')
    onCreated()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Module title" className={inputClass} />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className={inputClass} />
      <button type="submit" disabled={creating} className={buttonClass}>{creating ? '…' : '+ Add module'}</button>
      {error && <p className="text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
    </form>
  )
}

function ModuleRow({ mod, onReload }: { mod: InstructorModule; onReload: () => void }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(mod.title)
  const [description, setDescription] = useState(mod.description ?? '')
  const [saving, setSaving] = useState(false)
  const [addingLesson, setAddingLesson] = useState(false)
  const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null)

  async function handleSaveModule(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await updateModule(mod.id, { title, description: description || undefined })
    setSaving(false)
    setEditing(false)
    onReload()
  }

  async function handleDeleteModule() {
    if (!window.confirm(`Delete "${mod.title}" and all its lessons? This can't be undone.`)) return
    await deleteModule(mod.id)
    onReload()
  }

  async function handleDeleteLesson(lessonId: number) {
    if (!window.confirm('Delete this lesson? This can\'t be undone.')) return
    await deleteLesson(lessonId)
    onReload()
  }

  return (
    <div className="border border-white/10 bg-[#0D0D0D] p-4">
      {editing ? (
        <form onSubmit={handleSaveModule} className="flex flex-wrap items-end gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={rowInputClass} />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className={rowInputClass} />
          <button type="submit" disabled={saving} className={buttonClass}>{saving ? '…' : 'Save'}</button>
          <button type="button" onClick={() => setEditing(false)} className={buttonClass}>Cancel</button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-sm font-medium text-white">{mod.title}</span>
            {mod.description && <span className="ml-2 text-xs text-[#A1A1AA]">{mod.description}</span>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className={buttonClass}>Edit</button>
            <button type="button" onClick={handleDeleteModule} className={buttonClass}>Delete</button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 border-l border-white/10 pl-4">
        {mod.lessons.map((lesson) => (
          <div key={lesson.id}>
            <div className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#171717] px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-[0.1em] text-white/40">{TYPE_LABEL[lesson.type]}</span>
                <span className="text-sm text-white">{lesson.title}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)} className={buttonClass}>
                  {expandedLessonId === lesson.id ? 'Close' : 'Edit'}
                </button>
                <button type="button" onClick={() => handleDeleteLesson(lesson.id)} className={buttonClass}>Delete</button>
              </div>
            </div>
            {expandedLessonId === lesson.id && (
              <div className="border border-t-0 border-white/10 bg-[#171717] p-4">
                <LessonEditor
                  moduleId={mod.id}
                  lesson={lesson}
                  onSaved={() => {
                    setExpandedLessonId(null)
                    onReload()
                  }}
                />
              </div>
            )}
          </div>
        ))}

        {addingLesson ? (
          <div className="border border-white/10 bg-[#171717] p-4">
            <LessonEditor
              moduleId={mod.id}
              onSaved={() => {
                setAddingLesson(false)
                onReload()
              }}
              onCancel={() => setAddingLesson(false)}
            />
          </div>
        ) : (
          <button type="button" onClick={() => setAddingLesson(true)} className={`self-start ${buttonClass}`}>+ Add lesson</button>
        )}
      </div>
    </div>
  )
}

type AnswerDraft = { body: string; correct: boolean }
type QuestionDraft = { prompt: string; answers: AnswerDraft[] }

function LessonEditor({
  moduleId,
  lesson,
  onSaved,
  onCancel,
}: {
  moduleId: number
  lesson?: InstructorLesson
  onSaved: () => void
  onCancel?: () => void
}) {
  const isEditing = Boolean(lesson)

  const [title, setTitle] = useState(lesson?.title ?? '')
  const [type, setType] = useState<LessonType>(lesson?.type ?? 'article')
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? '')
  const [prompt, setPrompt] = useState(lesson?.exercise?.prompt ?? '')
  const [language, setLanguage] = useState(lesson?.exercise?.language ?? '')
  const [starterCode, setStarterCode] = useState(lesson?.exercise?.starterCode ?? '')
  const [solutionNotes, setSolutionNotes] = useState(lesson?.exercise?.solutionNotes ?? '')
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    lesson?.quiz?.questions.map((q) => ({
      prompt: q.prompt,
      answers: q.answers.map((a) => ({ body: a.body, correct: a.correct })),
    })) ?? []
  )

  const [markdown, setMarkdown] = useState('')
  const [markdownLoaded, setMarkdownLoaded] = useState(!(isEditing && lesson?.type === 'article' && lesson.contentPath))
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const markdownRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && lesson?.type === 'article' && lesson.contentPath) {
      getLessonContent(lesson.contentPath).then((result) => {
        if (result.ok) setMarkdown(result.data)
        setMarkdownLoaded(true)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadingImage(true)
    setError(null)
    const result = await uploadLessonImage(moduleId, file)
    setUploadingImage(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    // Insert at the cursor rather than always appending, so uploading an
    // image mid-paragraph doesn't force a rewrite of the surrounding text.
    const markup = `![](${result.data.filename})`
    const textarea = markdownRef.current
    const cursor = textarea?.selectionStart ?? markdown.length
    setMarkdown(markdown.slice(0, cursor) + markup + markdown.slice(cursor))
  }

  async function handlePreview() {
    // basePath only resolves relative image references correctly for an
    // existing lesson (a brand-new lesson's content_path doesn't exist
    // until the first save) — acceptable for a preview-while-drafting tool.
    const basePath = lesson?.contentPath ? dirnameOf(lesson.contentPath) : ''
    const res = await fetch('/api/render/markdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown, basePath }),
    })
    if (!res.ok) return
    const { html } = await res.json()
    setPreview(html)
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, { prompt: '', answers: [{ body: '', correct: true }, { body: '', correct: false }] }])
  }
  function removeQuestion(qi: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== qi))
  }
  function updateQuestionPrompt(qi: number, value: string) {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, prompt: value } : q)))
  }
  function addAnswer(qi: number) {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, answers: [...q.answers, { body: '', correct: false }] } : q)))
  }
  function removeAnswer(qi: number, ai: number) {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, answers: q.answers.filter((_, j) => j !== ai) } : q)))
  }
  function updateAnswerBody(qi: number, ai: number, value: string) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi ? { ...q, answers: q.answers.map((a, j) => (j === ai ? { ...a, body: value } : a)) } : q))
    )
  }
  function setCorrectAnswer(qi: number, ai: number) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi ? { ...q, answers: q.answers.map((a, j) => ({ ...a, correct: j === ai })) } : q))
    )
  }

  const quizValid =
    type !== 'quiz' ||
    (questions.length > 0 &&
      questions.every((q) => q.prompt.trim() && q.answers.length >= 2 && q.answers.every((a) => a.body.trim()) && q.answers.filter((a) => a.correct).length === 1))

  async function handleSave() {
    setSaving(true)
    setError(null)

    const fields: LessonFields = {
      title,
      type,
      ...(type === 'video' ? { videoUrl } : {}),
      ...(type === 'exercise' ? { prompt, language: language || undefined, starterCode: starterCode || undefined, solutionNotes: solutionNotes || undefined } : {}),
      ...(type === 'quiz' ? { questions: questions.map((q) => ({ prompt: q.prompt, answers: q.answers.map((a) => ({ body: a.body, correct: a.correct })) })) } : {}),
    }

    let lessonId: number
    if (isEditing) {
      const result = await updateLesson(lesson!.id, fields)
      if (!result.ok) {
        setSaving(false)
        setError(result.error)
        return
      }
      lessonId = lesson!.id
    } else {
      const result = await createLesson(moduleId, fields)
      if (!result.ok) {
        setSaving(false)
        setError(result.error)
        return
      }
      lessonId = result.data.id
    }

    if (type === 'article') {
      const contentResult = await saveLessonContent(lessonId, markdown)
      if (!contentResult.ok) {
        setSaving(false)
        setError(contentResult.error)
        return
      }
    }

    setSaving(false)
    onSaved()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Lesson title" className={inputClass} />
        {!isEditing && (
          <select value={type} onChange={(e) => setType(e.target.value as LessonType)} className={inputClass}>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="exercise">Exercise</option>
            <option value="quiz">Quiz</option>
          </select>
        )}
        {isEditing && <span className="text-xs uppercase tracking-[0.1em] text-white/40">{TYPE_LABEL[type]}</span>}
      </div>

      {type === 'article' && (
        <div>
          {!markdownLoaded ? (
            <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
          ) : (
            <>
              <textarea
                ref={markdownRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                rows={20}
                placeholder="Markdown content…"
                className="w-full resize-y border border-white/15 bg-[#0D0D0D] px-4 py-2.5 font-mono text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button type="button" onClick={handlePreview} className={buttonClass}>Preview</button>
                <label className={`cursor-pointer ${buttonClass} ${uploadingImage ? 'pointer-events-none opacity-50' : ''}`}>
                  {uploadingImage ? 'Uploading…' : '+ Insert image'}
                  <input type="file" accept="image/png,image/jpeg,image/gif,image/svg+xml" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                </label>
              </div>
              {preview && <div className={`mt-4 border border-white/10 bg-[#0D0D0D] p-6 ${PROSE_LESSON_CLASS}`} dangerouslySetInnerHTML={{ __html: preview }} />}
            </>
          )}
        </div>
      )}

      {type === 'video' && (
        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required placeholder="Video URL" className={inputClass} />
      )}

      {type === 'exercise' && (
        <div className="flex flex-col gap-3">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} required rows={4} placeholder="Prompt" className={`${inputClass} resize-y`} />
          <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Language (e.g. c, asm)" className={inputClass} />
          <textarea value={starterCode} onChange={(e) => setStarterCode(e.target.value)} rows={6} placeholder="Starter code" className={`${inputClass} resize-y font-mono`} />
          <textarea value={solutionNotes} onChange={(e) => setSolutionNotes(e.target.value)} rows={4} placeholder="Solution notes" className={`${inputClass} resize-y`} />
        </div>
      )}

      {type === 'quiz' && (
        <div className="flex flex-col gap-4">
          {questions.map((q, qi) => (
            <fieldset key={qi} className="border border-white/10 bg-[#171717] p-4">
              <div className="flex items-start justify-between gap-3">
                <input
                  value={q.prompt}
                  onChange={(e) => updateQuestionPrompt(qi, e.target.value)}
                  placeholder={`Question ${qi + 1}`}
                  className={`${inputClass} flex-1`}
                />
                <button type="button" onClick={() => removeQuestion(qi)} className={buttonClass}>Remove</button>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {q.answers.map((a, ai) => (
                  <div key={ai} className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Mark correct"
                      onClick={() => setCorrectAnswer(qi, ai)}
                      className={`h-4 w-4 shrink-0 border ${a.correct ? 'border-[#3FB950] bg-[#3FB950]' : 'border-white/30'}`}
                    />
                    <input
                      value={a.body}
                      onChange={(e) => updateAnswerBody(qi, ai, e.target.value)}
                      placeholder={`Answer ${ai + 1}`}
                      className={`${inputClass} flex-1`}
                    />
                    <button type="button" disabled={q.answers.length <= 2} onClick={() => removeAnswer(qi, ai)} className={buttonClass}>×</button>
                  </div>
                ))}
                <button type="button" onClick={() => addAnswer(qi)} className={`self-start ${buttonClass}`}>+ Add answer</button>
              </div>
            </fieldset>
          ))}
          <button type="button" onClick={addQuestion} className={`self-start ${buttonClass}`}>+ Add question</button>
          {!quizValid && questions.length > 0 && (
            <p className="text-xs text-[#A1A1AA]">Every question needs at least 2 answers with exactly one marked correct.</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" disabled={saving || !quizValid} onClick={handleSave} className={buttonClass}>
          {saving ? '…' : isEditing ? 'Save lesson' : 'Create lesson'}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className={buttonClass}>Cancel</button>}
      </div>
      {error && <p className="text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
    </div>
  )
}
