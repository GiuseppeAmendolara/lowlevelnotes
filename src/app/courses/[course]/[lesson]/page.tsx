'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/components/SessionProvider'
import SolutionReveal from '@/components/SolutionReveal'
import ActionButton from '@/components/ActionButton'
import AuthMessage from '@/components/auth/AuthMessage'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import {
  getCourse,
  getCourseLessons,
  getLesson,
  getLessonContent,
  getMyProgress,
  completeLesson,
  enrollCourse,
  attemptQuiz,
  type Course,
  type Lesson,
  type LessonDetail,
  type Quiz,
  type QuizAttemptResult,
} from '@/lib/authClient'

const TYPE_LABEL: Record<Lesson['type'], string> = {
  article: 'Article',
  video: 'Video',
  exercise: 'Exercise',
  quiz: 'Quiz',
}

// Same order as the course page's module/lesson list: by module position,
// then lesson position within it — used to find "next lesson."
function orderLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => a.modulePosition - b.modulePosition || a.position - b.position)
}

// content_path's directory, e.g. "drafts/Data/postgresql.md" -> "drafts/Data"
// — used to resolve relative image references in the markdown. Avoids
// importing Node's path module into a client bundle for one split/join.
function dirnameOf(contentPath: string): string {
  const parts = contentPath.split('/')
  parts.pop()
  return parts.join('/')
}

function embedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl)
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      const id = url.hostname.includes('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

export default function LessonPage({ params }: { params: Promise<{ course: string; lesson: string }> }) {
  const { course: courseSlug, lesson: lessonSlug } = use(params)
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  useEffect(() => {
    if (!user) return

    let cancelled = false
    ;(async () => {
      const [courseResult, lessonsResult, progressResult] = await Promise.all([
        getCourse(courseSlug),
        getCourseLessons(courseSlug),
        getMyProgress(),
      ])

      if (!courseResult.ok) {
        if (!cancelled) setError({ message: courseResult.error, notFound: courseResult.status === 404 })
        return
      }
      if (!lessonsResult.ok) {
        if (!cancelled) setError({ message: lessonsResult.error, notFound: lessonsResult.status === 404 })
        return
      }

      const summary = lessonsResult.data.find((l) => l.slug === lessonSlug)
      if (!summary) {
        if (!cancelled) setError({ message: 'Lesson not found', notFound: true })
        return
      }

      const lessonResult = await getLesson(summary.id)
      if (!lessonResult.ok) {
        if (!cancelled) setError({ message: lessonResult.error, notFound: lessonResult.status === 404 })
        return
      }

      if (!cancelled) {
        setCourse(courseResult.data)
        setLessons(lessonsResult.data)
        setLesson(lessonResult.data)

        if (progressResult.ok) {
          setIsEnrolled(progressResult.data.enrollments.some((e) => e.courseSlug === courseSlug))
          setIsCompleted(
            progressResult.data.lessonProgress.some((p) => p.lessonId === summary.id && p.status === 'completed')
          )
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, courseSlug, lessonSlug])

  async function handleEnroll() {
    setEnrolling(true)
    setEnrollError(null)
    const result = await enrollCourse(courseSlug)
    setEnrolling(false)

    if (!result.ok) {
      setEnrollError(result.error)
      return
    }

    setIsEnrolled(true)
  }

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-20 sm:pt-28">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-white">
            {error.notFound ? 'Lesson not found' : 'Something went wrong'}
          </h1>
          <p className="mt-3 text-sm text-[#A1A1AA]">{error.message}</p>
          <Link href={`/courses/${courseSlug}`} className="mt-6 inline-block text-sm text-[#FF8A3D] underline underline-offset-2">
            ← Back to course
          </Link>
        </section>
      </main>
    )
  }

  if (!course || !lesson || !lessons) {
    return (
      <main className="min-h-screen bg-[#171717]">
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-20 sm:pt-28">
          <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
        </section>
      </main>
    )
  }

  const ordered = orderLessons(lessons)
  const currentIndex = ordered.findIndex((l) => l.slug === lessonSlug)
  const nextLesson = currentIndex >= 0 ? ordered[currentIndex + 1] : undefined

  return (
    <main className="min-h-screen bg-[#171717]">
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-20 sm:pt-28">
        <Link href={`/courses/${courseSlug}`} className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
          ← {course.title}
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#FF8A3D]">{lesson.moduleTitle}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">{lesson.title}</h1>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        {!isEnrolled ? (
          <LockedLesson type={lesson.type} onEnroll={handleEnroll} enrolling={enrolling} error={enrollError} />
        ) : (
          <div className="animate-fade-in-up motion-reduce:animate-none">
            {lesson.type === 'article' && <ArticleBody contentPath={lesson.contentPath} />}
            {lesson.type === 'video' && <VideoBody videoUrl={lesson.videoUrl} />}
            {lesson.type === 'exercise' && lesson.exercise && <ExerciseBody exercise={lesson.exercise} />}
            {lesson.type === 'quiz' && lesson.quiz && (
              <QuizBody
                lessonId={lesson.id}
                quiz={lesson.quiz}
                isCompleted={isCompleted}
                onCompleted={() => setIsCompleted(true)}
              />
            )}

            {lesson.type !== 'quiz' && (
              <CompletionControl
                lessonId={lesson.id}
                isCompleted={isCompleted}
                onCompleted={() => setIsCompleted(true)}
              />
            )}

            <LessonNav courseSlug={courseSlug} nextLesson={nextLesson} />
          </div>
        )}
      </section>
    </main>
  )
}

function ArticleBody({ contentPath }: { contentPath: string | null }) {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!contentPath) return

    let cancelled = false
    ;(async () => {
      const contentResult = await getLessonContent(contentPath)
      if (!contentResult.ok) {
        if (!cancelled) setError(contentResult.error)
        return
      }

      const res = await fetch('/api/render/markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: contentResult.data, basePath: dirnameOf(contentPath) }),
      })

      if (!res.ok) {
        if (!cancelled) setError('Could not render this lesson.')
        return
      }

      const { html } = await res.json()
      if (!cancelled) setHtml(html)
    })()

    return () => {
      cancelled = true
    }
  }, [contentPath])

  if (!contentPath) {
    return <p className="text-sm text-[#A1A1AA]">This lesson has no content yet.</p>
  }

  if (error) {
    return <p className="text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>
  }

  if (!html) {
    return <p className="text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>
  }

  return (
    <div
      className="prose-lesson animate-fade-in-up motion-reduce:animate-none [&_a]:text-[#FF8A3D] [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-[#A1A1AA] [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_h1]:mt-10 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-[-0.04em] [&_h1]:text-white [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-white [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_hr]:border-white/10 [&_img]:max-w-full [&_li]:leading-7 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-4 [&_p]:leading-7 [&_p]:text-[#A1A1AA] [&_pre]:my-4 [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-white/10 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-white/10 [&_th]:bg-white/[0.03] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-white [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function VideoBody({ videoUrl }: { videoUrl: string | null }) {
  if (!videoUrl) {
    return <p className="text-sm text-[#A1A1AA]">This lesson&apos;s video isn&apos;t available yet.</p>
  }

  const embed = embedUrl(videoUrl)

  return (
    <div className="aspect-video w-full border border-white/10 bg-[#0D0D0D]">
      {embed ? (
        <iframe src={embed} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      ) : (
        <video src={videoUrl} controls className="h-full w-full" />
      )}
    </div>
  )
}

