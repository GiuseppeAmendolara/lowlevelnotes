'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStaffCourses, type StaffPendingCourse, type StaffCourseStatus } from '@/lib/authClient'
import { SectionHeading, StatusFilter } from '@/components/admin/shared'

const STATUS_OPTIONS: StaffCourseStatus[] = ['pending', 'published', 'draft']

export default function CourseRequestsPanel() {
  const [status, setStatus] = useState<StaffCourseStatus>('pending')
  const [courses, setCourses] = useState<StaffPendingCourse[] | null>(null)

  function load() {
    return getStaffCourses(status).then((result) => {
      if (result.ok) setCourses(result.data)
    })
  }

  useEffect(() => {
    load()
  }, [status])

  return (
    <div>
      <SectionHeading>Course requests</SectionHeading>

      <StatusFilter status={status} options={STATUS_OPTIONS} onChange={setStatus} />

      <div className="mt-4 border-l border-t border-white/10">
        {courses === null && <p className="border-b border-r border-white/10 bg-[#0D0D0D] p-4 text-sm text-[#A1A1AA] animate-pulse motion-reduce:animate-none">Loading…</p>}
        {courses?.length === 0 && <p className="border-b border-r border-white/10 bg-[#0D0D0D] p-4 text-sm text-[#A1A1AA]">Nothing here.</p>}
        {courses?.map((c) => (
          <Link
            key={c.id}
            href={`/approval/course-requests/${c.id}`}
            className="block border-b border-r border-white/10 bg-[#0D0D0D] p-4 transition-colors hover:bg-white/[0.03]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-white">{c.title}</span>
                <span className="ml-2 text-xs text-[#A1A1AA]">{c.instructorEmail}</span>
                {c.category && <span className="ml-2 text-xs uppercase tracking-[0.1em] text-[#FF8A3D]">{c.category}</span>}
              </div>
              <span className="text-xs text-white/50">Review →</span>
            </div>
            {c.description && <p className="mt-2 text-sm text-[#A1A1AA]">{c.description}</p>}
            {c.rejectionReason && <p className="mt-2 text-xs text-[#F85149]">Rejected: {c.rejectionReason}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}
