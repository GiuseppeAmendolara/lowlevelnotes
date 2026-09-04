'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/components/SessionProvider'
import { useToast } from '@/components/ToastProvider'
import ActionButton from '@/components/ActionButton'
import CourseTreeRail from '@/components/CourseTreeRail'
import { ArticleBody, VideoBody, ExerciseBody } from '@/components/lesson/LessonContentViews'
import AuthSubmitButton from '@/components/auth/AuthSubmitButton'
import { Skeleton } from '@/components/Skeleton'
import {
  getCourse,
  getCourseLessons,
  getLesson,
  getMyProgress,
  completeLesson,
  enrollCourse,
  attemptQuiz,
  unwrapResult,
  ApiError,
  type Lesson,
  type Quiz,
  type QuizAttemptResult,
} from '@/lib/authClient'
import Eyebrow from '@/components/Eyebrow'

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

export default function LessonPage({ params }: { params: Promise<{ course: string; lesson: string }> }) {
  const { course: courseSlug, lesson: lessonSlug } = use(params)
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()

  // Same query keys the course detail page uses, so arriving here from
  // there (or going back to it) reuses the cache instead of refetching.
  const courseQuery = useQuery({
    queryKey: ['course', courseSlug],
    queryFn: () => unwrapResult(getCourse(courseSlug)),
    enabled: !!user,
  })
  const lessonsQuery = useQuery({
    queryKey: ['course', courseSlug, 'lessons'],
    queryFn: () => unwrapResult(getCourseLessons(courseSlug)),
    enabled: !!user,
  })
  const summary = lessonsQuery.data?.find((l) => l.slug === lessonSlug)
  const lessonQuery = useQuery({
    queryKey: ['lesson', summary?.id],
    queryFn: () => unwrapResult(getLesson(summary!.id)),
    enabled: !!summary,
  })
  const progressQuery = useQuery({
    queryKey: ['progress'],
    queryFn: () => unwrapResult(getMyProgress()),
    enabled: !!user,
    staleTime: 0,
  })

  const enrollMutation = useMutation({
    mutationFn: () => unwrapResult(enrollCourse(courseSlug)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      toast.success('Enrolled.')
    },
    onError: (error) => toast.error(error.message),
  })

  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login')
    }
  }, [sessionLoading, user, router])

  if (sessionLoading || !user) {
    return (
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-28">
          <LessonSkeleton />
        </section>
      </main>
    )
  }

  // A lesson slug with no matching entry in a successfully-loaded lessons
  // list is a client-detected 404 (no API call for it ever 404s), same
  // "not found" treatment as an actual API 404 from any of the queries.
  const clientNotFound = lessonsQuery.data && !summary
  const apiError = courseQuery.error ?? lessonsQuery.error ?? lessonQuery.error
  const notFound = clientNotFound || (apiError instanceof ApiError && apiError.status === 404)
  const errorMessage = clientNotFound ? 'Lesson not found' : apiError?.message

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-28">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-white">
            {notFound ? 'Lesson not found' : 'Something went wrong'}
          </h1>
          <p className="mt-3 text-sm text-[#90939A]">{errorMessage}</p>
          <Link href={`/courses/${courseSlug}`} className="mt-6 inline-block text-sm text-[#FF7A33] underline underline-offset-2">
            ← Back to course
          </Link>
        </section>
      </main>
    )
  }

  const course = courseQuery.data
  const lessons = lessonsQuery.data
  const lesson = lessonQuery.data

  if (!course || !lesson || !lessons) {
    return (
      <main className="min-h-screen bg-[#0B0B0D]">
        <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-28">
          <LessonSkeleton />
        </section>
      </main>
    )
  }

  const ordered = orderLessons(lessons)
  const currentIndex = ordered.findIndex((l) => l.slug === lessonSlug)
  const nextLesson = currentIndex >= 0 ? ordered[currentIndex + 1] : undefined

  const isEnrolled = progressQuery.data?.enrollments.some((e) => e.courseSlug === courseSlug) ?? false
  const isCompleted = progressQuery.data?.lessonProgress.some((p) => p.lessonId === lesson.id && p.status === 'completed') ?? false
  const completedLessonIds = new Set(
    (progressQuery.data?.lessonProgress ?? [])
      .filter((p) => p.courseSlug === courseSlug && p.status === 'completed')
      .map((p) => p.lessonId)
  )

  return (
    <main className="min-h-screen bg-[#0B0B0D]">
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
        <Link href={`/courses/${courseSlug}`} className="text-xs uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white">
          ← {course.title}
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr]">
          <div className="order-2 md:sticky md:top-24 md:order-1 md:self-start">
            <CourseTreeRail
              courseSlug={courseSlug}
              lessons={lessons}
              completedLessonIds={completedLessonIds}
              currentLessonSlug={lessonSlug}
            />
          </div>

          <div className="order-1 min-w-0 md:order-2">
            <Eyebrow>{lesson.moduleTitle}</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">{lesson.title}</h1>

            <div className="mt-8">
              {!isEnrolled ? (
                <LockedLesson type={lesson.type} onEnroll={() => enrollMutation.mutate()} enrolling={enrollMutation.isPending} />
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
                    />
                  )}

                  {lesson.type !== 'quiz' && (
                    <CompletionControl
                      lessonId={lesson.id}
                      isCompleted={isCompleted}
                    />
                  )}

                  <LessonNav courseSlug={courseSlug} nextLesson={nextLesson} isCompleted={isCompleted} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function CompletionControl({
  lessonId,
  isCompleted,
}: {
  lessonId: number
  isCompleted: boolean
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const completeMutation = useMutation({
    mutationFn: () => unwrapResult(completeLesson(lessonId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      toast.success('Lesson completed.')
    },
    onError: (error) => toast.error(error.message),
  })

  if (isCompleted) {
    return (
      <p className="mt-10 border-t border-white/10 pt-6 text-sm text-[#3FB950]">✓ Completed</p>
    )
  }

  return (
    <div className="mt-10 border-t border-white/10 pt-6">
      <ActionButton onClick={() => completeMutation.mutate()} loading={completeMutation.isPending}>
        Mark complete
      </ActionButton>
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
}: {
  type: Lesson['type']
  onEnroll: () => void
  enrolling: boolean
}) {
  return (
    <div className="border border-white/10 bg-[#17181B] p-6">
      <p className="text-xs uppercase tracking-[0.1em] text-white/40">{TYPE_LABEL[type]}</p>
      <p className="mt-3 text-sm leading-6 text-[#90939A]">
        Enroll in this course to view this lesson and track your progress.
      </p>
      <div className="mt-5">
        <ActionButton onClick={onEnroll} loading={enrolling}>
          Enroll
        </ActionButton>
      </div>
    </div>
  )
}

function LessonNav({
  courseSlug,
  nextLesson,
  isCompleted,
}: {
  courseSlug: string
  nextLesson: Lesson | undefined
  isCompleted: boolean
}) {
  return (
    <div className="mt-6 flex justify-end">
      {nextLesson ? (
        isCompleted ? (
          <Link
            href={`/courses/${courseSlug}/${nextLesson.slug}`}
            className="inline-flex items-center justify-center gap-2 bg-[#FF7A33] px-5 py-3 text-sm font-semibold text-[#0D0D0D] transition-colors transition-transform duration-150 hover:bg-[#FF9459] active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A33]"
          >
            Next lesson: {nextLesson.title} →
          </Link>
        ) : (
          <Link
            href={`/courses/${courseSlug}/${nextLesson.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#FF7A33]"
          >
            Next lesson: {nextLesson.title} →
          </Link>
        )
      ) : (
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#FF7A33]"
        >
          ← Back to course
        </Link>
      )}
    </div>
  )
}

// Answer options come back from the API ordered by their fixed `position`
// (the correct one is often authored first), which would otherwise make
// the correct answer visually predictable across every quiz. Shuffled
// once per mount via Fisher-Yates and re-shuffled on retake, but never on
// every render — recomputing on each answer selection would shift options
// under the user's cursor mid-quiz.
function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Any successful attempt (any score) marks the lesson completed
// server-side, so this owns invalidating progress itself rather than
// relying on the generic CompletionControl, which the page excludes for
// quiz lessons entirely. Retakes are always allowed server-side (no
// "already attempted" gate), so the form stays interactive after
// grading too — "Retake quiz" just clears local state to answer again.
function QuizBody({
  lessonId,
  quiz,
  isCompleted,
}: {
  lessonId: number
  quiz: Quiz
  isCompleted: boolean
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<QuizAttemptResult | null>(null)
  const [shuffleSeed, setShuffleSeed] = useState(0)

  const questions = useMemo(
    () => quiz.questions.map((q) => ({ ...q, answers: shuffle(q.answers) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shuffleSeed intentionally forces a re-shuffle on retake; quiz itself is stable per lesson
    [quiz, shuffleSeed]
  )

  const attemptMutation = useMutation({
    mutationFn: (payload: { questionId: number; answerId: number }[]) => unwrapResult(attemptQuiz(lessonId, payload)),
    onSuccess: (data) => {
      setResult(data)
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
    onError: (error) => toast.error(error.message),
  })

  const resultByQuestion = new Map(result?.results.map((r) => [r.questionId, r]))
  const allAnswered = questions.every((q) => answers[q.id] !== undefined)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = questions.map((q) => ({ questionId: q.id, answerId: answers[q.id] }))
    attemptMutation.mutate(payload)
  }

  function handleRetake() {
    setResult(null)
    setAnswers({})
    setShuffleSeed((s) => s + 1)
  }

  return (
    <div>
      {isCompleted && !result && (
        <p className="mb-6 text-sm text-[#3FB950]">✓ Completed — you can retake this quiz anytime.</p>
      )}

      {result && (
        <div className="mb-6 border border-white/10 bg-[#17181B] p-6">
          <p className="text-2xl font-bold tracking-[-0.03em] text-white">
            {result.score}/{result.total}
          </p>
          <p className="mt-1 text-sm text-[#90939A]">
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
        {questions.map((question, qi) => {
          const questionResult = resultByQuestion.get(question.id)

          return (
            <fieldset key={question.id} className="border border-white/10 bg-[#17181B] p-6">
              <legend className="mb-4 text-sm leading-6 text-white">
                {qi + 1}. {question.prompt}
              </legend>
              <div className="flex flex-col gap-2">
                {question.answers.map((answer) => {
                  const selected = answers[question.id] === answer.id
                  const isCorrectAnswer = questionResult?.correctAnswerId === answer.id
                  const isSelectedWrong = Boolean(questionResult) && selected && !questionResult?.correct

                  let optionClass = 'border-white/15 hover:border-white/40'
                  let indicatorClass = selected ? 'border-[#FF7A33] bg-[#FF7A33]' : 'border-white/30'
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
                    optionClass = 'border-[#FF7A33] bg-[#FF7A33]/10'
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
                        disabled={Boolean(questionResult) || attemptMutation.isPending}
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
          <AuthSubmitButton loading={attemptMutation.isPending} disabled={!allAnswered}>
            Submit quiz
          </AuthSubmitButton>
        )}
      </form>
    </div>
  )
}

function LessonSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr]">
      <Skeleton className="h-48" />
      <div className="min-w-0">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-8 w-64 max-w-full" />
        <Skeleton className="mt-8 h-40" />
      </div>
    </div>
  )
}