function RenderedCode({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/render/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, lang }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setHtml(data.html)
      })

    return () => {
      cancelled = true
    }
  }, [code, lang])

  if (!html) {
    return <div className="border border-white/10 bg-[#171717] p-5 text-xs text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</div>
  }

  return (
    <div className="border border-white/10 bg-[#171717]">
      <div
        className="overflow-x-auto p-5 text-xs leading-6 [&_pre]:!bg-transparent [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

function ExerciseBody({ exercise }: { exercise: { prompt: string; language: string | null; starterCode: string | null; solutionNotes: string | null } }) {
  return (
    <div>
      <p className="text-sm leading-7 text-[#A1A1AA]">{exercise.prompt}</p>
      {exercise.starterCode && (
        <div className="mt-6">
          <RenderedCode code={exercise.starterCode} lang={exercise.language ?? 'text'} />
        </div>
      )}
      {exercise.solutionNotes && <SolutionReveal notes={exercise.solutionNotes} />}
    </div>
  )
}

function CompletionControl({
  lessonId,
  isCompleted,
  onCompleted,
}: {
  lessonId: number
  isCompleted: boolean
  onCompleted: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleComplete() {
    setLoading(true)
    setError(null)
    const result = await completeLesson(lessonId)
    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onCompleted()
  }

  if (isCompleted) {
    return (
      <p className="mt-10 border-t border-white/10 pt-6 text-sm text-[#3FB950]">✓ Completed</p>
    )
  }

  return (
    <div className="mt-10 border-t border-white/10 pt-6">
      <ActionButton onClick={handleComplete} loading={loading}>
        Mark complete
      </ActionButton>
      {error && <p className="mt-2 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
    </div>
  )
}

// A logged-out-but-authenticated visitor can see a lesson exists (title,
// module, type — all visible from the course page's list already) but
// not its actual content, which only unlocks on enrolling. This is a UX
// call, not a security boundary — the API itself only requires a
// session to read lesson content, not enrollment; enrollment still gates
// the write actions (complete/attempt) at the API layer regardless of
// what this page shows.
function LockedLesson({
  type,
  onEnroll,
  enrolling,
  error,
}: {
  type: Lesson['type']
  onEnroll: () => void
  enrolling: boolean
  error: string | null
}) {
  return (
    <div className="border border-white/10 bg-[#0D0D0D] p-6">
      <p className="text-xs uppercase tracking-[0.1em] text-white/40">{TYPE_LABEL[type]}</p>
      <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">
        Enroll in this course to view this lesson and track your progress.
      </p>
      <div className="mt-5">
        <ActionButton onClick={onEnroll} loading={enrolling}>
          Enroll
        </ActionButton>
        {error && <p className="mt-2 text-sm text-[#F85149] animate-fade-in-up motion-reduce:animate-none">{error}</p>}
      </div>
    </div>
  )
}

function LessonNav({ courseSlug, nextLesson }: { courseSlug: string; nextLesson: Lesson | undefined }) {
  return (
    <div className="mt-6 flex justify-end">
      {nextLesson ? (
        <Link
          href={`/courses/${courseSlug}/${nextLesson.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#FF8A3D]"
        >
          Next lesson: {nextLesson.title} →
        </Link>
      ) : (
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#FF8A3D]"
        >
          ← Back to course
        </Link>
      )}
    </div>
  )
}

// Any successful attempt (any score) marks the lesson completed
// server-side, so this owns calling onCompleted itself rather than
// relying on the generic CompletionControl, which the page excludes for
// quiz lessons entirely. Retakes are always allowed server-side (no
// "already attempted" gate), so the form stays interactive after
// grading too — "Retake quiz" just clears local state to answer again.
function QuizBody({
  lessonId,
  quiz,
  isCompleted,
  onCompleted,
}: {
  lessonId: number
  quiz: Quiz
  isCompleted: boolean
  onCompleted: () => void
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<QuizAttemptResult | null>(null)

  const resultByQuestion = new Map(result?.results.map((r) => [r.questionId, r]))
  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = quiz.questions.map((q) => ({ questionId: q.id, answerId: answers[q.id] }))
    const attemptResult = await attemptQuiz(lessonId, payload)
    setSubmitting(false)

    if (!attemptResult.ok) {
      setError(attemptResult.error)
      return
    }

    setResult(attemptResult.data)
    onCompleted()
  }

  function handleRetake() {
    setResult(null)
    setAnswers({})
    setError(null)
  }

  return (
    <div>
      {isCompleted && !result && (
        <p className="mb-6 text-sm text-[#3FB950]">✓ Completed — you can retake this quiz anytime.</p>
      )}

      {result && (
        <div className="mb-6 border border-white/10 bg-[#0D0D0D] p-6">
          <p className="text-2xl font-bold tracking-[-0.03em] text-white">
            {result.score}/{result.total}
          </p>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            {result.score === result.total ? 'Perfect score.' : 'Review the highlighted answers below.'}
          </p>
          <div className="mt-4">
            <ActionButton onClick={handleRetake} loading={false}>
              Retake quiz
            </ActionButton>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {quiz.questions.map((question, qi) => {
          const questionResult = resultByQuestion.get(question.id)

          return (
            <fieldset key={question.id} className="border border-white/10 bg-[#0D0D0D] p-6">
              <legend className="mb-4 text-sm leading-6 text-white">
                {qi + 1}. {question.prompt}
              </legend>
              <div className="flex flex-col gap-2">
                {question.answers.map((answer) => {
                  const selected = answers[question.id] === answer.id
                  const isCorrectAnswer = questionResult?.correctAnswerId === answer.id
                  const isSelectedWrong = Boolean(questionResult) && selected && !questionResult?.correct

                  let optionClass = 'border-white/15 hover:border-white/40'
                  let indicatorClass = selected ? 'border-[#FF8A3D] bg-[#FF8A3D]' : 'border-white/30'
                  if (questionResult) {
                    if (isCorrectAnswer) {
                      optionClass = 'border-[#3FB950] bg-[#3FB950]/10'
                      indicatorClass = 'border-[#3FB950] bg-[#3FB950]'
                    } else if (isSelectedWrong) {
                      optionClass = 'border-[#F85149] bg-[#F85149]/10'
                      indicatorClass = 'border-[#F85149] bg-[#F85149]'
                    } else {
                      optionClass = 'border-white/10 text-white/40'
                      indicatorClass = 'border-white/20'
                    }
                  } else if (selected) {
                    optionClass = 'border-[#FF8A3D] bg-[#FF8A3D]/10'
                  }

                  return (
                    <label
                      key={answer.id}
                      className={`flex items-center gap-3 border px-4 py-3 text-sm text-white transition-colors ${optionClass} ${questionResult ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={answer.id}
                        checked={selected}
                        disabled={Boolean(questionResult) || submitting}
                        onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: answer.id }))}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`h-3 w-3 shrink-0 border ${indicatorClass}`}
                      />
                      {answer.body}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )
        })}

        {!result && (
          <div>
            <AuthSubmitButton loading={submitting} disabled={!allAnswered}>
              Submit quiz
            </AuthSubmitButton>
            {error && <AuthMessage message={error} />}
          </div>
        )}
      </form>
    </div>
  )
}
